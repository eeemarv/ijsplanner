<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { groups } from "$lib/stores/groups.svelte";
  import { CalendarPlus, ChevronLeft, X } from "lucide-svelte";
  import { deleteSchedules } from "$lib/db/db-schedules";
  import ScheduleData from "../ScheduleData.svelte";
  import { schedules } from "$lib/stores/schedules.svelte";

  let disabled = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');
  let schedule_id = $derived(page.params.schedule_id ?? '');
  let s = $derived(schedules.map.get(schedule_id));
  let confirmType = $state('');
  let errorConfirmType = $state();

  const submit = async (e: Event) => {
    e.preventDefault();
    if (confirmType !== 'verwijder'){
      errorConfirmType = 'Onjuist';
      setTimeout(() => {
        errorConfirmType = '';
      }, 4000);
      return;
    }
    disabled = true;
    try {
      await deleteSchedules(schedule_id);
      successMessage = 'Schema verwijderd';
    } catch (err) {
      console.log('ERR', err);
      errorMessage = err as string;
    } finally {
      disabled = false;
    }
  };
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <CalendarPlus class="inline-block" />
      Verwijder schema {s ? groups.map.get(s.group_id) : ''}
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
      <ScheduleData {schedule_id} />
    </div>
  </div>

  {#if !successMessage}
  <form onsubmit={submit}>
    <label class="form-control w-full block mb-4">
      <span class="text-sm">
        Typ "verwijder"
      </span>
      <input type="text"
        bind:value={confirmType}
        class={{
          'input': true,
          'input-bordered': true,
          'w-full': true,
          'invalid:border-error': true,
          'invalid:text-error': true,
          'input-success': successMessage,
          'input-error': errorConfirmType,
        }}
        {disabled}
        />
      {#if errorConfirmType}
        <span class="text-error text-bold">
          {errorConfirmType}
        </span>
      {/if}
    </label>

    <button type="submit" class="btn btn-error"
      {disabled}
    >
      <X />
      Verwijderen
    </button>
  </form>
  {/if}
  </div>
</div>
