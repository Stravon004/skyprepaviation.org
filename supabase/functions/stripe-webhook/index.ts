import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'SkyPrep Aviation',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${message}`);
      return new Response(`Webhook signature verification failed: ${message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing webhook:', error);
    return Response.json({ error: message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) return;
  if (!('customer' in stripeData)) return;

  // Skip one-time payment intents that aren't attached to invoices
  if (event.type === 'payment_intent.succeeded' && (event.data.object as Stripe.PaymentIntent).invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData as { customer: string };

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
    return;
  }

  let isSubscription = true;

  if (event.type === 'checkout.session.completed') {
    const { mode } = stripeData as Stripe.Checkout.Session;
    isSubscription = mode === 'subscription';
  }

  const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

  if (isSubscription) {
    await syncCustomerFromStripe(customerId);
  } else if (mode === 'payment' && payment_status === 'paid') {
    try {
      const {
        id: checkout_session_id,
        payment_intent,
        amount_subtotal,
        amount_total,
        currency,
      } = stripeData as Stripe.Checkout.Session;

      const { error: orderError } = await supabase.from('stripe_orders').insert({
        checkout_session_id,
        payment_intent_id: payment_intent,
        customer_id: customerId,
        amount_subtotal,
        amount_total,
        currency,
        payment_status,
        status: 'completed',
      });

      if (orderError) {
        console.error('Error inserting order:', orderError);
      }
    } catch (error) {
      console.error('Error processing one-time payment:', error);
    }
  }
}

async function syncCustomerFromStripe(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // Look up user_id from stripe_customers
    const { data: customerRow } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (subscriptions.data.length === 0) {
      await supabase.from('stripe_subscriptions').upsert(
        { customer_id: customerId, subscription_status: 'not_started' },
        { onConflict: 'customer_id' },
      );

      // Revert profile tier when no active subscription
      if (customerRow?.user_id) {
        await supabase
          .from('profiles')
          .update({ subscription_tier: 'free', subscription_expires_at: null })
          .eq('id', customerRow.user_id);
      }
      return;
    }

    const subscription = subscriptions.data[0];

    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: (subscription.default_payment_method as Stripe.PaymentMethod).card?.brand ?? null,
              payment_method_last4: (subscription.default_payment_method as Stripe.PaymentMethod).card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      { onConflict: 'customer_id' },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }

    // Keep profiles.subscription_tier in sync so feature gating works
    if (customerRow?.user_id) {
      const plan = subscription.metadata?.plan ?? null;
      const isActive = subscription.status === 'active' || subscription.status === 'trialing';
      const tier = isActive && (plan === 'basic' || plan === 'pro') ? plan : 'free';
      const expiresAt = isActive
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

      await supabase
        .from('profiles')
        .update({ subscription_tier: tier, subscription_expires_at: expiresAt })
        .eq('id', customerRow.user_id);
    }

    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
