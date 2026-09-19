<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query"
  import * as Card from "$lib/components/ui/card/index.js"
  import { Button } from "$lib/components/ui/button/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Skeleton } from "$lib/components/ui/skeleton/index.js"
  import { fetchSessions, type Session } from "$lib/api/session.js"
  import { Search, Plus, Clock3, MessageSquare, FolderOpen, ArrowRight, Sparkles } from "@lucide/svelte"
  import { buttonVariants } from "$lib/components/ui/button/index.js"

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

<div class="space-y-6">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-xl font-semibold tracking-tight">Sessions</h1>
      <p class="text-muted-foreground text-sm">
        Recent conversations — mock data, wire to <code class="bg-muted rounded px-1 py-0.5 font-mono text-xs"
          >/api/session</code
        > when ready.
      </p>
    </div>
    <div class="flex gap-2">
      <div class="relative w-full sm:w-72">
        <Search class="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input bind:value={q} placeholder="Search sessions…" class="pl-8" />
      </div>
      <Button href="/new" size="sm" class="shrink-0"><Plus class="size-4" /> New</Button>
    </div>
  </div>

  {#if sessionsQuery.isPending}
    <div class="grid gap-3">
      {#each Array(4) as _, i (i)}
        <Card.Root
          ><Card.Content class="space-y-3 p-4"
            ><Skeleton class="h-4 w-2/3" /><Skeleton class="h-3 w-1/2" /><Skeleton class="h-3 w-1/3" /></Card.Content
          ></Card.Root
        >
      {/each}
    </div>
  {:else if sessionsQuery.isError}
    <Card.Root class="border-destructive/30">
      <Card.Content class="py-8 text-center">
        <p class="text-destructive text-sm font-medium">Failed to load sessions</p>
        <p class="text-muted-foreground mt-1 text-xs">{String(sessionsQuery.error)}</p>
        <Button variant="outline" size="sm" class="mt-3" onclick={() => sessionsQuery.refetch()}>Retry</Button>
      </Card.Content>
    </Card.Root>
  {:else if filtered.length === 0}
    <Card.Root class="border-dashed">
      <Card.Content class="py-12 text-center">
        <div class="bg-muted mx-auto grid size-12 place-items-center rounded-2xl">
          <Search class="text-muted-foreground size-5" />
        </div>
        <p class="mt-3 text-sm font-medium">No sessions found</p>
        <p class="text-muted-foreground mt-1 text-xs">Try a different search or create a new session.</p>
        <Button href="/new" size="sm" class="mt-4"><Plus class="size-4" /> New session</Button>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="grid gap-3">
      {#each filtered as s (s.id)}
        {@const b = statusBadge(s)}
        <a href="/session/{s.id}" class="group block">
          <Card.Root class="hover:border-primary/30 transition-all hover:shadow-sm">
            <Card.Content class="p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h2 class="group-hover:text-primary truncate text-sm font-medium transition-colors">
                      {s.title}
                    </h2>
                    <Badge variant={b.variant} class="shrink-0 text-[11px]">{b.label}</Badge>
                    {#if s.model}<Badge variant="outline" class="hidden font-mono text-[11px] sm:inline-flex"
                        >{s.model}</Badge
                      >{/if}
                  </div>
                  <div class="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span class="inline-flex items-center gap-1"><FolderOpen class="size-3" />{s.directory}</span>
                    <span class="inline-flex items-center gap-1"
                      ><MessageSquare class="size-3" />{s.messageCount} messages</span
                    >
                    <span class="inline-flex items-center gap-1"><Clock3 class="size-3" />{timeAgo(s.updatedAt)}</span>
                  </div>
                  <p class="text-muted-foreground mt-1 truncate font-mono text-[11px]">{s.id}</p>
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
  {/if}

  <Card.Root class="bg-muted/30">
    <Card.Content class="flex items-center gap-3 p-4 text-sm">
      <span class="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg"
        ><Sparkles class="size-4" /></span
      >
      <span class="text-muted-foreground"
        >Tip: sessions are fetched with <code class="bg-muted rounded px-1">createQuery</code> — swap in your opencode server.</span
      >
    </Card.Content>
  </Card.Root>
</div>
