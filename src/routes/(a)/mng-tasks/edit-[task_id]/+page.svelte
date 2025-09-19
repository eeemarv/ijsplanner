<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { groups } from "$lib/stores/groups.svelte";
  import { CalendarPlus, ChevronLeft, Pencil } from "lucide-svelte";
  import { getGroupName, id2 } from "$lib/func";
  import { updateSchedules } from "$lib/db/db-schedules";
  import { roleSchedules } from "$lib/stores/role-schedules.svelte";
  import { user } from "$lib/stores/user.svelte";
  import ScheduleData from "../../mng-schedules/ScheduleData.svelte";
  import { tasks } from "$lib/stores/tasks.svelte";
    import { updateTasks } from "$lib/db/db-tasks";
    import { roleTasks } from "$lib/stores/role-tasks.svelte";
    import TaskData from "../TaskData.svelte";

  let disabled = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');
  let task_id = $derived(page.params.task_id ?? '');
  let t = $derived(tasks.map.get(task_id));

  let min_users = $derived<number | null>(t?.min_users ?? null);
  let max_users = $derived<number | null>(t?.max_users ?? null);
  let comment = $derived<string | null>(t?.comment ?? null);

  let errorSubs = $derived.by(() => {
    if (!min_users || !max_users) return null;
    if (min_users > max_users) return 'Minimum kan niet groter zijn dan maximum';
    return null;
  });

  const submit = async (e: Event) => {
    e.preventDefault();
    disabled = true;

    try {
      await updateTasks({id:task_id,
        min_users, max_users, comment
      });

      successMessage = 'Taak aangepast';
      setTimeout(() => {
        successMessage = '';
      }, 5000);
    } catch (err) {
      console.log('ERR', err);
      errorMessage = err as string;
    } finally {
      disabled = false;
    }
  };

  $effect(() => {
    if (!t){
      return;
    }
    if (!user.id || !roleTasks.set.has(id2(t.group_id, user.id))){
      goto('/');
    }
  });
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <CalendarPlus class="inline-block" />
      Aanpassen Taak {getGroupName(t?.group_id ?? '')}
    </h1>
    <button
      class="btn btn-info"
      onclick={() => goto('/mng-tasks')}
    >
      <ChevronLeft />
      Terug
    </button>
  </div>

  <div class="px-4">

  {#if errorMessage}
    <div role="alert" class="alert alert-error mb-2">
      <span>{errorMessage}</span>
    </div>
  {/if}

  {#if successMessage}
    <div role="alert" class="alert alert-success mb-2">
      <span>{successMessage}</span>
    </div>
  {/if}

  <div class="card border mb-2">
    <div class="card-body">
      <TaskData {task_id} />
    </div>
  </div>

  <form onsubmit={submit}>
    <div class="grid gap-4 mb-2">
      <label class="form-control w-full">
        <span class="text-sm">
          Commentaar (kort, niet vereist)
        </span>
        <input type="text"
          bind:value={comment}
          class="input input-bordered w-full invalid:border-error invalid:text-error"
          class:input-success={successMessage}
          class:input-error={errorSubs}
          {disabled}
         />
      </label>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <label class="form-control w-full">
        <span class="text-sm">
          Minimum aantal person (niet vereist)
        </span>
        <input type="number"
          bind:value={min_users}
          class="input input-bordered w-full invalid:border-error invalid:text-error"
          class:input-success={successMessage}
          class:input-error={errorSubs}
          {disabled}
         />
      </label>

      <label class="form-control w-full">
        <span class="text-sm">
          Maximum aantal personen (niet vereist)
        </span>
        <input type="number"
          bind:value={max_users}
          class="input input-bordered w-full invalid:border-error invalid:text-error"
          class:input-success={successMessage}
          class:input-error={errorSubs}
          {disabled}
         />
      </label>
      {#if errorSubs}
        <span class="text-error text-bold">
          {errorSubs}
        </span>
      {/if}
    </div>

    <button type="submit" class="btn btn-primary"
      {disabled}
    >
      <Pencil />
      Aanpassen
    </button>
  </form>
  </div>
</div>
