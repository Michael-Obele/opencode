<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Send, Square, Paperclip, Sparkles, Command } from "@lucide/svelte"

  let {
    value = $bindable(""),
    sending = false,
    disabled = false,
    placeholder = "Ask anything… (Enter to send, Shift+Enter for new line)",
    onSend,
    onStop,
  }: {
    value?: string
    sending?: boolean
    disabled?: boolean
    placeholder?: string
    onSend: (text: string) => void
    onStop?: () => void
  } = $props()

  let textareaEl = $state<HTMLTextAreaElement | null>(null)

  function submit() {
    const text = value.trim()
    if (!text || sending || disabled) return
    onSend(text)
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  let canSend = $derived(value.trim().length > 0 && !sending && !disabled)
</script>

<Card.Root class="shadow-lg">
  <Card.Content class="p-3">
    <div class="flex flex-col gap-2">
      <Textarea
        bind:ref={textareaEl}
        bind:value
        placeholder={disabled ? "Session is archived — read only" : placeholder}
        disabled={disabled || sending}
        onkeydown={onKeydown}
        class="min-h-14 max-h-40 resize-none border-0 shadow-none focus-visible:ring-0 px-2 py-2 text-sm"
        rows={2}
      />

      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5">
          <Button variant="ghost" size="icon-xs" {disabled} aria-label="Attach file" onclick={() => {}}>
            <Paperclip class="size-4" />
          </Button>
          <Button variant="ghost" size="icon-xs" {disabled} aria-label="Commands" onclick={() => {}}>
            <Command class="size-4" />
          </Button>
          <span class="text-muted-foreground hidden sm:inline-flex items-center gap-1 text-xs">
            <Sparkles class="size-3" />
            {value.length} chars
          </span>
          {#if disabled}
            <Badge variant="outline" class="text-[11px]">Read only</Badge>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          {#if sending}
            <Button variant="outline" size="sm" onclick={() => onStop?.()}>
              <Square class="size-3 fill-current" /> Stop
            </Button>
          {/if}
          <Button size="sm" disabled={!canSend} onclick={submit} class="min-w-20">
            {#if sending}
              <span class="size-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Sending
            {:else}
              <Send class="size-4" /> Send
            {/if}
          </Button>
        </div>
      </div>

      <p class="text-muted-foreground hidden sm:block text-[11px]">
        Press <kbd class="bg-muted rounded px-1 py-0.5 font-mono text-[11px]">Enter</kbd> to send,
        <kbd class="bg-muted ml-1 rounded px-1 py-0.5 font-mono text-[11px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  </Card.Content>
</Card.Root>
