<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import { Skeleton } from "$lib/components/ui/skeleton/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import { Bot, User, Wrench, FileDiff, Brain, Copy, Check } from "@lucide/svelte"
  import { Button } from "$lib/components/ui/button/index.js"
  import { toast } from "svelte-sonner"
  import type { SessionMessage } from "$lib/api/session.js"

  let { messages, loading = false }: { messages: SessionMessage[]; loading?: boolean } = $props()

  let copiedId = $state<string | null>(null)

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    copiedId = id
    toast.success("Copied to clipboard")
    setTimeout(() => (copiedId = null), 1500)
  }

  function timeLabel(ts: number) {
    return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }
</script>

<div class="flex flex-col gap-4 py-2">
  {#if loading}
    {#each Array(3) as _, i (i)}
      <div class="flex gap-3">
        <Skeleton class="size-8 rounded-full shrink-0" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-20 w-full" />
        </div>
      </div>
    {/each}
  {:else if messages.length === 0}
    <Card.Root class="border-dashed">
      <Card.Content class="py-10 text-center">
        <p class="text-muted-foreground text-sm">No messages yet. Start the conversation below.</p>
      </Card.Content>
    </Card.Root>
  {:else}
    {#each messages as msg (msg.id)}
      {@const isUser = msg.role === "user"}
      <div class="group flex gap-3 {isUser ? 'justify-end' : ''}">
        {#if !isUser}
          <Avatar.Root size="sm" class="bg-primary text-primary-foreground shrink-0">
            <Avatar.Fallback class="bg-primary text-primary-foreground">
              <Bot class="size-4" />
            </Avatar.Fallback>
          </Avatar.Root>
        {/if}

        <div class="flex min-w-0 max-w-[85%] flex-col gap-2 {isUser ? 'items-end' : 'items-start'}">
          <!-- header row -->
          <div class="flex items-center gap-2 text-xs">
            <span class="font-medium {isUser ? 'text-foreground' : 'text-foreground'}">
              {isUser ? "You" : (msg.model ?? "Assistant")}
            </span>
            <span class="text-muted-foreground">{timeLabel(msg.createdAt)}</span>
            {#if msg.tokens}
              <Badge variant="outline" class="font-mono text-[10px] h-4 px-1">{msg.tokens} tokens</Badge>
            {/if}
            <Button
              variant="ghost"
              size="icon-xs"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              onclick={() => copy(msg.content, msg.id)}
              aria-label="Copy message"
            >
              {#if copiedId === msg.id}
                <Check class="size-3 text-emerald-500" />
              {:else}
                <Copy class="size-3" />
              {/if}
            </Button>
          </div>

          <!-- bubble -->
          <div
            class="rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs
              {isUser ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border rounded-bl-md'}"
          >
            <p class="whitespace-pre-wrap break-words">{msg.content}</p>
          </div>

          <!-- parts -->
          {#if msg.parts?.length}
            <div class="flex w-full flex-col gap-2">
              {#each msg.parts as part (part.id)}
                {#if part.type === "reasoning" && part.text}
                  <div class="bg-muted/60 border flex gap-2 rounded-lg px-3 py-2 text-xs">
                    <Brain class="size-3.5 mt-0.5 shrink-0 text-violet-500" />
                    <p class="text-muted-foreground italic leading-relaxed">{part.text}</p>
                  </div>
                {:else if part.type === "tool"}
                  <div class="bg-card border flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
                    <span
                      class="bg-amber-500/15 text-amber-700 dark:text-amber-400 grid size-6 place-items-center rounded-md shrink-0"
                    >
                      <Wrench class="size-3.5" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="font-mono text-xs font-medium">
                        {part.tool}
                        {part.input?.path ? `· ${part.input.path}` : ""}
                      </p>
                      {#if part.output}
                        <p class="text-muted-foreground truncate">{part.output}</p>
                      {/if}
                    </div>
                    <Badge variant="secondary" class="shrink-0 text-[10px]">tool</Badge>
                  </div>
                {:else if part.type === "diff"}
                  <div class="bg-card border flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
                    <span
                      class="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 grid size-6 place-items-center rounded-md shrink-0"
                    >
                      <FileDiff class="size-3.5" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="font-mono text-xs font-medium truncate">{part.file}</p>
                      <p class="text-muted-foreground">
                        <span class="text-emerald-600">+{part.additions ?? 0}</span>
                        <span class="mx-1">·</span>
                        <span class="text-red-500">-{part.deletions ?? 0}</span>
                        {#if part.text}
                          <span class="ml-1">{part.text}</span>{/if}
                      </p>
                    </div>
                  </div>
                {:else if part.type === "text" && part.text}
                  <div class="bg-card border rounded-lg px-3 py-2 text-xs leading-relaxed">
                    {part.text}
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>

        {#if isUser}
          <Avatar.Root size="sm" class="bg-secondary shrink-0">
            <Avatar.Fallback><User class="size-4" /></Avatar.Fallback>
          </Avatar.Root>
        {/if}
      </div>

      {#if !isUser}
        <Separator class="my-1 opacity-40" />
      {/if}
    {/each}
  {/if}
</div>
