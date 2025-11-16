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
	import { onDestroy, onMount } from 'svelte';
	import {
		type ApplicationRoute, getLayout, getRouteContainer, getRouter, RoutePath
	} from '$lib';

  let {
    path,
    children,
  }: RouteProps = $props();

	let router = getRouter();

	let route : ApplicationRoute | undefined;

  onMount(() => {

		const layout = getLayout()
		const layoutPath = layout?.joinedPath ?? '';

		const combinedPath = RoutePath.concatPaths(layoutPath, path);

		const container = getRouteContainer();

		route = {
			path: RoutePath.fromString(combinedPath),
			component: children,
			layout
		};
		console.log("Registering normal route:", route);
		container.registerRoute(route);
  });

	onDestroy(() => {
		if (route) {
			const container = getLayout() ?? router;
			container.unregisterRoute(route);
		}
	})
</script>
