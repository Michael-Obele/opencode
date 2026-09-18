<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000
			}
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
