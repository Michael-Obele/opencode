<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query"
  import { Badge } from "$lib/components/ui/badge/index.js"

  const health = createQuery(() => ({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("/api/health")
      if (!res.ok) throw new Error("Health check failed")
      return res.json() as Promise<{ status: string }>
    },
  }))

  let label = $derived(health.isPending ? "checking" : health.isError ? "offline" : "online")
  let variant = $derived(health.isError ? "destructive" : health.isPending ? "outline" : "secondary") as
    | "destructive"
    | "outline"
    | "secondary"
</script>

<Badge {variant} class="capitalize">{label}</Badge>
