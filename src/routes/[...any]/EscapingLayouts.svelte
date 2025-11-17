<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Layout, type LayoutData, Route } from '$lib';

	const { identify } : { identify: Snippet<[string]> } = $props();

	let newLocation: LayoutData = $state(undefined!);
</script>

<Layout path="layout-escaping-other-layout" bind:ref={newLocation}>
	{#snippet routes()}
		<Route path="route">
			{@render identify('new-location-route')}
		</Route>
	{/snippet}

	{#snippet layout(children)}
		{@render identify('layout-escaping-other-layout')}
		{@render children()}
	{/snippet}
</Layout>

<Layout path="layout-escaping">
	{#snippet routes()}
		<Route path="route">
			{@render identify('route')}
		</Route>

		<Layout path="layout-to-change-parent" container={newLocation}>
			{#snippet routes()}
				<Route path="child-route">
					{@render identify('child-route')}
				</Route>
			{/snippet}

			{#snippet layout(children)}
				{@render identify('layout-to-change-parent')}
				{@render children()}
			{/snippet}
		</Layout>
	{/snippet}

	{#snippet layout(children)}
		{@render identify('layout-escaping')}
		{@render children()}
	{/snippet}
</Layout>

