<script lang="ts">
  import { createMutation, createQuery } from "@tanstack/svelte-query"
  import { Button } from "$lib/components/ui/button/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import * as Avatar from "$lib/components/ui/avatar/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js"
  import { Skeleton } from "$lib/components/ui/skeleton/index.js"
  import { Bot, Send, Sparkles, User } from "@lucide/svelte"
  import { parseSSEStream, sendChatMessage, type ChatMessage } from "$lib/api/chat.js"

  let input = $state("")
  let messages = $state<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your opencode assistant. Ask me anything.",
      createdAt: Date.now(),
    },
  ])
  let streaming = $state(false)
  let viewportRef = $state<HTMLElement | null>(null)

  const health = createQuery(() => ({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("/api/health")
      if (!res.ok) throw new Error("Health check failed")
      return res.json() as Promise<{ status: string }>
    },
  }))

  const chatMutation = createMutation(() => ({
    mutationFn: async (nextMessages: ChatMessage[]) => {
      const stream = await sendChatMessage(nextMessages)
      let acc = ""
      const assistantId = crypto.randomUUID()
      messages = [...messages, { id: assistantId, role: "assistant", content: "", createdAt: Date.now() }]
      streaming = true
      await parseSSEStream(stream, (delta) => {
        acc += delta
        messages = messages.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
        viewportRef?.scrollTo({ top: viewportRef.scrollHeight, behavior: "smooth" })
      })
      streaming = false
      return acc
    },
  }))

  let canSend = $derived(input.trim().length > 0 && !streaming && !chatMutation.isPending)

  function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (!canSend) return
    const content = input.trim()
    input = ""
    const next: ChatMessage[] = [...messages, { id: crypto.randomUUID(), role: "user", content, createdAt: Date.now() }]
    messages = next
    queueMicrotask(() => viewportRef?.scrollTo({ top: viewportRef.scrollHeight, behavior: "smooth" }))
    chatMutation.mutate(next)
  }
</script>

<div class="bg-background min-h-screen">
  <header class="bg-card/50 sticky top-0 z-10 border-b backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="bg-primary text-primary-foreground grid size-8 place-items-center rounded-md">
          <Sparkles class="size-4" />
        </div>
        <div>
          <h1 class="text-sm font-semibold tracking-tight">opencode web</h1>
          <p class="text-muted-foreground text-xs">SvelteKit · TanStack Query · shadcn-svelte · Netlify</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Badge variant={health.isError ? "destructive" : "secondary"} class="capitalize">
          {health.isPending ? "checking" : health.isError ? "offline" : "online"}
        </Badge>
        <Button variant="outline" size="sm" onclick={() => health.refetch()}>Refetch</Button>
      </div>
    </div>
  </header>

  <main class="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
    <Card.Root class="flex min-h-140 flex-col overflow-hidden">
      <Card.Header class="pb-3">
        <Card.Title class="flex items-center gap-2 text-base">
          <Bot class="size-4" /> Chat
        </Card.Title>
        <Card.Description
          >Streaming via TanStack Mutation + SSE. Replace /api/chat with your AI endpoint.</Card.Description
        >
      </Card.Header>
      <Separator />
      <ScrollArea class="flex-1" {viewportRef}>
        <div class="space-y-4 p-4">
          {#each messages as m (m.id)}
            <div class="flex gap-3 {m.role === 'user' ? 'justify-end' : 'justify-start'}">
              {#if m.role === "assistant"}
                <Avatar.Root size="sm" class="bg-muted">
                  <Avatar.Fallback><Bot class="size-4" /></Avatar.Fallback>
                </Avatar.Root>
              {/if}
              <div
                class="max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-6 shadow-xs {m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'}"
              >
                {#if m.content}
                  {m.content}
                {:else if streaming && m.role === "assistant"}
                  <span class="inline-flex gap-1">
                    <Skeleton class="h-3 w-12" />
                  </span>
                {:else}
                  <span class="text-muted-foreground">…</span>
                {/if}
              </div>
              {#if m.role === "user"}
                <Avatar.Root size="sm" class="bg-primary text-primary-foreground">
                  <Avatar.Fallback><User class="size-4" /></Avatar.Fallback>
                </Avatar.Root>
              {/if}
            </div>
          {/each}
          {#if chatMutation.isPending && !streaming}
            <div class="flex gap-3">
              <Avatar.Root size="sm" class="bg-muted"
                ><Avatar.Fallback><Bot class="size-4" /></Avatar.Fallback></Avatar.Root
              >
              <Skeleton class="h-10 w-40 rounded-2xl" />
            </div>
          {/if}
        </div>
      </ScrollArea>
      <Separator />
      <form class="flex gap-2 p-3" onsubmit={onSubmit}>
        <Textarea
          bind:value={input}
          placeholder="Ask anything… (Shift+Enter for newline)"
          class="min-h-11 flex-1 resize-none"
          rows={1}
          onkeydown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              ;(e.currentTarget.form as HTMLFormElement)?.requestSubmit()
            }
          }}
        />
        <Button type="submit" disabled={!canSend} size="icon" aria-label="Send">
          <Send class="size-4" />
        </Button>
      </form>
    </Card.Root>

    <div class="space-y-4">
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-sm">How it works</Card.Title>
          <Card.Description>TanStack Query for AI streaming</Card.Description>
        </Card.Header>
        <Card.Content class="text-muted-foreground space-y-2 text-sm leading-6">
          <p>
            <code class="bg-muted rounded px-1 py-0.5">createMutation</code> posts to
            <code class="bg-muted rounded px-1">/api/chat</code>
            and streams SSE chunks into Svelte 5 <code class="bg-muted rounded px-1">$state</code>.
          </p>
          <p>
            Swap in <code class="bg-muted rounded px-1">ai</code> SDK or your opencode server endpoint. See
            <code class="bg-muted rounded px-1">src/lib/api/chat.ts</code>.
          </p>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Title class="text-sm">Quick prompts</Card.Title>
        </Card.Header>
        <Card.Content class="flex flex-wrap gap-2">
          {#each ["Explain Svelte 5 runes", "Design a pricing page", "Write a TanStack Query example"] as p (p)}
            <Button
              variant="outline"
              size="sm"
              onclick={() => {
                input = p
              }}>{p}</Button
            >
          {/each}
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Title class="text-sm">Stack</Card.Title>
        </Card.Header>
        <Card.Content class="text-sm">
          <div class="flex flex-wrap gap-1.5">
            <Badge variant="secondary">Svelte 5</Badge>
            <Badge variant="secondary">SvelteKit</Badge>
            <Badge variant="secondary">TanStack Query 6</Badge>
            <Badge variant="secondary">shadcn-svelte</Badge>
            <Badge variant="secondary">Bits UI</Badge>
            <Badge variant="secondary">Lucide</Badge>
            <Badge variant="secondary">adapter-netlify</Badge>
          </div>
          <div class="mt-3 flex gap-2">
            <Input placeholder="Project name" class="h-8" />
            <Button size="sm" variant="secondary">Save</Button>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </main>
</div>
