import { enforceRateLimit, parseJsonWithLimit } from "./utils.js";

const MAX_PAYLOAD_BYTES = 6 * 1024;
const MAX_MESSAGE_LENGTH = 500;
const MAX_WORDS = 100;

function countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const rateLimit = await enforceRateLimit({
            request,
            env,
            keyPrefix: "chat",
            limit: 30,
            windowSeconds: 300
        });

        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        const payloadResult = await parseJsonWithLimit(request, MAX_PAYLOAD_BYTES);
        if (payloadResult.error) {
            const status = payloadResult.error === "Payload too large." ? 413 : 400;
            return new Response(
                JSON.stringify({ reply: payloadResult.error }),
                { status, headers: { "Content-Type": "application/json" } }
            );
        }

        const requestData = payloadResult.data || {};
        const body = requestData || {};
        const userMessageRaw = (body.message || "").trim();

        if (!userMessageRaw) {
            return new Response(
                JSON.stringify({ reply: "Please enter a message." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (userMessageRaw.length > MAX_MESSAGE_LENGTH) {
            return new Response(
                JSON.stringify({ reply: "Message is too long." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (countWords(userMessageRaw) > MAX_WORDS) {
            return new Response(
                JSON.stringify({ reply: `Please keep your message under ${MAX_WORDS} words.` }),
                { status: 400, headers: { "Content-Type": "application/json" } }
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
- For any detailed information ask fill contact form.
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
                max_tokens: 200
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

        // Parse model response and fall back to a helpful default reply.
        const grokPayload = await response.json();
        const reply =
            grokPayload?.choices?.[0]?.message?.content ||
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
