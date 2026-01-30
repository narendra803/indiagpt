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
