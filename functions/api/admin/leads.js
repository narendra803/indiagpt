export async function onRequestGet(context) {
    const { request, env } = context;

    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const list = await env.CONTACT_LEADS.list({ limit: 1000 });
    const leads = [];

    for (const key of list.keys) {
        const value = await env.CONTACT_LEADS.get(key.name);
        if (value) leads.push(JSON.parse(value));
    }

    // newest first
    leads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify(leads), {
        headers: { "Content-Type": "application/json" }
    });
}
