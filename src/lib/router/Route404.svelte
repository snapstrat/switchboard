<svelte:options runes={true} />

<script lang="ts">
  import Route from './Route.svelte';
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
  };

  let { children }: Props = $props();
</script>

<Route name="Not Found" path="404">
  {@render children()}
</Route>
