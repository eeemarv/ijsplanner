<script lang="ts">
  import { usernames } from "$lib/stores/usernames.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { ChevronLeft, UserCheck, UserPen, Users } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { getGroupName, id2 } from "$lib/func";
  import { groups } from "$lib/stores/groups.svelte";

</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <Users class="inline-block" />
      Gebruikersbeheer
    </h1>
    <div>
      <button
        class="btn btn-primary"
        onclick={() => goto('/tasks')}
      >
        <ChevronLeft />
        Terug
      </button>

      <button
        class="btn btn-success"
        onclick={() => goto('/mng-users/add')}
      >
        <UserCheck />
        Voeg toe
      </button>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="table table-auto table-zebra border border-neutral-content">
      <tbody>
        {#each usernames.map as [user_id, username], i}
          {@const uGrps = [...groups.map.keys()].filter((group_id) => {
            return usersGroups.set.has(id2(group_id, user_id));
          })}
          {@const rowspan = uGrps.length ? uGrps.length : 1}
          <tr>
            <td class="border w-10 px-4"
              {rowspan}
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
              {rowspan}
            >
              {username}
            </th>
            <td class="border">
              {#if !uGrps.length }
                <span class="badge badge-warning">
                  Geen lid van een groep
                </span>
              {:else}
                {getGroupName(uGrps[0])}
              {/if}
            </td>
          </tr>
          {#each uGrps as group_id, i}
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