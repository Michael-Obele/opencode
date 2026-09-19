<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query"
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import * as Avatar from "$lib/components/ui/avatar/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js"
  import { Skeleton } from "$lib/components/ui/skeleton/index.js"
  import * as Tooltip from "$lib/components/ui/tooltip/index.js"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
  import { toast } from "svelte-sonner"
  import {
    Archive,
    Bot,
    ChevronDown,
    Clock3,
    Command,
    FolderGit2,
    FolderPlus,
    Layers3,
    MessageSquare,
    MoreHorizontal,
    Plus,
    Search,
    Server,
    Settings2,
    Sparkles,
    Sun,
    Moon,
    Zap,
    GitBranch,
    Activity,
    ArrowUpRight,
    CircleDot,
    Timer,
    Users,
  } from "@lucide/svelte"
  import { setMode, resetMode, toggleMode } from "mode-watcher"

  // ── mock data (mirrors Solid app shape: projects + sessions) ──
  type Project = {
    id: string
    name: string
    path: string
    server: string
    branch: string
    unseen: number
    status: "healthy" | "offline"
  }
  type Session = {
    id: string
    title: string
    project: string
    projectId: string
    updatedAt: string
    model: string
    messages: number
    status: "active" | "idle" | "archived"
    unread?: boolean
  }

  const MOCK_PROJECTS: Project[] = [
    {
      id: "p1",
      name: "opencode",
      path: "~/Documents/GitHub/opencode",
      server: "local",
      branch: "dev",
      unseen: 3,
      status: "healthy",
    },
    {
      id: "p2",
      name: "svelte-miniapps",
      path: "~/dev/svelte-miniapps",
      server: "local",
      branch: "main",
      unseen: 0,
      status: "healthy",
    },
    {
      id: "p3",
      name: "rustmaps",
      path: "~/work/rustmaps",
      server: "local",
      branch: "feat/generator",
      unseen: 1,
      status: "healthy",
    },
    {
      id: "p4",
      name: "api-gateway",
      path: "~/work/api-gateway",
      server: "remote · fly.io",
      branch: "main",
      unseen: 0,
      status: "offline",
    },
  ]

  const MOCK_SESSIONS: Session[] = [
    {
      id: "s1",
      title: "Refactor session runner to use Effect.gen",
      project: "opencode",
      projectId: "p1",
      updatedAt: "2m ago",
      model: "claude-sonnet-4",
      messages: 42,
      status: "active",
      unread: true,
    },
    {
      id: "s2",
      title: "Debug TUI scroll state on session switch",
      project: "opencode",
      projectId: "p1",
      updatedAt: "18m ago",
      model: "claude-sonnet-4",
      messages: 18,
      status: "idle",
    },
    {
      id: "s3",
      title: "Design enterprise generator config UI",
      project: "rustmaps",
      projectId: "p3",
      updatedAt: "1h ago",
      model: "gpt-4o",
      messages: 27,
      status: "active",
      unread: true,
    },
    {
      id: "s4",
      title: "Add R2 presigned upload for flash files",
      project: "svelte-miniapps",
      projectId: "p2",
      updatedAt: "3h ago",
      model: "claude-sonnet-4",
      messages: 12,
      status: "idle",
    },
    {
      id: "s5",
      title: "Investigate failing e2e: session-recovery",
      project: "opencode",
      projectId: "p1",
      updatedAt: "Yesterday",
      model: "claude-sonnet-4",
      messages: 31,
      status: "archived",
    },
    {
      id: "s6",
      title: "Polish mobile product page — quantity selector",
      project: "svelte-miniapps",
      projectId: "p2",
      updatedAt: "Yesterday",
      model: "gpt-4o-mini",
      messages: 9,
      status: "idle",
    },
    {
      id: "s7",
      title: "Wire Cloudflare Tunnel for preview deploys",
      project: "api-gateway",
      projectId: "p4",
      updatedAt: "2 days ago",
      model: "claude-sonnet-4",
      messages: 15,
      status: "idle",
    },
  ]

  // TanStack Query with placeholder (simulates real fetch, keeps UI responsive)
  const projectsQuery = createQuery(() => ({
    queryKey: ["home-projects"],
    queryFn: async (): Promise<Project[]> => {
      await new Promise((r) => setTimeout(r, 420))
      return MOCK_PROJECTS
    },
    placeholderData: MOCK_PROJECTS.slice(0, 2),
  }))

  const sessionsQuery = createQuery(() => ({
    queryKey: ["home-sessions"],
    queryFn: async (): Promise<Session[]> => {
      await new Promise((r) => setTimeout(r, 520))
      return MOCK_SESSIONS
    },
    placeholderData: MOCK_SESSIONS.slice(0, 3),
  }))

  // local UI state — Svelte 5 runes
  let search = $state("")
  let selectedProjectId = $state<string | null>("p1")
  let showArchived = $state(false)
  let collapsedServers = $state<Record<string, boolean>>({})

  let filteredSessions = $derived.by(() => {
    const all = sessionsQuery.data ?? []
    let list = all
    if (selectedProjectId) list = list.filter((s) => s.projectId === selectedProjectId)
    if (!showArchived) list = list.filter((s) => s.status !== "archived")
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) || s.project.toLowerCase().includes(q) || s.model.toLowerCase().includes(q),
      )
    }
    return list
  })

  let grouped = $derived.by(() => {
    const groups: { label: string; items: Session[] }[] = []
    const today = filteredSessions.filter((s) => s.updatedAt.includes("m ago") || s.updatedAt.includes("h ago"))
    const yesterday = filteredSessions.filter((s) => s.updatedAt === "Yesterday")
    const earlier = filteredSessions.filter((s) => s.updatedAt.includes("days ago"))
    if (today.length) groups.push({ label: "Today", items: today })
    if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday })
    if (earlier.length) groups.push({ label: "Earlier", items: earlier })
    if (groups.length === 0 && filteredSessions.length) groups.push({ label: "Sessions", items: filteredSessions })
    return groups
  })

  let stats = $derived.by(() => {
    const projects = projectsQuery.data ?? []
    const sessions = sessionsQuery.data ?? []
    return {
      projects: projects.length,
      sessions: sessions.length,
      active: sessions.filter((s) => s.status === "active").length,
      unread: sessions.filter((s) => s.unread).length,
    }
  })

  let selectedProject = $derived((projectsQuery.data ?? []).find((p) => p.id === selectedProjectId) ?? null)

  function toggleServer(server: string) {
    collapsedServers[server] = !collapsedServers[server]
  }

  function handleNewSession() {
    toast.success("New session", {
      description: selectedProject ? `Started in ${selectedProject.name}` : "Choose a project first",
    })
  }
  function handleOpenSession(s: Session) {
    toast.message(`Opening session`, { description: s.title })
  }
</script>

<div class="bg-background min-h-screen">
  <!-- subtle grid + gradient backdrop -->
  <div class="pointer-events-none fixed inset-0 -z-10">
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.18] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]"
    ></div>
    <div
      class="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-transparent"
    ></div>
  </div>

  <!-- header -->
  <header
    class="sticky top-0 z-20 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
  >
    <div class="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 lg:px-6">
      <div class="flex items-center gap-3">
        <div
          class="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl shadow-sm ring-1 ring-border/50"
        >
          <Command class="size-4" />
        </div>
        <div class="hidden sm:block">
          <h1 class="text-[13px] font-semibold tracking-tight leading-none">opencode</h1>
          <p class="text-muted-foreground text-xs">Home · projects & sessions</p>
        </div>
        <Badge variant="secondary" class="hidden lg:inline-flex gap-1.5">
          <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          local · healthy
        </Badge>
      </div>

      <div class="flex-1 flex justify-center px-2 lg:px-8">
        <label class="relative flex w-full max-w-[520px] items-center">
          <Search class="text-muted-foreground pointer-events-none absolute left-3 size-4" />
          <Input
            bind:value={search}
            placeholder="Search sessions, projects, models…"
            class="h-9 w-full rounded-full bg-muted/60 pl-9 pr-3 text-sm shadow-none focus-visible:bg-background"
          />
          {#if search}
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground absolute right-2 grid size-7 place-items-center rounded-full hover:bg-muted"
              onclick={() => (search = "")}
              aria-label="Clear search"
            >
              ×
            </button>
          {/if}
        </label>
      </div>

      <div class="flex items-center gap-1.5">
        <Tooltip.Root>
          <Tooltip.Trigger
            class={buttonVariants({ variant: "ghost", size: "icon" })}
            onclick={toggleMode}
            aria-label="Toggle theme"
          >
            <Sun class="h-[1.15rem] w-[1.15rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon
              class="absolute h-[1.15rem] w-[1.15rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
            />
            <span class="sr-only">Toggle theme</span>
          </Tooltip.Trigger>
          <Tooltip.Content>Toggle theme</Tooltip.Content>
        </Tooltip.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger class={buttonVariants({ variant: "outline", size: "icon" })} aria-label="Theme">
            <Settings2 class="size-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" class="w-40">
            <DropdownMenu.Item onclick={() => setMode("light")}>Light</DropdownMenu.Item>
            <DropdownMenu.Item onclick={() => setMode("dark")}>Dark</DropdownMenu.Item>
            <DropdownMenu.Item onclick={() => resetMode()}>System</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <Button size="sm" class="hidden sm:inline-flex gap-1.5 rounded-full" onclick={handleNewSession}>
          <Plus class="size-4" />
          New session
        </Button>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
    <!-- stats -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card.Root class="relative overflow-hidden">
        <div class="absolute -right-6 -top-6 size-20 rounded-full bg-primary/10 blur-2xl"></div>
        <Card.Header class="pb-2">
          <Card.Description class="flex items-center gap-1.5 text-xs"
            ><FolderGit2 class="size-3.5" /> Projects</Card.Description
          >
          <Card.Title class="text-2xl tabular-nums">{stats.projects}</Card.Title>
        </Card.Header>
        <Card.Content class="text-muted-foreground text-xs"
          >Across {(projectsQuery.data ?? []).map((p) => p.server).filter((v, i, a) => a.indexOf(v) === i).length} servers</Card.Content
        >
      </Card.Root>
      <Card.Root class="relative overflow-hidden">
        <div class="absolute -right-6 -top-6 size-20 rounded-full bg-violet-500/10 blur-2xl"></div>
        <Card.Header class="pb-2">
          <Card.Description class="flex items-center gap-1.5 text-xs"
            ><Layers3 class="size-3.5" /> Sessions</Card.Description
          >
          <Card.Title class="text-2xl tabular-nums">{stats.sessions}</Card.Title>
        </Card.Header>
        <Card.Content class="text-muted-foreground flex items-center gap-2 text-xs">
          <span class="inline-flex items-center gap-1"><Activity class="size-3" /> {stats.active} active</span>
          <span>·</span>
          <span class="inline-flex items-center gap-1"><CircleDot class="size-3" /> {stats.unread} unread</span>
        </Card.Content>
      </Card.Root>
      <Card.Root>
        <Card.Header class="pb-2">
          <Card.Description class="flex items-center gap-1.5 text-xs"
            ><Zap class="size-3.5" /> Selected</Card.Description
          >
          <Card.Title class="text-base truncate">{selectedProject?.name ?? "All projects"}</Card.Title>
        </Card.Header>
        <Card.Content class="text-muted-foreground truncate text-xs"
          >{selectedProject?.path ?? "Showing every session"}</Card.Content
        >
      </Card.Root>
      <Card.Root class="bg-primary text-primary-foreground border-primary/20">
        <Card.Header class="pb-2">
          <Card.Description class="text-primary-foreground/70 flex items-center gap-1.5 text-xs"
            ><Sparkles class="size-3.5" /> Quick start</Card.Description
          >
          <Card.Title class="text-sm leading-tight">Start a new session in one click</Card.Title>
        </Card.Header>
        <Card.Content class="flex gap-2">
          <Button variant="secondary" size="sm" class="rounded-full" onclick={handleNewSession}
            ><Plus class="size-3.5" /> New</Button
          >
          <Button
            variant="outline"
            size="sm"
            class="rounded-full bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onclick={() => toast.info("Open docs")}>Docs <ArrowUpRight class="size-3.5" /></Button
          >
        </Card.Content>
      </Card.Root>
    </div>

    <!-- main grid -->
    <div class="mt-6 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <!-- projects -->
      <div class="min-w-0">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold tracking-tight flex items-center gap-2">
            <FolderGit2 class="size-4 text-muted-foreground" /> Projects
          </h2>
          <div class="flex items-center gap-1">
            <Badge variant="outline" class="tabular-nums">{projectsQuery.data?.length ?? 0}</Badge>
            <Tooltip.Root>
              <Tooltip.Trigger
                class={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                onclick={() => toast.message("Add project")}
                aria-label="Add project"
              >
                <FolderPlus class="size-4" />
              </Tooltip.Trigger>
              <Tooltip.Content>Add project</Tooltip.Content>
            </Tooltip.Root>
          </div>
        </div>

        <Card.Root class="overflow-hidden">
          <ScrollArea class="max-h-[min(68vh,720px)]">
            <div class="p-2">
              {#if projectsQuery.isPending}
                <div class="space-y-3 p-2">
                  {#each Array(4) as _, i (i)}
                    <div class="flex gap-3">
                      <Skeleton class="size-9 rounded-xl" />
                      <div class="flex-1 space-y-2">
                        <Skeleton class="h-4 w-32" />
                        <Skeleton class="h-3 w-48" />
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                {@const servers = [...new Set((projectsQuery.data ?? []).map((p) => p.server))]}
                <div class="space-y-4">
                  {#each servers as server (server)}
                    {@const items = (projectsQuery.data ?? []).filter((p) => p.server === server)}
                    <div>
                      <button
                        type="button"
                        class="text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-muted/60"
                        onclick={() => toggleServer(server)}
                      >
                        <ChevronDown
                          class="size-3.5 transition-transform {collapsedServers[server] ? '-rotate-90' : ''}"
                        />
                        <Server class="size-3.5" />
                        <span class="truncate">{server}</span>
                        <span class="ml-auto flex items-center gap-1">
                          <span
                            class="size-1.5 rounded-full {items.some((p) => p.status === 'healthy')
                              ? 'bg-emerald-500'
                              : 'bg-red-500'}"
                          ></span>
                          {items.length}
                        </span>
                      </button>
                      {#if !collapsedServers[server]}
                        <div class="mt-1 space-y-1">
                          {#each items as project (project.id)}
                            {@const selected = selectedProjectId === project.id}
                            <button
                              type="button"
                              class="group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all {selected
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-card hover:bg-muted/60 border-transparent hover:border-border'}"
                              onclick={() => (selectedProjectId = project.id)}
                            >
                              <Avatar.Root
                                size="sm"
                                class="size-9 rounded-xl {selected ? 'bg-primary-foreground/15' : 'bg-muted'}"
                              >
                                <Avatar.Fallback
                                  class="rounded-xl text-xs font-semibold {selected
                                    ? 'bg-primary-foreground/15 text-primary-foreground'
                                    : ''}"
                                >
                                  {project.name.slice(0, 2).toUpperCase()}
                                </Avatar.Fallback>
                              </Avatar.Root>
                              <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-1.5">
                                  <span class="truncate text-sm font-medium leading-none">{project.name}</span>
                                  {#if project.unseen > 0}
                                    <Badge
                                      variant={selected ? "secondary" : "default"}
                                      class="h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]"
                                      >{project.unseen}</Badge
                                    >
                                  {/if}
                                </div>
                                <div
                                  class="flex items-center gap-1.5 truncate text-xs {selected
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'}"
                                >
                                  <GitBranch class="size-3 shrink-0" />
                                  <span class="truncate">{project.branch}</span>
                                  <span class="opacity-60">·</span>
                                  <span class="truncate">{project.path}</span>
                                </div>
                              </div>
                              <MoreHorizontal
                                class="size-4 shrink-0 opacity-0 group-hover:opacity-60 {selected
                                  ? 'text-primary-foreground'
                                  : ''}"
                              />
                            </button>
                          {/each}
                        </div>
                      {/if}
                      <Separator class="mt-3" />
                    </div>
                  {/each}

                  <div class="flex gap-2 px-1 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      class="flex-1 rounded-full"
                      onclick={() => toast.message("Add project")}
                    >
                      <FolderPlus class="size-4" /> Add
                    </Button>
                    <Button variant="ghost" size="sm" class="rounded-full" onclick={() => (selectedProjectId = null)}>
                      Clear filter
                    </Button>
                  </div>
                  <p class="text-muted-foreground px-1 text-xs leading-relaxed">
                    Tip: pick a project to filter sessions. Uses <code class="bg-muted rounded px-1"
                      >TanStack Query</code
                    > placeholder data — swap in your opencode server.
                  </p>
                </div>
              {/if}
            </div>
          </ScrollArea>
        </Card.Root>

        <Card.Root class="mt-4">
          <Card.Header class="pb-3">
            <Card.Title class="text-sm flex items-center gap-2"
              ><Users class="size-4 text-muted-foreground" /> Servers</Card.Title
            >
          </Card.Header>
          <Card.Content class="space-y-2 text-sm">
            <div class="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
              <span class="flex items-center gap-2"><span class="size-2 rounded-full bg-emerald-500"></span> local</span
              >
              <Badge variant="secondary" class="rounded-full">healthy</Badge>
            </div>
            <div class="flex items-center justify-between rounded-lg border px-3 py-2 opacity-70">
              <span class="flex items-center gap-2"
                ><span class="size-2 rounded-full bg-amber-500"></span> remote · fly.io</span
              >
              <Badge variant="outline" class="rounded-full">offline</Badge>
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      <!-- sessions -->
      <div class="min-w-0">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-sm font-semibold tracking-tight flex items-center gap-2">
            <MessageSquare class="size-4 text-muted-foreground" /> Sessions
            {#if search || selectedProjectId}
              <Badge variant="secondary" class="rounded-full">{filteredSessions.length} shown</Badge>
            {/if}
          </h2>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-1.5 text-xs">
              <input type="checkbox" bind:checked={showArchived} class="rounded border-input" />
              <span class="text-muted-foreground">Show archived</span>
            </label>
            <Separator orientation="vertical" class="h-4" />
            <Button variant="outline" size="sm" class="rounded-full gap-1.5" onclick={handleNewSession}>
              <Plus class="size-4" /> New session
            </Button>
          </div>
        </div>

        <Card.Root class="overflow-hidden">
          <div class="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
            <div class="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Clock3 class="size-3.5" />
              Recent
            </div>
            <span class="text-muted-foreground text-xs">·</span>
            <span class="text-muted-foreground text-xs">{filteredSessions.length} sessions</span>
            <span class="ml-auto flex items-center gap-1.5">
              <Button variant="ghost" size="xs" class="rounded-full" onclick={() => sessionsQuery.refetch()}
                ><Timer class="size-3.5" /> Refresh</Button
              >
            </span>
          </div>

          <ScrollArea class="max-h-[min(68vh,720px)]">
            <div class="p-3">
              {#if sessionsQuery.isPending}
                <div class="space-y-3">
                  {#each Array(5) as _, i (i)}
                    <div class="rounded-xl border p-3">
                      <Skeleton class="h-4 w-3/4" />
                      <Skeleton class="mt-2 h-3 w-1/2" />
                      <div class="mt-3 flex gap-2">
                        <Skeleton class="h-5 w-16 rounded-full" />
                        <Skeleton class="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if filteredSessions.length === 0}
                <div
                  class="grid place-items-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center"
                >
                  <div class="bg-muted grid size-12 place-items-center rounded-2xl">
                    <Search class="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p class="text-sm font-medium">No sessions found</p>
                    <p class="text-muted-foreground text-sm">Try clearing the project filter or search.</p>
                  </div>
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      class="rounded-full"
                      onclick={() => {
                        search = ""
                        selectedProjectId = null
                      }}>Clear filters</Button
                    >
                    <Button size="sm" class="rounded-full" onclick={handleNewSession}
                      ><Plus class="size-4" /> New session</Button
                    >
                  </div>
                </div>
              {:else}
                <div class="space-y-6">
                  {#each grouped as group (group.label)}
                    <div>
                      <div
                        class="text-muted-foreground sticky top-0 z-10 -mx-3 flex items-center gap-2 bg-card/80 px-3 py-2 text-xs font-medium backdrop-blur supports-[backdrop-filter]:bg-card/60"
                      >
                        <span class="h-px flex-1 bg-border"></span>
                        <span class="rounded-full border bg-muted px-2 py-0.5">{group.label}</span>
                        <span class="h-px flex-1 bg-border"></span>
                      </div>
                      <div class="mt-3 grid gap-2">
                        {#each group.items as session (session.id)}
                          <button
                            type="button"
                            class="group/session flex w-full flex-col gap-2 rounded-xl border bg-card p-3 text-left shadow-xs transition-all hover:shadow-sm hover:border-primary/20 hover:bg-muted/30 text-sm"
                            onclick={() => handleOpenSession(session)}
                          >
                            <div class="flex items-start justify-between gap-3">
                              <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                  <span
                                    class="size-1.5 shrink-0 rounded-full {session.status === 'active'
                                      ? 'bg-emerald-500'
                                      : session.status === 'archived'
                                        ? 'bg-zinc-400'
                                        : 'bg-amber-500'}"
                                  ></span>
                                  <span class="truncate font-medium leading-tight">{session.title}</span>
                                  {#if session.unread}
                                    <span class="size-1.5 shrink-0 rounded-full bg-primary"></span>
                                  {/if}
                                </div>
                                <div class="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                                  <span class="inline-flex items-center gap-1"
                                    ><FolderGit2 class="size-3" /> {session.project}</span
                                  >
                                  <span>·</span>
                                  <span class="inline-flex items-center gap-1"
                                    ><Bot class="size-3" /> {session.model}</span
                                  >
                                  <span>·</span>
                                  <span class="inline-flex items-center gap-1"
                                    ><Clock3 class="size-3" /> {session.updatedAt}</span
                                  >
                                </div>
                              </div>
                              <ArrowUpRight
                                class="text-muted-foreground size-4 shrink-0 opacity-0 transition group-hover/session:opacity-100"
                              />
                            </div>
                            <div class="flex flex-wrap items-center gap-1.5">
                              <Badge
                                variant={session.status === "active"
                                  ? "default"
                                  : session.status === "archived"
                                    ? "outline"
                                    : "secondary"}
                                class="rounded-full gap-1"
                              >
                                {#if session.status === "active"}<Activity class="size-3" />{/if}
                                {session.status}
                              </Badge>
                              <Badge variant="outline" class="rounded-full">{session.messages} msgs</Badge>
                              <Badge variant="secondary" class="rounded-full hidden sm:inline-flex"
                                >{session.project}</Badge
                              >
                              <span class="ml-auto flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  class="h-6 rounded-full"
                                  onclick={(e) => {
                                    e.stopPropagation()
                                    toast.message("Archived", { description: session.title })
                                  }}
                                >
                                  <Archive class="size-3" /> Archive
                                </Button>
                              </span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </ScrollArea>

          <div class="flex items-center justify-between border-t bg-muted/20 px-3 py-2 text-xs">
            <span class="text-muted-foreground">TanStack Query · placeholderData keeps UI instant</span>
            <span class="text-muted-foreground hidden sm:inline"
              >Tip: <kbd class="bg-muted rounded border px-1 py-0.5">⌘</kbd> + click to open in background</span
            >
          </div>
        </Card.Root>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <Card.Root class="border-dashed">
            <Card.Header class="pb-2">
              <Card.Title class="text-sm flex items-center gap-2"
                ><Command class="size-4 text-muted-foreground" /> How it maps</Card.Title
              >
              <Card.Description class="text-xs leading-relaxed">
                Solid <code class="bg-muted rounded px-1">HomeProjects</code> → Svelte left pane ·
                <code class="bg-muted rounded px-1">HomeSessions</code>
                → right pane · controllers → <code class="bg-muted rounded px-1">createQuery</code> + runes.
              </Card.Description>
            </Card.Header>
          </Card.Root>
          <Card.Root class="border-dashed">
            <Card.Header class="pb-2">
              <Card.Title class="text-sm flex items-center gap-2"
                ><Sparkles class="size-4 text-muted-foreground" /> Next wiring</Card.Title
              >
              <Card.Description class="text-xs leading-relaxed">
                Replace <code class="bg-muted rounded px-1">MOCK_*</code> with
                <code class="bg-muted rounded px-1">fetch("/api/projects")</code>
                / <code class="bg-muted rounded px-1">fetch("/api/sessions")</code> and keep the same query keys.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        </div>
      </div>
    </div>
  </main>
</div>
