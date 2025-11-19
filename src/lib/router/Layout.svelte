<script lang="ts" module>

	import type { Snippet } from 'svelte';
	import type { LayoutSnippet, RouteContainer } from '$lib/router/router.svelte';

	export type LayoutProps = {
		path: string;
		layout: LayoutSnippet;
		container?: RouteContainer;
		routes: Snippet;
		ref?: LayoutData;
	}
</script>

<script lang="ts">

	import {
		type ApplicationRoute, getAllCanonicalLayouts, getAllLayouts,
		getLayout,
		getRouter,
		type LayoutData,
		RoutePath,
		type Router
	} from '$lib';
	import { setLayoutContext } from '$lib';
	import { onDestroy } from 'svelte';

	let { path, layout: renderer, container, routes, ref = $bindable() }: LayoutProps = $props();

	type LayoutInternals = { routes: ApplicationRoute[], _routes: ApplicationRoute[] }

	let parent: LayoutData | undefined;
	if (!container) {
		parent = getLayout();
	} else {
		parent = container.isRouter() ? undefined : container as LayoutData;
	}

	const layoutData: LayoutData & LayoutInternals = {
		_routes: [],
		get routes() {
			return this._routes.toReversed();
		},
		path: path ? RoutePath.normalizePath(path) : undefined,
		parent,
		canonicalParent: getLayout(),
		registerRoute(route: ApplicationRoute) {
			getRouter().registerRoute(route);
			this._routes.push(route);
		},
		registerRoute404(route: ApplicationRoute) {
			getRouter().registerRoute404(route);
			this._routes.push(route);
		},
		unregisterRoute(route: ApplicationRoute) {
			getRouter()?.unregisterRoute(route);
			this._routes.splice(this.routes.indexOf(route), 1);
		},
		renderer,
		get joinedPath() {
			return getAllCanonicalLayouts(this)
				.map((l) => l.path)
				.filter((p) => p !== undefined && p !== '')
				.join('/');
		},
		isRouter(): this is Router { return false; }
	}
	ref = layoutData;

	setLayoutContext(layoutData);

	onDestroy(() => {
		setLayoutContext(layoutData.parent);
	})
</script>

{@render routes()}