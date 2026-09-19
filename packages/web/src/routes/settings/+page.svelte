<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js"
  import { Button } from "$lib/components/ui/button/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import { setMode, resetMode } from "mode-watcher"
  import { toast } from "svelte-sonner"
  import { Sun, Moon, Monitor, Palette, Server, KeyRound } from "@lucide/svelte"

  let apiUrl = $state("")
  let model = $state("claude-4-sonnet")
</script>

<svelte:head><title>Settings — opencode web</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-xl font-semibold tracking-tight">Settings</h1>
    <p class="text-muted-foreground text-sm">Appearance and connection preferences.</p>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title class="flex items-center gap-2 text-sm"><Palette class="size-4" /> Appearance</Card.Title>
      <Card.Description>Theme is powered by <code class="bg-muted rounded px-1">mode-watcher</code>.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onclick={() => setMode("light")}><Sun class="size-4" /> Light</Button>
      <Button variant="outline" size="sm" onclick={() => setMode("dark")}><Moon class="size-4" /> Dark</Button>
      <Button variant="ghost" size="sm" onclick={() => resetMode()}><Monitor class="size-4" /> System</Button>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title class="flex items-center gap-2 text-sm"><Server class="size-4" /> Connection</Card.Title>
      <Card.Description
        >Upstream opencode server URL (mirrors <code class="bg-muted rounded px-1">OPENCODE_API_URL</code
        >).</Card.Description
      >
    </Card.Header>
    <Card.Content class="space-y-3">
      <div class="space-y-2">
        <label for="api" class="text-sm font-medium">API URL</label>
        <Input id="api" bind:value={apiUrl} placeholder="https://your-opencode.example.com" />
        <p class="text-muted-foreground text-xs">
          Used by <code class="bg-muted rounded px-1">/api/chat</code> and
          <code class="bg-muted rounded px-1">/api/health</code> proxies.
        </p>
      </div>
      <div class="space-y-2">
        <label for="model" class="flex items-center gap-1.5 text-sm font-medium"
          ><KeyRound class="size-3.5" /> Default model</label
        >
        <Input id="model" bind:value={model} placeholder="claude-4-sonnet" />
      </div>
    </Card.Content>
    <Card.Footer class="justify-end gap-2">
      <Badge variant="outline">Demo only — not persisted</Badge>
      <Button size="sm" onclick={() => toast.success("Settings saved (demo)")}>Save</Button>
    </Card.Footer>
  </Card.Root>

  <Separator />
  <p class="text-muted-foreground text-xs">
    Tip: persist these with a remote function or localStorage when you wire the real backend.
  </p>
</div>
