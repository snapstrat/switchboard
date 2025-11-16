<svelte:options runes={true} />

<script lang="ts">
  import Route from './Route.svelte';
  import type { Snippet } from 'svelte';
  import { PageInfo, ROUTE_NOT_FOUND_KEY } from '$lib';

  type Props = {
    children: Snippet;
  };

  let { children }: Props = $props();
</script>

<Route path={ROUTE_NOT_FOUND_KEY}>
  <PageInfo title="Page Not Found"/>
  {@render children()}
</Route>
