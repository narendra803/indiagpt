export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();

        const { name, email, phone, message, token } = body;

        if (!name || !email || !phone || !message || !token) {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid submission." }),
                { status: 400 }
            );
        }

        /* ================= TURNSTILE VERIFY ================= */
        const verifyRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${env.TURNSTILE_SECRET}&response=${token}`
            }
        );

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
            return new Response(
                JSON.stringify({ success: false, error: "Bot detected." }),
                { status: 403 }
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

        /* ================= EMAIL NOTIFICATION ================= */
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
                    email: "no-reply@indiagpt.in",
                    name: "IndiaGPT Leads"
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
