<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user.svelte";
  import { config } from "$lib/stores/config.svelte";

  $: if (!user.id) {
    goto('/');
  }
</script>

<slot />

{#if config.map.has('footer')}
  <div class="h-20"></div>
{/if}