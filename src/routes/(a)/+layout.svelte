<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user";

  $: if (!$user) {
    goto('/');
  }
</script>

<slot />