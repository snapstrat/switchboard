<!--
@component
Represents a link that can be used to navigate within the application.
-->

<script module lang="ts">
  import { type Snippet } from 'svelte';
  import type { AvailableContext } from '$lib/router/router.svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  export type LinkProps = {
    /**
     * The content to display inside the link.
     */
    children?: Snippet;

    routerId?: AvailableContext;
  } & HTMLAnchorAttributes;
</script>


<script lang="ts">
  import { getRouter } from './router.svelte';

  const { children, routerId = "default", ...attrs }: LinkProps = $props();

  let router = getRouter(routerId);

  function onClick(ev: Event) {
    ev.preventDefault();
    if (attrs.href) router.switchTo(attrs.href);
  }
</script>

<a {...attrs} onclick={onClick} onkeydown={onClick}>
  {@render children?.()}
</a>
