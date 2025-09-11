<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/components/Navbar.svelte';
  import { onMount } from 'svelte';
  import { initAuth } from '$lib/stores/user.svelte';

	let { children } = $props();

  onMount(() => {
    initAuth();
  });

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />

<!--
<div role="alert" class="alert alert-error alert-outline mx-4 my-2">
  <span>TEST FASE. Dit is <u>geen</u> echte planning</span>
</div>-->

{@render children?.()}