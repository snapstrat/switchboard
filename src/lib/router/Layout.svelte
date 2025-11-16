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

	type LayoutInternals = { routes: ApplicationRoute[], _routes: ApplicationRoute[] }
	const layoutData: LayoutData & LayoutInternals = {
		_routes: [],
		get routes() {
			return this._routes.toReversed();
		},
		path: path ? RoutePath.normalizePath(path) : undefined,
		parent: getLayout(),
		registerRoute(route: ApplicationRoute) {
			getRouter().registerRoute(route);
			this._routes.push(route);
		},
		registerRoute404(route: ApplicationRoute) {
			getRouter().registerRoute404(route);
			this._routes.push(route);
		},
		unregisterRoute(route: ApplicationRoute) {
			getRouter().unregisterRoute(route);
			this._routes.splice(this.routes.indexOf(route), 1);
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