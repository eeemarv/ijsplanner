<script lang="ts">
  import { usernames } from "$lib/stores/usernames.svelte";
  import { groups } from "$lib/stores/groups.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { capitalize } from "$lib/func";
  import { UserCheck, UserPen, Users } from "lucide-svelte";
  import { goto } from "$app/navigation";

  const getGroupName = (group_id: string) => {
    return capitalize(groups.map.get(group_id) ?? '** ERROR **');
  };
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <Users class="inline-block" />
      Gebruikersbeheer
    </h1>
    <button
      class="btn btn-success"
      onclick={() => goto('/mng-users/add')}
    >
      <UserCheck />
      Voeg toe
    </button>
  </div>

  <div class="overflow-x-auto">
    <table class="table table-auto table-zebra border border-neutral-content">
      <tbody>
        {#each usernames.map as [user_id, username], i}
          <tr>
            <td class="border w-10 px-4"
              rowspan={usersGroups.map.get(user_id)?.size ?? 1}
            >
              <button
                class="btn btn-primary btn-sm"
                onclick={() => goto('/mng-users/' + user_id)}
              >
                <UserPen />
              </button>
            </td>
            <th
              class="border w-20 whitespace-nowrap"
              rowspan={usersGroups.map.get(user_id)?.size ?? 1}
            >
              {username}
            </th>
            <td class="border">
              {#if !usersGroups.map.has(user_id) }
                <span class="badge badge-warning">
                  Geen lid van een groep
                </span>
              {:else}
                {getGroupName([...(usersGroups.map.get(user_id) ?? [])][0])}
              {/if}
            </td>
          </tr>
          {#each [...(usersGroups.map.get(user_id) ?? [])] as group_id, i}
            {#if i}
              <tr>
                <td class="border">
                  {getGroupName(group_id)}
                </td>
              </tr>
            {/if}
          {/each}
        {/each}
      </tbody>
    </table>
  </div>
</div>