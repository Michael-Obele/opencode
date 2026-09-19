<script lang="ts">
  import { page } from "$app/stores"
  import { goto } from "$app/navigation"
  import { createQuery, createMutation, useQueryClient } from "@tanstack/svelte-query"
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js"
  import { Skeleton } from "$lib/components/ui/skeleton/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import { Button } from "$lib/components/ui/button/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import { SessionHeader, MessageTimeline, SessionComposer } from "$lib/components/session/index.js"
  import { fetchSession, fetchMessages, sendMessage, type SessionMessage } from "$lib/api/session.js"
  import { toast } from "svelte-sonner"
  import { ArrowDown } from "@lucide/svelte"

  let sessionId = $derived($page.params.id ?? "")

  const queryClient = useQueryClient()

  const sessionQuery = createQuery(() => ({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId),
    enabled: !!sessionId,
  }))

  const messagesQuery = createQuery(() => ({
    queryKey: ["messages", sessionId],
    queryFn: () => fetchMessages(sessionId),
    enabled: !!sessionId,
  }))

  let composerValue = $state("")
  let localMessages = $state<SessionMessage[] | null>(null)
  let viewportEl = $state<HTMLElement | null>(null)
  let showJump = $state(false)

  let messages = $derived(localMessages ?? messagesQuery.data ?? [])
  let isArchived = $derived(sessionQuery.data?.status === "archived")

  // keep localMessages in sync when server data arrives (unless user has sent locally)
  $effect(() => {
    if (messagesQuery.data && localMessages === null) {
      // nothing — derived handles it
    }
  })

  function scrollToBottom(smooth = true) {
    if (!viewportEl) return
    viewportEl.scrollTo({ top: viewportEl.scrollHeight, behavior: smooth ? "smooth" : "instant" })
  }

  function onViewportScroll() {
    if (!viewportEl) return
    const { scrollTop, scrollHeight, clientHeight } = viewportEl
    const nearBottom = scrollHeight - scrollTop - clientHeight < 120
    showJump = !nearBottom
  }

  $effect(() => {
    // auto-scroll when messages change
    void messages.length
    queueMicrotask(() => scrollToBottom(true))
  })

  const sendMutation = createMutation(() => ({
    mutationFn: async (content: string) => {
      // optimistic user message
      const userMsg: SessionMessage = {
        id: `local_${Date.now()}`,
        role: "user",
        content,
        createdAt: Date.now(),
      }
      const base = localMessages ?? messagesQuery.data ?? []
      localMessages = [...base, userMsg]
      queueMicrotask(() => scrollToBottom(true))

      const reply = await sendMessage(sessionId, content)
      localMessages = [...(localMessages ?? []), reply]
      queueMicrotask(() => scrollToBottom(true))
      return reply
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", sessionId] })
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] })
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Failed to send message")
    },
  }))

  function handleSend(text: string) {
    composerValue = ""
    sendMutation.mutate(text)
  }

  function handleStop() {
    toast.info("Stop — wire to abort controller for real streaming")
  }
</script>

<svelte:head>
  <title>{sessionQuery.data?.title ?? "Session"} — opencode web</title>
</svelte:head>

<div class="bg-background flex h-screen flex-col">
  {#if sessionQuery.isPending}
    <div class="border-b px-4 py-3">
      <Skeleton class="h-5 w-64" />
      <Skeleton class="mt-2 h-3 w-96" />
    </div>
    <div class="flex flex-1 items-center justify-center">
      <p class="text-muted-foreground text-sm">Loading session…</p>
    </div>
  {:else if sessionQuery.isError}
    <div class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p class="text-destructive text-sm font-medium">Failed to load session</p>
      <p class="text-muted-foreground text-xs font-mono break-all">{sessionId}</p>
      <p class="text-muted-foreground text-xs">{String(sessionQuery.error)}</p>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" onclick={() => sessionQuery.refetch()}>Retry</Button>
        <Button variant="ghost" size="sm" onclick={() => goto("/session")}>Back to sessions</Button>
      </div>
    </div>
  {:else if sessionQuery.data}
    <SessionHeader session={sessionQuery.data} onBack={() => goto("/session")} />

    <div class="flex min-h-0 flex-1 flex-col">
      <!-- timeline -->
      <div class="relative flex min-h-0 flex-1 flex-col">
        <ScrollArea viewportRef={viewportEl} class="flex-1" orientation="vertical">
          <div bind:this={viewportEl} onscroll={onViewportScroll} class="mx-auto max-w-3xl px-4 py-6">
            <MessageTimeline {messages} loading={messagesQuery.isPending && !localMessages} />
          </div>
        </ScrollArea>

        {#if showJump}
          <div class="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button
              variant="secondary"
              size="sm"
              class="pointer-events-auto shadow-lg rounded-full"
              onclick={() => scrollToBottom(true)}
            >
              <ArrowDown class="size-4" /> Jump to bottom
            </Button>
          </div>
        {/if}
      </div>

      <Separator />

      <!-- composer -->
      <div class="bg-card/40 supports-backdrop-filter:bg-card/60 border-t backdrop-blur">
        <div class="mx-auto max-w-3xl px-4 py-3">
          <SessionComposer
            bind:value={composerValue}
            sending={sendMutation.isPending}
            disabled={isArchived}
            onSend={handleSend}
            onStop={handleStop}
          />
          {#if isArchived}
            <p class="text-muted-foreground mt-2 text-center text-xs">This session is archived and read-only.</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
