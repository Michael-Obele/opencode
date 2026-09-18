export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: number
}

export async function sendChatMessage(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`Chat failed: ${res.status}`)
  return res.body
}

export function parseSSEStream(stream: ReadableStream<Uint8Array>, onChunk: (text: string) => void) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  const pump = async () => {
    const { done, value } = await reader.read()
    if (done) return
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""
    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith("data:")) continue
      const data = line.slice(5).trim()
      if (data === "[DONE]") return
      try {
        const json = JSON.parse(data) as { text?: string; delta?: string }
        const delta = json.text ?? json.delta ?? ""
        if (delta) onChunk(delta)
      } catch {
        // ignore malformed chunk
      }
    }
    await pump()
  }

  return pump()
}
