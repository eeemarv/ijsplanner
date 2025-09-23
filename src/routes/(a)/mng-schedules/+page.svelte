<script lang="ts">
  import { goto } from "$app/navigation";
  import { getGroupName, id2 } from "$lib/func";
  import { groups } from "$lib/stores/groups.svelte";
  import { roleSchedules } from "$lib/stores/role-schedules.svelte";
  import { schedules } from "$lib/stores/schedules.svelte";
  import { user } from "$lib/stores/user.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { CalendarCog, CalendarPlus, ChevronLeft, TableProperties, Trash, Trash2, Users, Users2, UsersRound, X } from "lucide-svelte";
  import ScheduleData from "./ScheduleData.svelte";

  let sGroups = $derived([...groups.map.keys().filter((group_id) => {
    if (!user.id){
      return false;
    }
    if (!usersGroups.set.has(id2(group_id, user.id))){
      return false;
    }
    if (!roleSchedules.set.has(id2(group_id, user.id))){
      return false;
    }
    return true;
  })]);

  let selGroupId = $derived(sGroups[0]);
</script>

{#snippet groupSel()}
<div class="dropdown dropdown-end">
  <label tabindex="-1" class="btn m-1 text-xl" for="theme_dropdown" title="Vormgeving">
    {selGroupId ? getGroupName(selGroupId) : '***'}
  </label>
  <ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box  text-lg" id="theme_dropdown">
    {#each sGroups as group_id}
    <li>
      <button onclick={() => {selGroupId = group_id}}>
        {getGroupName(group_id)}
      </button>
    </li>
    {/each}
  </ul>
</div>
{/snippet}

{#if user.id}

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl inline-block">
      <TableProperties class="inline-block" />
      Schema Beheer: {@render groupSel()}
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
        onclick={() => goto('/mng-schedules/add-'+ selGroupId)}
      >
        <CalendarPlus />
        Voeg toe
      </button>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="table table-auto table-zebra border border-neutral-content">
      <tbody>
        {#each schedules.map as [schedule_id, s], u}
          {#if s.group_id == selGroupId}
            <tr>
              <td class="border w-10 px-4">
                <button
                  class="btn btn-primary btn-sm"
                  onclick={() => goto('/mng-schedules/edit-' + schedule_id)}
                >
                  <CalendarCog />
                </button>
              </td>
              <td class="border w-10 px-4">
                <button
                  class="btn btn-error btn-sm"
                  onclick={() => goto('mng-schedules/delete-' + schedule_id)}
                >
                  <Trash2 />
                </button>
              </td>
              <td class="border">
                <ScheduleData {schedule_id} />
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
</div>

{/if}
