<script lang="ts">
  import { page } from "$app/state"
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js"
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import * as Tooltip from "$lib/components/ui/tooltip/index.js"
  import * as Avatar from "$lib/components/ui/avatar/index.js"
  import {
    House,
    MessagesSquare,
    Plus,
    Settings,
    Sparkles,
    Bot,
    LayoutDashboard,
    Search,
    Command,
    ExternalLink,
  } from "@lucide/svelte"

  let { collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void } = $props()

  let pathname = $derived(page.url.pathname)

  type NavItem = {
    label: string
    href: string
    icon: typeof House
    badge?: string
    count?: number
    desc?: string
  }

  const primary: NavItem[] = [
    { label: "Home", href: "/", icon: House, desc: "Chat & overview" },
    { label: "Sessions", href: "/sessions", icon: MessagesSquare, count: 3, desc: "Recent sessions" },
    { label: "New Session", href: "/new", icon: Plus, badge: "⌘ N", desc: "Start fresh" },
    { label: "Settings", href: "/settings", icon: Settings, desc: "Preferences" },
  ]

  const secondary: NavItem[] = [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, desc: "Project view" }]

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }
</script>

<div class="flex h-full flex-col">
  <!-- Brand -->
  <div class="flex h-16 shrink-0 items-center gap-3 border-b px-3">
    <div
      class="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-border/50"
    >
      <Sparkles class="size-4" />
    </div>
    {#if !collapsed}
      <div class="min-w-0 flex-1">
        <p class="text-[13px] font-semibold tracking-tight leading-none">opencode</p>
        <p class="text-muted-foreground text-[11px] leading-none mt-1">web · SvelteKit 2</p>
      </div>
      <Tooltip.Root>
        <Tooltip.Trigger
          class={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          onclick={onToggle}
          aria-label="Collapse sidebar"
        >
          <Command class="size-3.5" />
        </Tooltip.Trigger>
        <Tooltip.Content side="right">Collapse (⌘ B)</Tooltip.Content>
      </Tooltip.Root>
    {/if}
  </div>

  <!-- Search -->
  {#if !collapsed}
    <div class="p-3">
      <button
        class="text-muted-foreground bg-muted/60 hover:bg-muted flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors"
        onclick={() => {}}
      >
        <Search class="size-3.5" />
        <span class="flex-1 text-left">Search…</span>
        <kbd
          class="bg-background hidden items-center gap-0.5 rounded border px-1 py-0.5 text-[10px] font-medium sm:inline-flex"
          >⌘ K</kbd
        >
      </button>
    </div>
  {/if}

  <!-- Primary nav -->
  <nav class="flex-1 space-y-4 overflow-y-auto px-2 py-2">
    <div class="space-y-1">
      {#if !collapsed}
        <p class="text-muted-foreground px-2 py-1 text-[10px] font-semibold tracking-widest uppercase">Navigate</p>
      {/if}
      {#each primary as item (item.href)}
        {@const active = isActive(item.href)}
        {#if collapsed}
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <a
                  href={item.href}
                  class={buttonVariants({
                    variant: active ? "secondary" : "ghost",
                    size: "icon",
                  }) + " w-full relative inline-flex items-center justify-center"}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  {...props}
                >
                  <item.icon class="size-4" />
                  {#if item.count}
                    <span
                      class="bg-primary text-primary-foreground absolute -top-1 -right-1 grid size-4 place-items-center rounded-full text-[10px] leading-none"
                      >{item.count}</span
                    >
                  {/if}
                </a>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content side="right" class="flex items-center gap-2">
              {item.label}
              {#if item.badge}<kbd class="bg-muted rounded px-1 py-0.5 text-[10px]">{item.badge}</kbd>{/if}
            </Tooltip.Content>
          </Tooltip.Root>
        {:else}
          <a
            href={item.href}
            aria-current={active ? "page" : undefined}
            class="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors {active
              ? 'bg-secondary text-secondary-foreground font-medium shadow-xs ring-1 ring-border/50'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
          >
            <item.icon class="size-4 shrink-0 {active ? '' : 'opacity-70 group-hover:opacity-100'}" />
            <span class="flex-1 truncate">{item.label}</span>
            {#if item.count}
              <Badge variant={active ? "default" : "secondary"} class="h-5 px-1.5 text-[11px]">{item.count}</Badge>
            {:else if item.badge}
              <span
                class="bg-muted text-muted-foreground hidden rounded border px-1 py-0.5 text-[10px] group-hover:inline-flex"
                >{item.badge}</span
              >
            {/if}
          </a>
        {/if}
      {/each}
    </div>

    {#if !collapsed}
      <Separator />
      <div class="space-y-1">
        <p class="text-muted-foreground px-2 py-1 text-[10px] font-semibold tracking-widest uppercase">Project</p>
        {#each secondary as item (item.href)}
          {@const active = isActive(item.href)}
          <a
            href={item.href}
            class="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors {active
              ? 'bg-secondary text-secondary-foreground'
              : ''}"
          >
            <item.icon class="size-4" />
            <span class="flex-1 truncate">{item.label}</span>
          </a>
        {/each}
        <a
          href="https://github.com/sst/opencode"
          target="_blank"
          rel="noreferrer"
          class="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors"
        >
          <ExternalLink class="size-4" />
          <span class="flex-1 truncate">GitHub</span>
        </a>
      </div>

      <!-- Promo card -->
      <div class="from-primary/10 via-primary/5 to-transparent rounded-xl border bg-linear-to-br p-3 shadow-xs">
        <div class="flex items-center gap-2">
          <div class="bg-primary text-primary-foreground grid size-7 place-items-center rounded-lg">
            <Bot class="size-3.5" />
          </div>
          <p class="text-sm font-medium">Need help?</p>
        </div>
        <p class="text-muted-foreground mt-2 text-xs leading-5">
          Chat with opencode. Streaming via TanStack Query + SSE.
        </p>
        <Button size="sm" class="mt-3 w-full" href="/">Open chat</Button>
      </div>
    {/if}
  </nav>

  <!-- Footer -->
  <div class="shrink-0 border-t p-2">
    {#if collapsed}
      <div class="flex flex-col items-center gap-2 py-1">
        <Avatar.Root size="sm" class="size-8">
          <Avatar.Fallback class="bg-primary text-primary-foreground text-xs">OC</Avatar.Fallback>
        </Avatar.Root>
      </div>
    {:else}
      <div class="bg-muted/40 flex items-center gap-2.5 rounded-xl border px-2.5 py-2">
        <Avatar.Root size="sm" class="size-8">
          <Avatar.Fallback class="bg-primary text-primary-foreground">OC</Avatar.Fallback>
        </Avatar.Root>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-medium leading-none">opencode user</p>
          <p class="text-muted-foreground truncate text-[11px]">local workspace</p>
        </div>
        <Badge variant="secondary" class="h-5 px-1.5 text-[10px]">Pro</Badge>
      </div>
      <p class="text-muted-foreground px-1 pt-2 text-[11px] leading-4">Svelte 5 runes · shadcn-svelte · mode-watcher</p>
    {/if}
  </div>
</div>
