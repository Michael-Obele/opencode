<script lang="ts">
  import "./layout.css"
  import favicon from "$lib/assets/favicon.svg"
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query"
  import { ModeWatcher, toggleMode, setMode, resetMode } from "mode-watcher"
  import { Toaster } from "$lib/components/ui/sonner/index.js"
  import * as Tooltip from "$lib/components/ui/tooltip/index.js"
  import * as Sheet from "$lib/components/ui/sheet/index.js"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import AppSidebar from "$lib/components/layout/app-sidebar.svelte"
  import HealthBadge from "$lib/components/layout/health-badge.svelte"
  import { page } from "$app/state"
  import { Menu, Moon, Sun, Settings, PanelLeftClose, PanelLeftOpen, Command, Search, Sparkles } from "@lucide/svelte"

  let { children } = $props()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })

  let sidebarCollapsed = $state(false)
  let mobileOpen = $state(false)

  let pathname = $derived(page.url.pathname)

  let pageTitle = $derived.by(() => {
    if (pathname === "/") return "Chat"
    if (pathname.startsWith("/sessions")) return "Sessions"
    if (pathname.startsWith("/new")) return "New Session"
    if (pathname.startsWith("/settings")) return "Settings"
    if (pathname.startsWith("/dashboard")) return "Dashboard"
    return "opencode"
  })

  let breadcrumb = $derived.by(() => {
    if (pathname === "/") return [{ label: "Home", href: "/" }]
    const parts = pathname.split("/").filter(Boolean)
    return [
      { label: "Home", href: "/" },
      ...parts.map((p, i) => ({
        label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "),
        href: "/" + parts.slice(0, i + 1).join("/"),
      })),
    ]
  })

  $effect(() => {
    // close mobile sheet on navigation
    void pathname
    mobileOpen = false
  })
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
<Toaster richColors closeButton />
<Tooltip.Provider>
  <QueryClientProvider client={queryClient}>
    <div class="bg-background text-foreground min-h-screen antialiased">
      <!-- App shell -->
      <div class="flex min-h-screen">
        <!-- Desktop sidebar -->
        <aside
          class="bg-sidebar text-sidebar-foreground hidden shrink-0 flex-col border-r lg:flex {sidebarCollapsed
            ? 'w-18'
            : 'w-72'} transition-[width] duration-200 ease-in-out"
        >
          <AppSidebar collapsed={sidebarCollapsed} onToggle={() => (sidebarCollapsed = !sidebarCollapsed)} />
        </aside>

        <!-- Main column -->
        <div class="flex min-w-0 flex-1 flex-col">
          <!-- Top bar -->
          <header
            class="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b px-3 backdrop-blur sm:px-4"
          >
            <!-- Mobile menu -->
            <Sheet.Root bind:open={mobileOpen}>
              <Sheet.Trigger
                class={buttonVariants({ variant: "ghost", size: "icon" }) + " lg:hidden"}
                aria-label="Open navigation"
              >
                <Menu class="size-4" />
              </Sheet.Trigger>
              <Sheet.Content side="left" class="w-75 p-0">
                <Sheet.Header class="sr-only">
                  <Sheet.Title>Navigation</Sheet.Title>
                </Sheet.Header>
                <AppSidebar collapsed={false} onToggle={() => (mobileOpen = false)} />
              </Sheet.Content>
            </Sheet.Root>

            <!-- Collapse toggle (desktop) -->
            <Tooltip.Root>
              <Tooltip.Trigger
                class={buttonVariants({ variant: "ghost", size: "icon-sm" }) + " hidden lg:inline-flex"}
                onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {#if sidebarCollapsed}
                  <PanelLeftOpen class="size-4" />
                {:else}
                  <PanelLeftClose class="size-4" />
                {/if}
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom">
                {sidebarCollapsed ? "Expand" : "Collapse"} sidebar
              </Tooltip.Content>
            </Tooltip.Root>

            <Separator orientation="vertical" class="hidden h-6 lg:block" />

            <!-- Breadcrumb / title -->
            <div class="min-w-0 flex-1">
              <div class="hidden items-center gap-1.5 sm:flex">
                {#each breadcrumb as crumb, i (crumb.href)}
                  <a
                    href={crumb.href}
                    class="text-xs {i === breadcrumb.length - 1
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'} transition-colors"
                  >
                    {crumb.label}
                  </a>
                  {#if i < breadcrumb.length - 1}
                    <span class="text-muted-foreground text-xs">/</span>
                  {/if}
                {/each}
              </div>
              <div class="flex items-center gap-2 sm:hidden">
                <div
                  class="bg-primary text-primary-foreground grid size-7 place-items-center rounded-lg shadow-sm lg:hidden"
                >
                  <Sparkles class="size-3.5" />
                </div>
                <p class="truncate text-sm font-semibold tracking-tight">{pageTitle}</p>
                <Badge variant="outline" class="hidden text-[10px] sm:inline-flex">Svelte 5</Badge>
              </div>
              <p class="text-muted-foreground hidden truncate text-xs lg:block">
                SvelteKit 2 · TanStack Query 6 · shadcn-svelte · Netlify
              </p>
            </div>

            <!-- Search (desktop) -->
            <button
              class="text-muted-foreground bg-muted/60 hover:bg-muted hidden items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors xl:flex"
              onclick={() => {}}
              aria-label="Search"
            >
              <Search class="size-3.5" />
              <span>Search…</span>
              <kbd
                class="bg-background ml-2 hidden items-center gap-1 rounded border px-1 py-0.5 text-[10px] font-medium sm:inline-flex"
                ><Command class="size-3" />K</kbd
              >
            </button>

            <!-- Actions -->
            <div class="flex shrink-0 items-center gap-1">
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
                <DropdownMenu.Trigger
                  class={buttonVariants({ variant: "ghost", size: "icon" })}
                  aria-label="Theme menu"
                >
                  <Settings class="size-4" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end" class="w-44">
                  <DropdownMenu.Label>Theme</DropdownMenu.Label>
                  <DropdownMenu.Item onclick={() => setMode("light")}>
                    <Sun class="mr-2 size-4" /> Light
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onclick={() => setMode("dark")}>
                    <Moon class="mr-2 size-4" /> Dark
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onclick={() => resetMode()}>
                    <Command class="mr-2 size-4" /> System
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item onclick={() => window.location.reload()}>Reload</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <div class="hidden sm:inline-flex">
                <HealthBadge />
              </div>

              <Button href="/new" size="sm" class="hidden sm:inline-flex">New session</Button>
            </div>
          </header>

          <!-- Page content -->
          <main
            class="flex-1 min-w-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-muted/40 via-transparent to-transparent"
          >
            <div class="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
              {@render children()}
            </div>
          </main>

          <!-- Footer -->
          <footer class="text-muted-foreground border-t px-4 py-3 text-xs">
            <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <span>© {new Date().getFullYear()} opencode · SvelteKit web</span>
              <span class="hidden sm:inline"
                >Press <kbd class="bg-muted rounded border px-1 py-0.5">⌘ B</kbd> to toggle sidebar</span
              >
            </div>
          </footer>
        </div>
      </div>
    </div>
  </QueryClientProvider>
</Tooltip.Provider>
