const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Handle CORS preflight
 */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Handle POST /api/chat
 */
export async function onRequestPost({ request, env }) {

  // 🔐 Verify secret exists
  if (!env.GROK_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROK_API_KEY missing" }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const grokRes = await fetch(
      "https://api.x.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-4-fast",
          messages: [
            { role: "system", content: "You are IndiaGPT. Be concise." },
            { role: "user", content: message }
          ],
          temperature: 0.6,
          max_tokens: 200
        })
      }
    );

    if (!grokRes.ok) {
      const errText = await grokRes.text();
      return new Response(
        JSON.stringify({ error: "Grok API error", details: errText }),
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await grokRes.json();
    const reply = data.choices?.[0]?.message?.content ?? "No reply";

    return new Response(
      JSON.stringify({ reply }),
      { headers: corsHeaders }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
