<!--
@component
Provides a page title and icon for the current route.
-->
<script lang="ts" module>
	export type PageInfoProps = {
		title?: string;
		icon?: string;
	};
</script>

<script lang="ts">
	import { getRouter } from '$lib';

	const { title, icon }: PageInfoProps = $props();
</script>

<svelte:head>
	<title>{title ?? getRouter().options.defaultTitle}</title>
	{#if icon !== undefined}
		<link rel="icon" href={icon} />
	{/if}
</svelte:head>