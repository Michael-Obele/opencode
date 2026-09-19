import { env } from "$env/dynamic/private"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ fetch }) => {
  const rawUpstream =
    (env as Record<string, string | undefined>).OPENCODE_API_URL ??
    (env as Record<string, string | undefined>).AI_API_URL ??
    (env as Record<string, string | undefined>).PUBLIC_OPENCODE_API_URL
  const upstream = rawUpstream?.replace(/\/$/, "")

  if (!upstream) {
    return new Response(JSON.stringify({ status: "no-upstream", hint: "Set OPENCODE_API_URL in env" }), {
      headers: { "content-type": "application/json" },
    })
  }

  const target = upstream.endsWith("/health") ? upstream : `${upstream}/health`
  try {
    const res = await fetch(target, { method: "GET" })
    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    })
  } catch (e) {
    return new Response(JSON.stringify({ status: "error", error: String(e) }), {
      status: 502,
      headers: { "content-type": "application/json" },
    })
  }
}
