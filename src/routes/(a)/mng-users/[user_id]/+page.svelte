<script lang="ts">
  import { page } from "$app/state";
  import { usernamesMap } from "$lib/stores/usernames";
  import { groupsMap } from "$lib/stores/groups";
  import { usersGroupsMap } from "$lib/stores/users-groups";
  import { roleManageSchedulesSet } from "$lib/stores/role-manage-schedules";
  import { roleManageTasksSet } from "$lib/stores/role-manage-tasks";
  import { subOverviewSet } from "$lib/stores/sub-overview";
  import { subReminderSet } from "$lib/stores/sub-reminder";
  import { subAlarmSet } from "$lib/stores/sub-alarm";
  import { ChevronLeft, Pencil, UserPen } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { capitalize, id2 } from "$lib/func";

  $: user_id = page.params.user_id ?? '';
  $: if (!$usernamesMap.has(user_id)) {
    goto('/mng-users');
  }

  const getGroupName = (group_id: string) => {
    return capitalize($groupsMap.get(group_id) ?? '** ERROR **');
  };
</script>


<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <UserPen class="inline-block" />
      Aanpassen gebruiker {$usernamesMap.get(user_id) ?? '** ERROR **'}
    </h1>
    <button
      class="btn btn-info"
      on:click={() => goto('/mng-users')}
    >
      <ChevronLeft />
      Terug
    </button>
  </div>

  <div class="overflow-x-auto">
    <table class="table table-auto table-zebra table-fixed border border-neutral-content">
      <tbody>
        {#each [...$usernamesMap] as [user_id, username], i}
          <tr>
            <td class="w-min">
              <button class="btn btn-primary btn-sm">
                <Pencil />
              </button>
            </td>
            <th
              class="border w-min whitespace-nowrap"
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