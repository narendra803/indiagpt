import { isAuthorizedAdmin } from "./api/utils.js";

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) {
        return next();
    }

    const authHeader = request.headers.get("Authorization") || "";
    const isAuthorized = isAuthorizedAdmin(authHeader, env.ADMIN_TOKEN);

    if (isAuthorized) {
        return next();
    }

    if (path.startsWith("/admin")) {
        return new Response("Unauthorized", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"'
            }
        });
    }

    return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
    );
}
