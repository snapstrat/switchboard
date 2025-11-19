<!--
@component
The Route component is used to define a route in the application.
It registers the route with the router when mounted and unregisters it when destroyed.
Once registered, the route can be navigated to using the router's switchTo method.

The children of this component make the content that will be displayed when the route is active.
-->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { RouteContainer } from '$lib/router/router.svelte';

	export type RouteProps = {
		path: string;
		container?: RouteContainer;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		type ApplicationRoute, getAllLayouts, getLayout, getRouteContainer, getRouter, type LayoutData, RoutePath
	} from '$lib';

  let {
    path,
		container,
    children,
  }: RouteProps = $props();

	let router = getRouter();

	let route : ApplicationRoute | undefined = $state.raw();

  onMount(() => {
		const layout = getLayout();

		container ??= getRouteContainer();

		const layoutPath = layout?.joinedPath ?? '';

		const combinedPath = RoutePath.concatPaths(layoutPath, path);

		route = {
			path: RoutePath.fromString(combinedPath),
			component: children,
			layout: container.isRouter() ? undefined : container as LayoutData
		};
		container.registerRoute(route);
  });

	onDestroy(async () => {
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
