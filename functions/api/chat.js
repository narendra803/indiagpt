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

        const userMessage = userMessageRaw.toLowerCase();

        /**
         * ==========================================
         * 1️⃣ FAQ CACHE (ZERO COST RESPONSES)
         * ==========================================
         */
        const FAQ_CACHE = [
            {
                keywords: ["services", "what do you do", "what services"],
                reply:
                    "IndiaGPT provides website creation, AI chatbots for businesses, business automation, and digital transformation solutions for small businesses."
            },
            {
                keywords: ["website", "web development", "site"],
                reply:
                    "We build fast, secure, and professional business websites, including company sites, landing pages, and service websites."
            },
            {
                keywords: ["chatbot", "ai chatbot", "bot"],
                reply:
                    "IndiaGPT builds AI chatbots for customer support, FAQs, lead generation, and business automation, customized for your needs."
            },
            {
                keywords: ["automation", "workflow", "process"],
                reply:
                    "We help automate repetitive business workflows like forms, reports, notifications, and approvals to save time and reduce errors."
            },
            {
                keywords: ["pricing", "cost", "price", "charges"],
                reply:
                    "Our pricing depends on your requirements and project scope. We focus on affordable solutions for small businesses. Would you like to discuss your needs?"
            },
            {
                keywords: ["contact", "reach", "talk", "call"],
                reply:
                    "You can use this chat to talk to us about your requirements, and we’ll guide you on the next steps."
            }
        ];

        for (const faq of FAQ_CACHE) {
            if (faq.keywords.some(k => userMessage.includes(k))) {
                return new Response(
                    JSON.stringify({ reply: faq.reply }),
                    { headers: { "Content-Type": "application/json" } }
                );
            }
        }

        /**
         * ==========================================
         * 2️⃣ PRE-FILTER (NO API COST)
         * ==========================================
         */
        const blockedPatterns = [
            /who is/i,
            /what is/i,
            /capital of/i,
            /prime minister/i,
            /president/i,
            /math/i,
            /code/i,
            /python/i,
            /java/i,
            /javascript/i,
            /politics/i,
            /religion/i,
            /history/i,
            /movie/i,
            /song/i,
            /cricket/i,
            /ipl/i,
            /stock/i,
            /crypto/i
        ];

        for (const pattern of blockedPatterns) {
            if (pattern.test(userMessageRaw)) {
                return new Response(
                    JSON.stringify({
                        reply:
                            "I’m here to help only with IndiaGPT services like website creation, AI chatbots, and business automation. Would you like to know how we can help your business?"
                    }),
                    { headers: { "Content-Type": "application/json" } }
                );
            }
        }

        /**
         * ==========================================
         * 3️⃣ OPTIMIZED SYSTEM PROMPT
         * ==========================================
         */
        const systemPrompt = `
You are IndiaGPT Support Assistant.

RULES (STRICT):
- You are NOT a general AI.
- Answer ONLY about IndiaGPT services:
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
         * 4️⃣ GROK API CALL (PAID, CONTROLLED)
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
