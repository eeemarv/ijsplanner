<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/components/Navbar.svelte';
  import { onMount } from 'svelte';
  import { initAuth } from '$lib/stores/user.svelte';
  import { config, loadConfig } from '$lib/stores/config.svelte';

	let { children } = $props();

  onMount(() => {
    Promise.all([
      initAuth(),
      loadConfig(),
    ]);
  });

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />

<main class="pt-15">

{#if config.map.has('alert')}
  <div role="alert" class="alert alert-warning mx-4 my-2">
    <span>{@html config.map.get('alert')}</span>
  </div>
{/if}

{@render children?.()}

</main>

{#if config.map.has('footer')}
  <footer
    class={{
      'footer': true,
      'footer-center': true,
      'sm:footer-horizontal': true,
      'bg-slate-500/10': true,
      'text-neutral-content': false,
      'p-10': true,
    }}
  >
    <nav>
      {@html config.map.get('footer')}
    </nav>
  </footer>
{/if}