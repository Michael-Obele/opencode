import { command, query } from "$app/server"
import { env } from "$env/dynamic/private"
import * as v from "valibot"

const ChatMessageSchema = v.object({
  id: v.string(),
  role: v.picklist(["user", "assistant"]),
  content: v.string(),
  createdAt: v.number(),
})

function getUpstream(): string | undefined {
  const raw =
    (env as Record<string, string | undefined>).OPENCODE_API_URL ??
    (env as Record<string, string | undefined>).AI_API_URL ??
    (env as Record<string, string | undefined>).PUBLIC_OPENCODE_API_URL
  return raw?.replace(/\/$/, "")
}

// Non-streaming health check via remote function — complements TanStack Query
export const getHealth = query(async () => {
  const upstream = getUpstream()
  if (!upstream) return { status: "no-upstream" as const, hint: "Set OPENCODE_API_URL in env" }
  const target = upstream.endsWith("/health") ? upstream : `${upstream}/health`
  try {
    const res = await fetch(target)
    const data = await res.json().catch(() => ({ status: res.ok ? "ok" : "error" }))
    return data as { status: string }
  } catch (e) {
    return { status: "error" as const, error: String(e) }
  }
})

// Non-streaming chat — for simple JSON responses (no SSE)
// For streaming, keep using src/routes/api/chat/+server.ts + TanStack Mutation
export const sendChat = command(v.object({ messages: v.array(ChatMessageSchema) }), async ({ messages }) => {
  const upstream = getUpstream()
  if (!upstream) throw new Error("Missing OPENCODE_API_URL env")
  const target = upstream.endsWith("/api/chat") || upstream.endsWith("/chat") ? upstream : `${upstream}/api/chat`
  const res = await fetch(target, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error(`Upstream ${res.status}: ${await res.text().catch(() => "")}`)
  // Try JSON first, fall back to text
  const ct = res.headers.get("content-type") ?? ""
  if (ct.includes("application/json"))
    return (await res.json()) as { content?: string; text?: string; message?: string }
  return { content: await res.text() }
})
