<script lang="ts">
  import { goto } from "$app/navigation";
  import Task from "$lib/components/Task.svelte";
  import { dateToJulian, getGroupName, id2 } from "$lib/func";
  import { groups } from "$lib/stores/groups.svelte";
  import { roleTasks } from "$lib/stores/role-tasks.svelte";
  import { groupsJDays, groupsJDaysTasks, jDays } from "$lib/stores/tasks.svelte";
  import { user } from "$lib/stores/user.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { CalendarDays, CalendarPlus, Pencil, Play, Plus, Trash2 } from "lucide-svelte";

  let sGroups = $derived([...groups.map.keys().filter((group_id) => {
    if (!user.id){
      return false;
    }
    if (!usersGroups.set.has(id2(group_id, user.id))){
      return false;
    }
    if (!roleTasks.set.has(id2(group_id, user.id))){
      return false;
    }
    return true;
  })]);

  let jdTres = $state(0);

  const setJdTres = () => {
    const d = new Date();
    jdTres = dateToJulian(d);
  };

  const updateJdTres = () => {
    setTimeout(() => {
      setJdTres();
    }, 3_600_000);
  };

  setJdTres();
  updateJdTres();

  let selGroupId = $derived(sGroups[0]);
  let days = $derived([...groupsJDays.map.get(selGroupId) ?? []].filter((j) => j >= jdTres));

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
    <h1 class="text-2xl">
      <CalendarDays class="inline-block" />
      Taken Beheer {@render groupSel()}
    </h1>

    <button
      class="btn btn-success"
      onclick={() => goto('/mng-tasks/add-' + selGroupId)}
    >
      <CalendarPlus />
      Voeg toe
    </button>
  </div>

  {#each days as jd, index}
    {@const dow = jd % 7}
      {#if !dow || !index}
        <div class="divider">
          <div class="badge badge-outline">
          Week {jDays.map.get(jd)?.week}
          </div>
        </div>
      {:else}
        <div class="divider my-0"></div>
      {/if}

    <div class="px-2 py-1"
      class:bg-base-200={[2,5,6].includes(dow)}
    >
      <h2 class="text-lg font-semibold">
        {#if jd === jdTres}
          <Play class="inline-block" />
        {/if}
        {jDays.map.get(jd)?.label}
      </h2>

      <div class="flex flex-wrap gap-2 font-semibold">

        {#each [...groupsJDaysTasks.map.get(id2(selGroupId, jd.toString())) ?? []] as task_id, i}

          <Task {task_id}>
            {#snippet btns(task_id:string)}
              <div class="mb-2">
                <button class="btn btn-primary btn-sm text-2xl"
                  onclick={() => goto('/mng-tasks/edit-' + task_id)}
                >
                  <Pencil />
                </button>
              </div>
              <div>
                <button class="btn btn-error btn-sm text-2xl"
                  onclick={() => goto('/mng-tasks/delete-' + task_id)}
                >
                  <Trash2  />
                </button>
              </div>
            {/snippet}
          </Task>

        {/each}
      </div>
    </div>

  {/each}
</div>

{/if}
