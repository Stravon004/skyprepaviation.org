import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async () => {
  return new Response(JSON.stringify({
    url: Deno.env.get("SUPABASE_URL"),
    anon_key: Deno.env.get("SUPABASE_ANON_KEY"),
  }), { headers: { "Content-Type": "application/json" } });
});
