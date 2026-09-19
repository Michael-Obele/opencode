<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Skeleton } from "$lib/components/ui/skeleton/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import { fetchSessions, type Session } from "$lib/api/session.js"
  import { Search, Plus, Clock3, MessageSquare, FolderOpen, Sparkles, ArrowRight } from "@lucide/svelte"

  let q = $state("")

  const sessionsQuery = createQuery(() => ({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  }))

  let filtered = $derived.by(() => {
    const list = sessionsQuery.data ?? []
    const needle = q.trim().toLowerCase()
    if (!needle) return list
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(needle) ||
        s.id.toLowerCase().includes(needle) ||
        s.directory.toLowerCase().includes(needle),
    )
  })

  function statusBadge(s: Session) {
    switch (s.status) {
      case "active":
        return { variant: "default" as const, label: "Active" }
      case "running":
        return { variant: "secondary" as const, label: "Running" }
      case "idle":
        return { variant: "outline" as const, label: "Idle" }
      case "archived":
        return { variant: "outline" as const, label: "Archived" }
      case "error":
        return { variant: "destructive" as const, label: "Error" }
      default:
        return { variant: "outline" as const, label: s.status }
    }
  }

  function timeAgo(ts: number) {
    const s = Math.floor((Date.now() - ts) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }
</script>

<svelte:head><title>Sessions — opencode web</title></svelte:head>

<div class="bg-background min-h-screen">
  <header class="bg-card/60 supports-backdrop-filter:bg-card/80 sticky top-0 z-10 border-b backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
      <a href="/" class="flex items-center gap-2">
        <span class="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg"
          ><Sparkles class="size-4" /></span
        >
        <span class="text-sm font-semibold tracking-tight">opencode</span>
        <Badge variant="outline" class="hidden sm:inline-flex">Sessions</Badge>
      </a>
      <Button href="/session" variant="default" size="sm"><Plus class="size-4" /> New session</Button>
    </div>
  </header>

  <main class="mx-auto max-w-5xl px-4 py-6">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Sessions</h1>
        <p class="text-muted-foreground text-sm">
          Recent conversations — mock data, wire to <code class="bg-muted rounded px-1 py-0.5 font-mono text-xs"
            >/api/session</code
          > when ready.
        </p>
      </div>
      <div class="relative w-full sm:w-72">
        <Search class="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
        <Input bind:value={q} placeholder="Search sessions…" class="pl-8" />
      </div>
    </div>

    {#if sessionsQuery.isPending}
      <div class="grid gap-3">
        {#each Array(4) as _, i (i)}
          <Card.Root
            ><Card.Content class="p-4 space-y-3"
              ><Skeleton class="h-4 w-2/3" /><Skeleton class="h-3 w-1/2" /><Skeleton class="h-3 w-1/3" /></Card.Content
            ></Card.Root
          >
        {/each}
      </div>
    {:else if sessionsQuery.isError}
      <Card.Root class="border-destructive/30">
        <Card.Content class="py-8 text-center">
          <p class="text-destructive text-sm font-medium">Failed to load sessions</p>
          <p class="text-muted-foreground text-xs mt-1">{String(sessionsQuery.error)}</p>
          <Button variant="outline" size="sm" class="mt-3" onclick={() => sessionsQuery.refetch()}>Retry</Button>
        </Card.Content>
      </Card.Root>
    {:else if filtered.length === 0}
      <Card.Root class="border-dashed">
        <Card.Content class="py-12 text-center">
          <p class="text-sm font-medium">No sessions found</p>
          <p class="text-muted-foreground text-xs mt-1">Try a different search or create a new session.</p>
        </Card.Content>
      </Card.Root>
    {:else}
      <div class="grid gap-3">
        {#each filtered as s (s.id)}
          {@const b = statusBadge(s)}
          <a href="/session/{s.id}" class="group block">
            <Card.Root class="hover:border-primary/30 hover:shadow-sm transition-all">
              <Card.Content class="p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <h2 class="truncate text-sm font-medium group-hover:text-primary transition-colors">{s.title}</h2>
                      <Badge variant={b.variant} class="shrink-0 text-[11px]">{b.label}</Badge>
                      {#if s.model}<Badge variant="outline" class="hidden sm:inline-flex font-mono text-[11px]"
                          >{s.model}</Badge
                        >{/if}
                    </div>
                    <div class="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span class="inline-flex items-center gap-1"><FolderOpen class="size-3" />{s.directory}</span>
                      <span class="inline-flex items-center gap-1"
                        ><MessageSquare class="size-3" />{s.messageCount} messages</span
                      >
                      <span class="inline-flex items-center gap-1"><Clock3 class="size-3" />{timeAgo(s.updatedAt)}</span
                      >
                    </div>
                    <p class="text-muted-foreground mt-1 font-mono text-[11px] truncate">{s.id}</p>
                  </div>
                  <span
                    class="{buttonVariants({
                      variant: 'ghost',
                      size: 'icon-sm',
                    })} shrink-0 opacity-60 group-hover:opacity-100"
                  >
                    <ArrowRight class="size-4" />
                  </span>
                </div>
              </Card.Content>
            </Card.Root>
          </a>
        {/each}
      </div>
      <Separator class="my-6" />
      <p class="text-muted-foreground text-center text-xs">
        Showing {filtered.length} of {sessionsQuery.data?.length ?? 0} sessions
      </p>
    {/if}
  </main>
</div>
