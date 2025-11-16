<script lang="ts" module>

	import type { Snippet } from 'svelte';
	import type { LayoutSnippet } from '$lib/router/router.svelte';

	export type LayoutProps = {
		path?: string;
		layout: LayoutSnippet;
		routes: Snippet;
	}
</script>

<script lang="ts">

	import { type ApplicationRoute, getAllLayouts, getLayout, getRouter, type LayoutData, RoutePath } from '$lib';
	import { setLayoutContext } from '$lib';
	import { onDestroy } from 'svelte';

	const { path, layout: renderer, routes }: LayoutProps = $props();

	const layoutData: LayoutData & { routes: ApplicationRoute[] } = {
		routes: [],
		path: path ? RoutePath.normalizePath(path) : undefined,
		parent: getLayout(),
		registerRoute(route: ApplicationRoute) {
			getRouter().registerRoute(route);
			this.routes.push(route);
		},
		unregisterRoute(route: ApplicationRoute) {
			getRouter().unregisterRoute(route);
			this.routes.splice(this.routes.indexOf(route), 1);
		},
		renderer,
		get joinedPath() {
			return getAllLayouts(this)
				.map((l) => l.path)
				.filter((p) => p !== undefined && p !== '')
				.join('/');
		},
	}
	setLayoutContext(layoutData)

	onDestroy(() => {
		setLayoutContext(layoutData.parent);
	})
</script>



{@render routes()}