<script lang="ts">
  import { goto } from "$app/navigation";
  import { capitalize, id2 } from "$lib/func";
  import { groups } from "$lib/stores/groups.svelte";
  import { roleSchedules } from "$lib/stores/role-schedules.svelte";
  import { schedules } from "$lib/stores/schedules.svelte";
  import { user } from "$lib/stores/user.svelte";
  import { CalendarCog, CalendarDays, CalendarPlus, TableProperties } from "lucide-svelte";



</script>

{#if user.id}

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <CalendarDays class="inline-block" />
      Taken Beheer
    </h1>

    <button
      class="btn btn-success"
      onclick={() => goto('/mng-schedules/add')}
    >
      <CalendarPlus />
      Voeg toe
    </button>
  </div>

  {#each groups.map as [group_id, group_name], i}
    {#if roleSchedules.set.has(id2(group_id, user.id))}
      <h2 class="text-xl">{capitalize(group_name)}</h2>
      <div class="overflow-x-auto">
        <table class="table table-auto table-zebra border border-neutral-content">
          <tbody>
            {#each schedules.map as [schedule_id, s], u}
              {#if s.group_id == group_id}
                <tr>
                  <td class="border w-10 px-4">
                    <button
                      class="btn btn-primary btn-sm"
                      onclick={() => goto('/mng-schedules/' + schedule_id)}
                    >
                      <CalendarCog />
                    </button>
                  </td>
                  <td class="border">

                    Info

                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/each}
</div>

{/if}
