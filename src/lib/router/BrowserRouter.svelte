<!--
@component
The BrowserRouter component is the main entry point for routing in an application using Switchboard.
It initializes the routes, listens for changes in the URL to switch routes accordingly,
and displays the appropriate component based on the current route.
-->
<script module lang="ts">
  import type { Router } from './router.svelte';
  import type { Snippet } from 'svelte';

  export type PageRouterProps = {
    /**
     * The router instance that manages the application's routes.
     *
     * @see {@link Router}
     * @see {@link createWebRouter}
     */
    router: Router;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { setRouterContext, type LayoutData, getAllLayouts, Route404 } from './index';
  import { parseWindowSearchParams } from '$lib/router/internals/paramsUtils';

  let { router, children }: PageRouterProps = $props();

  onMount(async () => {
    await tick();
    const params = parseWindowSearchParams();

    router.switchTo(window.location.pathname, params);
  });

  setRouterContext(router);

  const currentAppRoute = $derived(router.currentRoute?.route);
  const layouts = $derived(getAllLayouts(currentAppRoute?.layout));

  $inspect(layouts);
</script>

<Route404>
  <!-- This is blank because it's simply a fallback in case there is no 404 page -->
  <svelte:fragment />
</Route404>

{@render children?.()}

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

{@render layoutRender(layouts)}
