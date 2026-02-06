import { enforceRateLimit, parseJsonWithLimit } from "./utils.js";

const MAX_PAYLOAD_BYTES = 10 * 1024;
const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 200;
const MAX_PHONE_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGE_WORDS = 500;

function countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const rateLimit = await enforceRateLimit({
            request,
            env,
            keyPrefix: "contact",
            limit: 10,
            windowSeconds: 600
        });

        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        const payloadResult = await parseJsonWithLimit(request, MAX_PAYLOAD_BYTES);
        if (payloadResult.error) {
            const status = payloadResult.error === "Payload too large." ? 413 : 400;
            return new Response(
                JSON.stringify({ success: false, error: payloadResult.error }),
                { status, headers: { "Content-Type": "application/json" } }
            );
        }

        const body = payloadResult.data || {};

        const name = (body.name || "").trim();
        const email = (body.email || "").trim();
        const phone = (body.phone || "").trim();
        const message = (body.message || "").trim();

        if (!name || !email || !phone || !message) {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid submission." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (
            name.length > MAX_NAME_LENGTH ||
            email.length > MAX_EMAIL_LENGTH ||
            phone.length > MAX_PHONE_LENGTH ||
            message.length > MAX_MESSAGE_LENGTH
        ) {
            return new Response(
                JSON.stringify({ success: false, error: "Input exceeds allowed length." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (countWords(message) > MAX_MESSAGE_WORDS) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Message exceeds ${MAX_MESSAGE_WORDS} words.`
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        /* ================= STORE LEAD ================= */

        const id = crypto.randomUUID();
        const record = {
            id,
            name,
            email,
            phone,
            message,
            timestamp: new Date().toISOString()
        };

        await env.CONTACT_LEADS.put(id, JSON.stringify(record));

        /* ================= SEND EMAIL (RESEND) ================= */

        const emailBody = `
New contact lead received on IndiaGPT

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

Time: ${record.timestamp}
        `.trim();

        const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: `IndiaGPT Leads <${env.MAIL_FROM_EMAIL}>`,
                to: [env.ADMIN_EMAIL],
                reply_to: email,
                subject: "New Contact Lead – IndiaGPT",
                text: emailBody
            })
        });

        if (!resendRes.ok) {
            const err = await resendRes.text();
            console.error("Resend error:", err);

            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Email sending failed"
                }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("Contact API error:", err);
        return new Response(
            JSON.stringify({ success: false, error: "Server error" }),
            { status: 500 }
        );
    }
}
