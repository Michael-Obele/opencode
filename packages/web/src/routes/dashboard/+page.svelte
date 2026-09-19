<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Button } from "$lib/components/ui/button/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import { LayoutDashboard, FolderOpen, GitBranch, Clock3, Sparkles } from "@lucide/svelte"
</script>

<svelte:head><title>Dashboard — opencode web</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <span class="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl shadow-sm"
      ><LayoutDashboard class="size-4" /></span
    >
    <div>
      <h1 class="text-xl font-semibold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground text-sm">Project overview — placeholder for your workspace view.</p>
    </div>
    <Badge variant="outline" class="ml-auto hidden sm:inline-flex">Coming soon</Badge>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-sm"><FolderOpen class="size-4" /> Projects</Card.Title>
      </Card.Header>
      <Card.Content class="text-muted-foreground text-sm">Connect your opencode projects here.</Card.Content>
      <Card.Footer><Button variant="outline" size="sm" href="/sessions">View sessions</Button></Card.Footer>
    </Card.Root>
    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-sm"><GitBranch class="size-4" /> Workspaces</Card.Title>
      </Card.Header>
      <Card.Content class="text-muted-foreground text-sm">Per-project workspaces and branches.</Card.Content>
      <Card.Footer><Button variant="outline" size="sm" href="/new">New session</Button></Card.Footer>
    </Card.Root>
  </div>

  <Card.Root class="bg-muted/30">
    <Card.Content class="flex items-center gap-3 p-4 text-sm">
      <Sparkles class="size-4 text-muted-foreground" />
      <span class="text-muted-foreground"
        >This page mirrors the old <code class="bg-muted rounded px-1">directory-layout</code> concept — replace with your
        real project data.</span
      >
    </Card.Content>
  </Card.Root>

  <Separator />
  <div class="text-muted-foreground flex items-center gap-2 text-xs">
    <Clock3 class="size-3.5" /> Last synced just now
  </div>
</div>
