export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();

        const name = (body.name || "").trim();
        const email = (body.email || "").trim();
        const phone = (body.phone || "").trim();
        const message = (body.message || "").trim();

        if (!name || !email || !phone || !message) {
            return new Response(
                JSON.stringify({ success: false, error: "All fields are required." }),
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

        await env.CONTACT_LEADS.put(id, JSON.stringify(record));

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
