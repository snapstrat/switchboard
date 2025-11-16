<!--
@component
Represents a link that can be used to navigate within the application.
-->

<script module lang="ts">
  import { type Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  export type LinkProps = {
    /**
     * The content to display inside the link.
     */
    children?: Snippet;
  } & HTMLAnchorAttributes;
</script>


<script lang="ts">
  import { href } from './router.svelte';

  const { children, ...attrs }: LinkProps = $props();
</script>

<a {...attrs} {@attach href(attrs.href)}>
  {@render children?.()}
</a>
