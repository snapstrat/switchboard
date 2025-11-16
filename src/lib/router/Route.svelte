<!--
@component
The Route component is used to define a route in the application.
It registers the route with the router when mounted and unregisters it when destroyed.
Once registered, the route can be navigated to using the router's switchTo method.

The children of this component make the content that will be displayed when the route is active.
-->
<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type RouteProps = {
		path: string;
		children?: Snippet;
	}
</script>

<script lang="ts">
  import { onMount } from 'svelte';
	import {
		type ApplicationRoute, getLayout, getRouter, ROUTE_NOT_FOUND_KEY, RoutePath
	} from '$lib';



  let {
    path,
    children,
  }: RouteProps = $props();

	let router = getRouter();


  onMount(() => {
    let route: ApplicationRoute;

		const layout = getLayout()
		const layoutPath = layout?.joinedPath ?? '';

		const combinedPath = RoutePath.concatPaths(layoutPath, path);

		const container = layout ?? router;
    // if this route is a 404 route, we need to unregister the old 404 route and use only this new one
    if (path == ROUTE_NOT_FOUND_KEY) {
      route = {
        path: RoutePath.fromString(combinedPath, true),
        component: children,
				layout
      };
			// replace the old 404 route in this layout or router
			const old = router.getRoute(combinedPath);
			container.unregisterRoute(old);
			container.registerRoute(route);
    } else {

			// if this route is not a 404 route, we need to unregister the old route if it exists and use only this new one
      route = {
        path: RoutePath.fromString(combinedPath),
        component: children,
				layout
      };
      if (!router.getRoute(combinedPath).path.is404) {
        const old = router.getRoute(combinedPath);
        container.unregisterRoute(old);
        container.registerRoute(route);
        return;
      }
      container.registerRoute(route);
    }
  });
</script>
