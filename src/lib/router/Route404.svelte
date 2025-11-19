<svelte:options runes={true} />
<script lang="ts" module>
  import type { Snippet } from 'svelte';
	import type { RouteContainer } from '$lib/router/router.svelte';
  export type Route404Props = {
    children: Snippet;
		container?: RouteContainer;

  }
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
	import {
		type ApplicationRoute,
		getAllLayouts,
		getLayout,
		getRouteContainer,
		getRouter,
		type LayoutData,
		RoutePath
	} from '$lib';

  let { children, container }: Route404Props = $props();

  let router = getRouter();

  let route : ApplicationRoute | undefined = $state.raw();

  onMount(() => {
		const layout = getLayout();

		container ??= getRouteContainer();

		const layoutPath = layout?.joinedPath ?? '';

    route = {
      path: RoutePath.fromString(layoutPath, true),
      component: children,
			layout: container.isRouter() ? undefined : container as LayoutData
		};
    container.registerRoute404(route);
  });

  onDestroy(() => {
    if (route) {
      const container = getLayout() ?? router;
      container.unregisterRoute(route);
    }
  })

	const currentAppRoute = $derived(router.currentRoute?.route);
	const layouts = $derived(getAllLayouts(currentAppRoute?.layout));
</script>

{#snippet layoutRender(remaining: LayoutData[])}
	{#if remaining.length === 0}
		{@render currentAppRoute?.component?.()}
	{:else}
		{@const next = remaining[0]}

		{#snippet renderer()}
			{@render layoutRender(remaining.slice(1))}
		{/snippet}

		{@render next.renderer(renderer)}
	{/if}
{/snippet}

{#if currentAppRoute === route}
	{@render layoutRender(layouts)}
{/if}