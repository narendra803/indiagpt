export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userMessageRaw = (body.message || "").trim();

        if (!userMessageRaw) {
            return new Response(
                JSON.stringify({ reply: "Please enter a message." }),
                { status: 400 }
            );
        }

        /**
         * ==========================================
         * 1️⃣ OPTIMIZED SYSTEM PROMPT
         * ==========================================
         */
        const systemPrompt = `
You are IndiaGPT.in Support Assistant.

RULES (STRICT):
- Keep your answer short.
- You are NOT a general AI.
- For any detailed information ask feel contact form.
- Answer ONLY about IndiaGPT.in services:
  • Website creation
  • AI chatbots for businesses
  • Business automation
  • Digital transformation for small businesses
- If a question is outside this scope, politely refuse and redirect.

TONE:
Professional, friendly, and concise.
`;

        /**
         * ==========================================
         * 2️⃣ GROK API CALL (PAID, CONTROLLED)
         * ==========================================
         */
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-4-fast",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessageRaw }
                ],
                temperature: 0.2,
                max_tokens: 120
            })
        });

        if (!response.ok) {
            console.error("Grok API error:", await response.text());
            return new Response(
                JSON.stringify({
                    reply: "Server error. Please try again later."
                }),
                { status: 500 }
            );
        }

        const data = await response.json();
        const reply =
            data?.choices?.[0]?.message?.content ||
            "I can help you with IndiaGPT services like websites, AI chatbots, and automation.";

        return new Response(
            JSON.stringify({ reply }),
            { headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Chat function error:", error);
        return new Response(
            JSON.stringify({
                reply: "Something went wrong. Please try again later."
            }),
            { status: 500 }
        );
    }
}
