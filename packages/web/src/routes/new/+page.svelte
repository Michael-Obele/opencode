<script lang="ts">
  import { goto } from "$app/navigation"
  import { Button } from "$lib/components/ui/button/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import { toast } from "svelte-sonner"
  import { Sparkles, ArrowRight, FolderOpen, Bot, Wand2 } from "@lucide/svelte"

  let title = $state("")
  let directory = $state("~/projects/opencode")
  let prompt = $state("")

  let canCreate = $derived(title.trim().length > 1 && directory.trim().length > 0)

  function onCreate() {
    if (!canCreate) return
    toast.success("Session created (demo)")
    goto("/sessions")
  }
</script>

<svelte:head><title>New Session — opencode web</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="flex items-center gap-2 text-xl font-semibold tracking-tight">
      <span class="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg"
        ><Wand2 class="size-4" /></span
      >
      New Session
    </h1>
    <p class="text-muted-foreground mt-1 text-sm">
      Start a fresh conversation. This is a local demo — wire to your opencode server when ready.
    </p>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title class="text-sm">Session details</Card.Title>
      <Card.Description>Title and workspace directory</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="space-y-2">
        <label for="title" class="text-sm font-medium">Title</label>
        <Input id="title" bind:value={title} placeholder="e.g. Refactor auth middleware" />
      </div>
      <div class="space-y-2">
        <label for="dir" class="flex items-center gap-1.5 text-sm font-medium"
          ><FolderOpen class="size-3.5" /> Directory</label
        >
        <Input id="dir" bind:value={directory} placeholder="~/projects/my-app" />
        <p class="text-muted-foreground text-xs">Used as the session workspace path.</p>
      </div>
      <div class="space-y-2">
        <label for="prompt" class="flex items-center gap-1.5 text-sm font-medium"
          ><Bot class="size-3.5" /> Initial prompt</label
        >
        <Textarea id="prompt" bind:value={prompt} placeholder="Ask anything…" rows={4} class="resize-none" />
      </div>
    </Card.Content>
    <Card.Footer class="flex items-center justify-between gap-3">
      <Badge variant="outline" class="hidden sm:inline-flex">Svelte 5 runes · $state</Badge>
      <div class="ml-auto flex gap-2">
        <Button variant="ghost" href="/sessions">Cancel</Button>
        <Button onclick={onCreate} disabled={!canCreate}
          ><Sparkles class="size-4" /> Create session <ArrowRight class="size-4" /></Button
        >
      </div>
    </Card.Footer>
  </Card.Root>

  <Separator />

  <Card.Root class="bg-muted/30">
    <Card.Content class="p-4 text-sm">
      <p class="font-medium">Next step</p>
      <p class="text-muted-foreground mt-1 text-xs leading-5">
        Replace the demo <code class="bg-muted rounded px-1">goto('/sessions')</code> with a
        <code class="bg-muted rounded px-1">createMutation</code> that POSTs to your opencode session API and navigates
        to <code class="bg-muted rounded px-1">/session/{"{id}"}</code>.
      </p>
    </Card.Content>
  </Card.Root>
</div>
