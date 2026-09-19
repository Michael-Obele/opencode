import { env } from "$env/dynamic/private"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request, fetch }) => {
  const body = await request.text()

  // Env-driven upstream URL — set OPENCODE_API_URL in Netlify dashboard
  // e.g. OPENCODE_API_URL=https://your-opencode-server.example.com
  const rawUpstream =
    (env as Record<string, string | undefined>).OPENCODE_API_URL ??
    (env as Record<string, string | undefined>).AI_API_URL ??
    (env as Record<string, string | undefined>).PUBLIC_OPENCODE_API_URL
  const upstream = rawUpstream?.replace(/\/$/, "")

  if (!upstream) {
    return new Response(
      JSON.stringify({ error: "Missing OPENCODE_API_URL (or AI_API_URL) env. Set it in Netlify dashboard." }),
      { status: 500, headers: { "content-type": "application/json" } },
    )
  }

  // Proxy to upstream — supports both /api/chat and /chat style upstreams
  // Try /api/chat first, fall back to /chat if upstream already includes path
  const target = upstream.endsWith("/api/chat") || upstream.endsWith("/chat") ? upstream : `${upstream}/api/chat`

  const upstreamRes = await fetch(target, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      // Forward auth if present (e.g. Bearer token from client)
      ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
      ...(request.headers.get("x-api-key") ? { "x-api-key": request.headers.get("x-api-key")! } : {}),
    },
    body,
  })

  if (!upstreamRes.ok || !upstreamRes.body) {
    const text = await upstreamRes.text().catch(() => "")
    return new Response(text || `Upstream error ${upstreamRes.status}`, {
      status: upstreamRes.status || 502,
      headers: { "content-type": upstreamRes.headers.get("content-type") ?? "text/plain" },
    })
  }

  // Stream through SSE / chunked response as-is
  return new Response(upstreamRes.body, {
    status: 200,
    headers: {
      "content-type": upstreamRes.headers.get("content-type") ?? "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  })
}

export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify({ ok: true, hint: "POST { messages: ChatMessage[] } to this endpoint" }), {
    headers: { "content-type": "application/json" },
  })
}
