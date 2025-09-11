<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user.svelte";

  $: if (!user.id) {
    goto('/');
  }
</script>

<slot />