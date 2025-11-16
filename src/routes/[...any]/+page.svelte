<script lang="ts">
	import {
		BrowserRouter, createWebRouter, Link, Route, Route404, href, Layout, getQueryParams, getRouteParams,
		type LayoutData
	} from '$lib';
	import { PageInfo } from '$lib';
	import PersistenceLayout from './PersistenceLayout.svelte';
	import { onMount, tick } from 'svelte';

	const router = createWebRouter()

	// workaround for eslint error
	type str = string;

	let escapeLayout: LayoutData = $state(undefined!);
</script>

<!--
This is NOT intended to be an example file, but rather a testbed for various routing features.

As such, it has some pretty esoteric routes and components for the sake of testing and completeness.
-->

{#snippet identify(id: str)}
	<PageInfo title={id} />
	<p><strong {id}>{id}</strong></p>
{/snippet}

<BrowserRouter {router}>
	<Route404>
		{@render identify('page-not-found')}
	</Route404>

	<Route path="/">
		{@render identify('root-route')}
	</Route>

	<Route path="/overwritten-route">
		{@render identify('overwritten-route')}
	</Route>

	<Route path="/overwritten-route">
		{@render identify('overwritten-route-2')}
	</Route>

	<Route path="/links/component/start">
		{@render identify('links-component-start')}
		<Link href="/links/component/finish" id="go-to-finish">Go to /links/component/finish</Link>
	</Route>

	<Route path="/links/component/finish">
		{@render identify('links-component-finish')}
	</Route>


	<Route path="/links/attachment/start">
		{@render identify('links-attachment-start')}
		<a {@attach href("/links/attachment/finish")} id="go-to-finish">Go to /links/attachment/finish</a>
	</Route>

	<Route path="/links/attachment/finish">
		{@render identify('links-attachment-finish')}
	</Route>

	<Route path="/route-params/">
		{@render identify('route-params-fallback')}
	</Route>

	<Route path="/route-params/:param1/:param2">
		{@render identify('route-params')}
		<ul>
			<li id="param1">{getRouteParams().param1}</li>
			<li id="param2">{getRouteParams().param2}</li>
		</ul>
	</Route>

	<Route path="/query-params">
		<strong>Query Parameters</strong>
		{#each Object.entries(getQueryParams()) as [key, value] (key)}
			<ul>
				<li id="param-{key}">{key}:{value}</li>
			</ul>
		{/each}
	</Route>

	<Layout path="/layout">
		{#snippet routes()}
			<Route path="child-1">
				{@render identify('child-1')}
			</Route>

			<Route path="child-2">
				{@render identify('child-2')}
			</Route>

			<Route path="/">
				{@render identify('layout-root')}
			</Route>
		{/snippet}

		{#snippet layout(children)}
			{@render identify('layout')}
			{@render children()}
		{/snippet}
	</Layout>

	<Layout path="/layout-nested">
		{#snippet routes()}
			<Route path="nested-child">
				{@render identify('nested-child-1')}
			</Route>

			<Route path="/">
				{@render identify('nested-layout-root')}
			</Route>

			<Layout path="/nested/">
				{#snippet routes()}
					<Route path="nested-child-2">
						{@render identify('nested-child-2')}
					</Route>

					<Route path="/">
						{@render identify('nested-layout-root-2')}
					</Route>
				{/snippet}

				{#snippet layout(children)}
					{@render identify('inner-layout')}
					{@render children()}
				{/snippet}
			</Layout>

			<Layout path="/param/:id/">
				{#snippet routes()}
					<Route path="nested-child-3">
						{@render identify('nested-child-3')}
						<span id="route-param-id">{getRouteParams().id}</span>
					</Route>

					<Route path="/">
						{@render identify('nested-layout-root-3')}
						<span id="route-param-id">{getRouteParams().id}</span>
					</Route>
				{/snippet}

				{#snippet layout(children)}
					{@render identify('nested-layout-route-param')}
					{@render children()}
				{/snippet}
			</Layout>
		{/snippet}

		{#snippet layout(children)}
			{@render identify('layout-nested')}
			{@render children()}
		{/snippet}
	</Layout>

	<Layout path="/persistence">
		{#snippet routes()}
			<Route path="1">
				{@render identify('persistence-1')}
				<Link id="persistence-go-to-2" href="/persistence/2">go to 2</Link>
			</Route>

			<Route path="2">
				{@render identify('persistence-2')}
				<Link id="persistence-go-to-1" href="/persistence/1">go to 1</Link>
			</Route>

			<Route404>
				{@render identify('persistence-404')}
			</Route404>
		{/snippet}

		{#snippet layout(route)}
			<PersistenceLayout {identify} />
			{@render route()}
		{/snippet}
	</Layout>

	<Layout path="/override-layout-param/:param">
		{#snippet routes()}
			<Route path="/">
				{@render identify('override-layout-param-root')}
				<span id="override-layout-param-root-value">{getRouteParams().param}</span>
			</Route>

			<Route path="/foo">
				{@render identify('override-layout-param-foo')}
				<span id="override-layout-param-foo-value">{getRouteParams().param}</span>
			</Route>
		{/snippet}

		{#snippet layout(children)}
			{@render identify('override-layout-param')}
			{@render children()}
		{/snippet}
	</Layout>

	<Route path="/override-layout-param/not-layout">
		{@render identify('override-layout-param-not-layout')}
		<span id="override-layout-param-not-layout-value">{getRouteParams().param ?? '(no-value)'}</span>
	</Route>

	<Layout path="/layout-to-escape">
		{#snippet layout(children)}
			{@render identify('layout-to-escape')}
			{@render children()}
		{/snippet}

		{#snippet routes()}
			<Route path=""></Route>

			<Route path="/inner-route">
				{@render identify('layout-to-escape-inner-route')}
			</Route>

			<Route path="/escape" container={router}>
				{@render identify('escaped-route')}
			</Route>

			<Route path="/escape-to-other" container={escapeLayout}>
				{@render identify('escape-to-other-layout')}
			</Route>

			<Route404 container={escapeLayout}>
				{@render identify('escaped-to-other-layout-404')}
			</Route404>
		{/snippet}
	</Layout>

	<Layout path="/other-layout-to-escape-to" bind:ref={escapeLayout}>
		{#snippet layout(children)}
			{@render identify('other-layout-to-escape-to')}
			{@render children()}
		{/snippet}

		{#snippet routes()}
			<Route path="/inner-route">
				{@render identify('other-layout-to-escape-to-inner-route')}
			</Route>
		{/snippet}
	</Layout>

</BrowserRouter>

