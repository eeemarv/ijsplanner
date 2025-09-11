<script lang="ts">
  import { goto } from "$app/navigation";
  import { roleUsers } from "$lib/stores/role-users.svelte";
  import { user } from "$lib/stores/user.svelte";

  $: if (!user.id || !roleUsers.set.has(user.id)) {
    goto('/');
  }
</script>

<slot />