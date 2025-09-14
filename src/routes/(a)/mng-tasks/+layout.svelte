<script lang="ts">
  import { groups } from "$lib/stores/groups.svelte";
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user.svelte";
  import { id2 } from "$lib/func";
  import { roleUsers } from "$lib/stores/role-users.svelte";
  import { roleTasks } from "$lib/stores/role-tasks.svelte";

  let { children } = $props();

  let rGroups = $derived([...groups.map.keys().filter((group_id) => {
    if (!user.id){
      return false;
    }
    if (!roleUsers.set.has(user.id)){
      return false;
    }
    if (user.id && roleTasks.set.has(id2(group_id, user.id))){
      return true;
    }
    return false;
  })]);

  $effect(() => {
    if (!rGroups.length){
      goto('/');
    }
  });
</script>

{@render children?.()}