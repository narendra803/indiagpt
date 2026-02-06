const DEFAULT_MAX_PAYLOAD_BYTES = 10 * 1024;

export function getClientIp(request) {
    const cfIp = request.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp;
    const forwarded = request.headers.get("x-forwarded-for");
    if (!forwarded) return "";
    return forwarded.split(",")[0].trim();
}

export async function parseJsonWithLimit(request, maxBytes = DEFAULT_MAX_PAYLOAD_BYTES) {
    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > maxBytes) {
        return { error: "Payload too large." };
    }

    const bodyText = await request.text();
    if (bodyText.length > maxBytes) {
        return { error: "Payload too large." };
    }

    try {
        return { payload: JSON.parse(bodyText) };
    } catch (error) {
        return { error: "Invalid JSON payload." };
    }
}

export async function enforceRateLimit({
    request,
    env,
    keyPrefix,
    limit,
    windowSeconds
}) {
    if (!env?.RATE_LIMITS) {
        return { allowed: true, skipped: true };
    }

    const ip = getClientIp(request);
    if (!ip) {
        return { allowed: true, skipped: true };
    }

    const key = `${keyPrefix}:${ip}`;
    const existing = await env.RATE_LIMITS.get(key);
    const count = existing ? Number(existing) : 0;

    if (count >= limit) {
        return {
            allowed: false,
            response: new Response(
                JSON.stringify({ error: "Too many requests. Please try again later." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            )
        };
    }

    await env.RATE_LIMITS.put(key, String(count + 1), { expirationTtl: windowSeconds });
    return { allowed: true, skipped: false };
}

export function isAuthorizedAdmin(authHeader, adminToken) {
    if (!authHeader || !adminToken) return false;

    if (authHeader.startsWith("Bearer ")) {
        return authHeader === `Bearer ${adminToken}`;
    }

    if (authHeader.startsWith("Basic ")) {
        const encoded = authHeader.slice("Basic ".length).trim();
        try {
            const decoded = atob(encoded);
            const [username, password] = decoded.split(":");
            return username === "admin" && password === adminToken;
        } catch (error) {
            return false;
        }
    }

    return false;
}
