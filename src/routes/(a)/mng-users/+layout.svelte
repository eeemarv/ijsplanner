<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user";
  import { roleManageUsersSet } from "$lib/stores/role-manage-users";

  $: if (!$roleManageUsersSet.has($user.id)) {
    goto('/');
  }
</script>

<slot />