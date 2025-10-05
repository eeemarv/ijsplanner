<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user.svelte";
  import { config } from "$lib/stores/config.svelte";

	let { children } = $props();

  $effect(() => {
    if (!user.id) {
      goto('/');
    }
  });

</script>

{@render children?.()}

{#if config.map.has('footer')}
  <div class="h-20"></div>
{/if}