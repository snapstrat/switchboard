
<script lang="ts">
	import type { Snippet } from 'svelte';

	const { identify } : { identify: Snippet<[string]> } = $props();

	let value = $state(0)

	const increment = () => {
		value += 1;
	};
</script>

{@render identify('persistence-layout')}

<p>Increment value: <span id="persistence-value">{value}</span></p>
<button id="persistence-increment" onclick={increment}>Increment</button>
