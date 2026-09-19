<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js"
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js"
  import { Separator } from "$lib/components/ui/separator/index.js"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
  import * as Tooltip from "$lib/components/ui/tooltip/index.js"
  import { toast } from "svelte-sonner"
  import {
    ArrowLeft,
    Archive,
    Copy,
    EllipsisVertical,
    FolderOpen,
    Share2,
    SquarePen,
    Trash2,
    CircleDot,
    Loader2,
    CheckCircle2,
    AlertCircle,
  } from "@lucide/svelte"
  import type { Session } from "$lib/api/session.js"

  let { session, onBack }: { session: Session; onBack?: () => void } = $props()

  let statusConfig = $derived.by(() => {
    switch (session.status) {
      case "active":
        return {
          label: "Active",
          variant: "default" as const,
          icon: CircleDot,
          cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
        }
      case "running":
        return {
          label: "Running",
          variant: "secondary" as const,
          icon: Loader2,
          cls: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
        }
      case "idle":
        return { label: "Idle", variant: "outline" as const, icon: CheckCircle2, cls: "" }
      case "archived":
        return { label: "Archived", variant: "outline" as const, icon: Archive, cls: "opacity-70" }
      case "error":
        return { label: "Error", variant: "destructive" as const, icon: AlertCircle, cls: "" }
      default:
        return { label: session.status, variant: "outline" as const, icon: CircleDot, cls: "" }
    }
  })

  let formattedDate = $derived(
    new Date(session.updatedAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  )

  function copyId() {
    navigator.clipboard.writeText(session.id)
    toast.success("Session ID copied")
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard")
  }
</script>

<header class="bg-card/60 supports-backdrop-filter:bg-card/80 sticky top-0 z-10 border-b backdrop-blur">
  <div class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
    {#if onBack}
      <Button variant="ghost" size="icon-sm" onclick={onBack} aria-label="Back to sessions">
        <ArrowLeft class="size-4" />
      </Button>
    {:else}
      <Button variant="ghost" size="icon-sm" href="/session" aria-label="Back to sessions">
        <ArrowLeft class="size-4" />
      </Button>
    {/if}

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <h1 class="truncate text-sm font-semibold tracking-tight">{session.title}</h1>
        <Badge variant={statusConfig.variant} class={statusConfig.cls}>
          {@const Icon = statusConfig.icon}
          <Icon class="size-3 {session.status === 'running' ? 'animate-spin' : ''}" />
          {statusConfig.label}
        </Badge>
        {#if session.model}
          <Badge variant="outline" class="hidden sm:inline-flex font-mono text-[11px]">{session.model}</Badge>
        {/if}
      </div>
      <div class="text-muted-foreground flex items-center gap-2 text-xs">
        <span class="inline-flex items-center gap-1 truncate">
          <FolderOpen class="size-3 shrink-0" />
          {session.directory}
        </span>
        <span class="hidden sm:inline">·</span>
        <span class="hidden sm:inline">{formattedDate}</span>
        <span class="hidden sm:inline">·</span>
        <span class="hidden sm:inline">{session.messageCount} messages</span>
        <span class="font-mono text-[11px] opacity-60 hidden lg:inline truncate">{session.id.slice(0, 16)}…</span>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <Tooltip.Root>
        <Tooltip.Trigger
          class={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          onclick={copyId}
          aria-label="Copy session ID"
        >
          <Copy class="size-4" />
        </Tooltip.Trigger>
        <Tooltip.Content>Copy session ID</Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger
          class={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          onclick={handleShare}
          aria-label="Share session"
        >
          <Share2 class="size-4" />
        </Tooltip.Trigger>
        <Tooltip.Content>Copy link</Tooltip.Content>
      </Tooltip.Root>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger class={buttonVariants({ variant: "outline", size: "icon-sm" })} aria-label="More actions">
          <EllipsisVertical class="size-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-48">
          <DropdownMenu.Item onclick={() => toast.info("Rename — coming soon")}>
            <SquarePen class="size-4" /> Rename
          </DropdownMenu.Item>
          <DropdownMenu.Item onclick={() => toast.info("Archive — coming soon")}>
            <Archive class="size-4" /> Archive
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onclick={() => toast.error("Delete — coming soon")}
            class="text-destructive focus:text-destructive"
          >
            <Trash2 class="size-4" /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>
</header>
