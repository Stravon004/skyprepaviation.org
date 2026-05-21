import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Anthropic from 'npm:@anthropic-ai/sdk@0.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const SYSTEM_PROMPT = `You are a strict but fair FAA Designated Pilot Examiner (DPE) conducting an oral portion of a practical test. Your role is to rigorously test the applicant's aeronautical knowledge.

Guidelines:
- Ask probing follow-up questions based on the applicant's specific answers
- If an answer is incomplete or incorrect, point out the gap and probe deeper
- Reference specific FARs, AIM sections, or procedures when appropriate
- Vary your tone from encouraging to challenging based on answer quality
- Keep responses concise (2-4 sentences) — you are asking the next question, not lecturing
- Never give away the correct answer; guide the applicant to think harder
- If an answer is dangerously wrong (e.g., incorrect emergency procedure), firmly correct it
- End every response with a clear follow-up question`;

const SCENARIO_CONTEXT: Record<string, string> = {
  preflight: 'Focus on pre-flight planning: weight & balance, weather briefing, NOTAMs, fuel requirements under FAR 91, flight planning, alternate requirements.',
  weather: 'Focus on aviation weather: METARs, TAFs, SIGMETs, AIRMETs, frontal systems, thunderstorms, icing, turbulence, fog formation.',
  emergencies: 'Focus on emergency procedures: engine failures, forced landings, electrical failures, fires, loss of communications, incapacitation.',
  airspace: 'Focus on airspace: Class A/B/C/D/E/G dimensions, VFR weather minimums, equipment requirements, TFRs, special use airspace, FARs.',
  navigation: 'Focus on navigation: dead reckoning, pilotage, VOR/DME, GPS, ILS approaches, lost procedures, diversion techniques.',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { scenario, messages } = await req.json() as {
      scenario: string;
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!scenario || !messages?.length) {
      return Response.json({ error: 'Missing scenario or messages' }, { status: 400, headers: corsHeaders });
    }

    const scenarioContext = SCENARIO_CONTEXT[scenario] ?? '';
    const systemPrompt = `${SYSTEM_PROMPT}\n\nScenario context: ${scenarioContext}`;

    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('oral-sim error:', err);
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
