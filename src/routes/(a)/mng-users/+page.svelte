<script lang="ts">
  import { usernamesMap } from "$lib/stores/usernames";
  import { groupsMap } from "$lib/stores/groups";
  import { usersGroupsMap } from "$lib/stores/users-groups";
  import { capitalize } from "$lib/func";
  import { UserCheck, UserPen, Users } from "lucide-svelte";
  import { goto } from "$app/navigation";

  const getGroupName = (group_id: string) => {
    return capitalize($groupsMap.get(group_id) ?? '** ERROR **');
  };

  $: console.log('--USERNAMES--', $usernamesMap);
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <Users class="inline-block" />
      Gebruikersbeheer
    </h1>
    <button
      class="btn btn-success"
      on:click={() => goto('/mng-users/add')}
    >
      <UserCheck />
      Voeg toe
    </button>
  </div>

  <div class="overflow-x-auto">
    <table class="table table-auto table-zebra table-fixed border border-neutral-content">
      <tbody>
        {#each [...$usernamesMap] as [user_id, username], i}
          <tr>
            <td class="border w-min">
              <button
                class="btn btn-primary btn-sm"
                on:click={() => goto('/mng-users/' + user_id)}
              >
                <UserPen />
              </button>
            </td>
            <th
              class="border w-min whitespace-nowrap px-4"
              rowspan={$usersGroupsMap.get(user_id)?.size ?? 1}
            >
              {username}
            </th>
            <td class="border">
              {#if !$usersGroupsMap.has(user_id) }
                <span class="badge badge-warning">
                  Geen lid van een groep
                </span>
              {:else}
                {getGroupName([...($usersGroupsMap.get(user_id) ?? [])][0])}
              {/if}
            </td>
          </tr>
          {#each [...($usersGroupsMap.get(user_id) ?? [])] as group_id, i}
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