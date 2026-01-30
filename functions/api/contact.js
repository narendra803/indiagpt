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

        /* Store lead */
        await env.CONTACT_LEADS.put(id, JSON.stringify(record));

        /* Call Worker for email */
        await fetch(env.MAILER_WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email,
                phone,
                message,
                adminEmail: env.ADMIN_EMAIL
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
