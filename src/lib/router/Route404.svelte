<svelte:options runes={true} />
<script lang="ts" module>
  import type { Snippet } from 'svelte';
  export type Route404Props = {
    children: Snippet;
  }
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
	import { type ApplicationRoute, getLayout, getRouteContainer, getRouter, RoutePath } from '$lib';

  let { children }: Route404Props = $props();

  let router = getRouter();

  let route : ApplicationRoute | undefined;

  onMount(() => {
    const layout = getLayout()
    const layoutPath = layout?.joinedPath ?? '';

    const container = getRouteContainer();

    route = {
      path: RoutePath.fromString(layoutPath, true),
      component: children,
      layout
    };
    console.log("Registering 404 route:", route);
    container.registerRoute404(route);
  });

  onDestroy(() => {
    if (route) {
      const container = getLayout() ?? router;
      container.unregisterRoute(route);
    }
  })
</script>