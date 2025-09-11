<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user";
  import { roleManageUsers } from "$lib/stores/role-manage-users.svelte";

  $: if (!roleManageUsers.set.has($user?.id)) {
    goto('/');
  }
</script>

<slot />