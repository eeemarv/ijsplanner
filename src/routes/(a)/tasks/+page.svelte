<script lang="ts">
  import Task from "$lib/components/Task.svelte";
  import { dateToJulian, getGroupName, id2 } from "$lib/func";
  import { navbar } from "$lib/state.svelte";
  import { groups } from "$lib/stores/groups.svelte";
  import { groupsJDays, groupsJDaysTasks, jDays, tasks } from "$lib/stores/tasks.svelte";
  import { user, userStatus } from "$lib/stores/user.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { Funnel, Pencil, Play, Plus, Trash2 } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";
  import { weekDayNames } from "$lib/func";
  import { tasksUsers } from "$lib/stores/tasks-users.svelte";
  import { deleteTasksUsers, insertTasksUsers } from "$lib/db/db-tasks-users";
    import { SvelteSet } from "svelte/reactivity";

  type Filter = null | "open_tasks" | "my_tasks" | 0 | 1 | 2 | 3 | 4 | 5 | 6;

  let editEn = $state(false);
  let filter = $state<Filter>(null);
  let disabled = $state(false);

  onMount(() => {
    navbar.menu = menu;
  });

  onDestroy(() => {
    navbar.menu = null;
  });

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

  let sGroups = $derived([...groups.map.keys().filter((group_id) => {
    if (!user.id){
      return false;
    }
    return true;
  })]);

  let selGroupId = $derived(sGroups.find((group_id) => {
    if (!user.id){
      return false;
    }
    return usersGroups.set.has(id2(group_id, user.id));
  }) ?? '');

  let days = $derived.by(() => {
    const ds = [...groupsJDays.map.get(selGroupId) ?? []].filter((j) => j >= jdTres);
    if (filter === null){
      return ds;
    }
    if (filter === 'my_tasks'){
      if (!user.id){
        return [];
      }
      return ds.filter((jd) => {
        if (!user.id){
          return false;
        }
        const s = groupsJDaysTasks.map.get(id2(selGroupId, jd.toString()));
        if (!s){
          return false;
        }
        for (const task_id of s){
          const task = tasks.map.get(task_id);
          if (!task){
            continue;
          }
          const tu = tasksUsers.map.get(task_id);
          if (!tu){
            continue;
          }
          if (tu.has(user.id)){
            return true;
          }
        }
        return false;
      });
    }
    if (filter === 'open_tasks'){
      return ds.filter((jd) => {
        const s = groupsJDaysTasks.map.get(id2(selGroupId, jd.toString()));
        if (!s){
          return false;
        }
        for (const task_id of s){
          const task = tasks.map.get(task_id);
          if (!task){
            continue;
          }
          const tu = tasksUsers.map.get(task_id);
          if (!tu){
            return true;
          }
          if (!task.min_users){
            return true;
          }
          if (tu.size < task.min_users){
            return true;
          }
        }
        return false;
      });
    }

    if ([...Array(7).keys()].includes(filter)){
      return ds.filter((jd) => (jd % 7) === filter);
    }

    return [];
  });

  let weekIndSet = $derived.by(() => {
    let storeWeek: null|number = null;
    const weekIndAry = [];
    for (const jd of days){
      const j = jDays.map.get(jd);
      if (!j){
        continue;
      }
      if (j.week === storeWeek){
        continue;
      }
      storeWeek = j.week;
      weekIndAry.push(jd);
    }
    return new SvelteSet(weekIndAry);
  });

  const engage = async (task_id:string) => {
    if (!user.id){
      return;
    }
    const user_id = user.id;
    disabled = true;
    try {
      await insertTasksUsers({
        task_id, user_id
      });
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
  };

  const disengage = async (task_id:string) => {
    if (!user.id){
      return;
    }
    const user_id = user.id;
    disabled = true;
    try {
      await deleteTasksUsers({
        task_id, user_id
      });
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
  };
</script>

{#snippet menu()}
{#if userStatus() && user.id}
  <div class="dropdown dropdown-start">
    <label tabindex="-1" class="btn m-1 text-xl" for="group_dropdown" title="Groep">
      {selGroupId ? getGroupName(selGroupId) : '***'}
    </label>
    <ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box text-xl" id="group_dropdown">
      {#each sGroups as group_id}
      <li>
        <button onclick={() => {selGroupId = group_id}}
          class={{
            'menu': true,
            'w-full': true,
            'menu-active': selGroupId === group_id
          }}
        >
          {getGroupName(group_id)}
        </button>
      </li>
      {/each}
    </ul>
  </div>

  <div class="dropdown dropdown-start">
    <label
      tabindex="-1"
      class={{
        'btn': true,
        'm-1': true,
        'text-xl': true,
        'btn-primary': filter !== null
      }}
      for="filter_dropdown" title="Filter"
    >
      <Funnel />
    </label>
    <ul tabindex="-1" class="dropdown-content menu w-40 p-2 shadow bg-base-100 rounded-box" id="filter_dropdown">
      <li>
        <button onclick={() => filter = null}
          class={{
            'menu': true,
            'w-full': true,
            'menu-active': filter === null
          }}
        >
          <i>Geen filter</i>
        </button>
      </li>
      <li>
        <button onclick={() => filter = 'open_tasks'}
          class={{
            'menu': true,
            'w-full': true,
            'menu-active': filter === 'open_tasks'
          }}
        >
          Open taken
        </button>
      </li>
      <li>
        <button onclick={() => filter = 'my_tasks'}
          class={{
            'menu': true,
            'w-full': true,
            'menu-active': filter === 'my_tasks'
          }}
        >
          Mijn taken
        </button>
      </li>
      {#each weekDayNames as wk, i}
      <li>
        <button onclick={() => {filter = i as Filter}}
           class={{
            'menu': true,
            'w-full': true,
            'menu-active': filter === i
          }}
        >
          {wk}
        </button>
      </li>
      {/each}
    </ul>
  </div>

  {#if usersGroups.set.has(id2(selGroupId, user.id))}
    <button
      class={{
        'btn': true,
        'btn-primary': editEn
      }}
      onclick={() => editEn = !editEn}
      title="(de)blokkeer edit"
    >
      <Pencil />
    </button>
  {/if}
{/if}
{/snippet}


{#if userStatus()}

<div class="p-4">

  {#each days as jd, index}
    {@const dow = jd % 7}
      {#if weekIndSet.has(jd)}
        <div class="divider">
          <div class="badge badge-outline">
          Week {jDays.map.get(jd)?.week}
          </div>
        </div>
      {:else}
        <div class="divider my-0"></div>
      {/if}

    <div class={{
        'px-2': true,
        'py-1': true,
        'bg-amber-500/10': [1,3].includes(dow),
        'bg-violet-500/10': [5,6].includes(dow)
      }}
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
              {@const tus = tasksUsers.map.get(task_id)}
              {#if editEn && user.id}
              {#if tus && tus.has(user.id)}
              <div>
                <button class="btn btn-error btn-sm text-2xl"
                  onclick={() => disengage(task_id)}
                  {disabled}
                >
                  <Trash2  />
                </button>
              </div>
              {:else}
              <div class="mb-2">
                <button class="btn btn-success btn-sm text-2xl"
                  onclick={() => engage(task_id)}
                  {disabled}
                >
                  <Plus />
                </button>
              </div>
              {/if}
              {/if}
            {/snippet}
          </Task>

        {/each}
      </div>
    </div>

  {/each}

</div>
{/if}
