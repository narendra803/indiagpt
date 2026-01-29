export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();

        const { name, email, phone, message } = body;

        if (!name || !email || !phone || !message) {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid submission." }),
                { status: 400 }
            );
        }

        const id = crypto.randomUUID();
        const record = {
            id,
            name,
            email,
            phone,
            message,
            timestamp: new Date().toISOString()
        };

        /* ================= STORE LEAD ================= */
        await env.CONTACT_LEADS.put(id, JSON.stringify(record));

        /* ================= EMAIL NOTIFICATION ================= */

        const fromEmail =
            env.MAIL_FROM_EMAIL || "no-reply@cloudflareworkers.com";

        const replyToEmail =
            env.MAIL_REPLY_TO || email; // fallback to user email

        const emailBody = `
New contact lead received on IndiaGPT

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

Time: ${record.timestamp}
        `.trim();

        await fetch("https://api.mailchannels.net/tx/v1/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                personalizations: [
                    { to: [{ email: env.ADMIN_EMAIL }] }
                ],
                from: {
                    email: fromEmail,
                    name: "IndiaGPT Leads"
                },
                reply_to: {
                    email: replyToEmail
                },
                subject: "New Contact Lead – IndiaGPT",
                content: [
                    { type: "text/plain", value: emailBody }
                ]
            })
        });

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("Contact error:", err);
        return new Response(
            JSON.stringify({ success: false, error: "Server error" }),
            { status: 500 }
        );
    }
}
