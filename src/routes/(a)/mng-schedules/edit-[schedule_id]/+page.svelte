<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { groups } from "$lib/stores/groups.svelte";
  import { CalendarPlus, ChevronLeft, Pencil } from "lucide-svelte";
  import { id2 } from "$lib/func";
  import { updateSchedules } from "$lib/db/db-schedules";
  import { roleSchedules } from "$lib/stores/role-schedules.svelte";
  import { user } from "$lib/stores/user.svelte";
  import ScheduleData from "../ScheduleData.svelte";
  import { schedules } from "$lib/stores/schedules.svelte";

  let disabled = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');
  let schedule_id = $derived(page.params.schedule_id ?? '');
  let s = $derived(schedules.map.get(schedule_id));

  let minSubs = $derived<number | null>(s?.min_users ?? null);
  let maxSubs = $derived<number | null>(s?.max_users ?? null);

  let errorSubs = $derived.by(() => {
    if (!minSubs || !maxSubs) return null;
    if (minSubs > maxSubs) return 'Minimum kan niet groter zijn dan maximum';
    return null;
  });

  const submit = async (e: Event) => {
    e.preventDefault();
    disabled = true;

    try {
      await updateSchedules({id:schedule_id,
        min_users:minSubs, max_users: maxSubs,
      });

      minSubs = null;
      maxSubs = null;
      successMessage = 'Schema aangepast';
      setTimeout(() => {
        successMessage = '';
      }, 2000);
    } catch (err) {
      console.log('ERR', err);
      errorMessage = err as string;
    } finally {
      disabled = false;
    }
  };

  $effect(() => {
    if (!s){
      return;
    }
    if (!user.id || !roleSchedules.set.has(id2(s.group_id, user.id))){
      goto('/');
    }
  });
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <CalendarPlus class="inline-block" />
      Aanpassen schema {s ? groups.map.get(s.group_id) : ''}
    </h1>
    <button
      class="btn btn-info"
      onclick={() => goto('/mng-schedules')}
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
      {#if s}
        <ScheduleData {s} />
      {/if}
    </div>
  </div>

  <form onsubmit={submit}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <label class="form-control w-full">
        <span class="text-sm">
          Minimum aantal person (niet vereist)
        </span>
        <input type="number"
          bind:value={minSubs}
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
          bind:value={maxSubs}
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
