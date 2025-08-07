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
    identifier?: string;
  };
</script>

<script lang="ts">
  import { onMount, setContext, tick } from 'svelte';
  import Route from './Route.svelte';
  import { Link, ROUTER_CONTEXT_KEY, ROUTER_DEFAULT } from './index';

  let { router, children, identifier }: PageRouterProps = $props();

  onMount(async () => {
    await tick();
    const params = parseWindowSearchParams();
    router.switchTo(window.location.pathname, params);
  });

  function parseWindowSearchParams(): Record<string, string> {
    const params: Record<string, string> = {};

    new URL(window.location.href).searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  setContext(ROUTER_CONTEXT_KEY + (identifier ?? ROUTER_DEFAULT), router);
</script>

<Route path="404">
  <!-- This is blank because it's simply a fallback in case there is no 404 page -->
  <svelte:fragment />
</Route>

<Link/>

{@render children?.()}

{@render router.currentRoute?.route?.component?.()}
