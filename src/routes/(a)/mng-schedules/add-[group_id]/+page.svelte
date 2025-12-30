<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { groups } from "$lib/stores/groups.svelte";
  import { CalendarPlus, ChevronLeft } from "lucide-svelte";
  import { timeToHM, timeToMinutes, weekDayNames } from "$lib/func";
  import { insertSchedules } from "$lib/db/db-schedules";

  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 15, 30, 45]) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  let disabled = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  let startTime = $state('');
  let endTime = $state('');
  let dayOfWeek = $state(0);
  let minSubs = $state<number | null>(null);
  let maxSubs = $state<number | null>(null);

  let group_id = $derived(page.params.group_id ?? '');

  let startMinutes = $derived(startTime ? timeToMinutes(startTime) : null);
  let endMinutes = $derived(endTime ? timeToMinutes(endTime) : null);

  let errorTime = $derived.by(() => {
    if (!startMinutes || !endMinutes) return null;
    if (endMinutes <= startMinutes) return 'Einde moet na begin komen';
    if (endMinutes - startMinutes > 6 * 60) return 'Periode kan niet langer zijn dan 6 uur';
    return null;
  });

  let errorSubs = $derived.by(() => {
    if (!minSubs || !maxSubs) return null;
    if (minSubs > maxSubs) return 'Minimum kan niet groter zijn dan maximum';
    return null;
  });

  const submit = async (e: Event) => {
    e.preventDefault();
    disabled = true;
    const {hours: hours_start, minutes: minutes_start}
      = timeToHM(startTime);
    const {hours: hours_end, minutes: minutes_end}
      = timeToHM(endTime);
    try {
      await insertSchedules({group_id,
        hours_start, minutes_start,
        hours_end, minutes_end,
        min_users:minSubs, max_users: maxSubs,
        day_of_week: dayOfWeek
      });

      dayOfWeek = 0;
      startTime = '';
      endTime = '';
      minSubs = null;
      maxSubs = null;
      successMessage = 'Schema toegevoegd';
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
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <CalendarPlus class="inline-block" />
      Toevoegen schema {groups.map.get(group_id)}
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
    <div role="alert" class="alert alert-error">
      <span>{errorMessage}</span>
    </div>
  {/if}

  {#if successMessage}
    <div role="alert" class="alert alert-success">
      <span>{successMessage}</span>
    </div>
  {/if}

  <form onsubmit={submit}>

    <label class="form-control w-full mb-2">
      <span class="text-sm">Dag van de week</span>
      <select
        bind:value={dayOfWeek}
        class={{
          'block': true,
          'select': true,
          'select-bordered': true,
          'w-full': true,
          'invalid:border-error': true,
          'invalid:text-error': true,
          'select-success': successMessage
        }}
        {disabled}
        required
      >
        {#each weekDayNames as d, i}
          <option value={i}>{d}</option>
        {/each}
      </select>
    </label>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <label class="form-control w-full">
        <span class="text-sm">
          Begin uur:minuten
        </span>
        <select
          bind:value={startTime}
          class={{
            'block': true,
            'select': true,
            'select-bordered': true,
            'w-full': true,
            'invalid:border-error': true,
            'invalid:text-error': true,
            'select-success': successMessage,
            'select-error': errorTime,
          }}
          {disabled}
          required
        >
          <option disabled selected>-- Selecteer --</option>
          {#each times as t}
            <option value={t}>{t}</option>
          {/each}
        </select>
      </label>

      <label class="form-control w-full">
        <span class="text-sm">Eind uur:minuten</span>
        <select
          bind:value={endTime}
          class={{
            'block': true,
            'select': true,
            'select-bordered': true,
            'w-full': true,
            'invalid:border-error': true,
            'invalid:text-error': true,
            'select-success': successMessage,
            'select-error': errorTime,
          }}
          {disabled}
          required
        >
          <option disabled selected>-- Selecteer --</option>
          {#each times as t}
            <option value={t}>{t}</option>
          {/each}
        </select>
      </label>
      {#if errorTime}
        <span class="text-error text-bold">
          {errorTime}
        </span>
      {/if}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <label class="form-control w-full">
        <span class="text-sm">
          Minimum aantal personen (niet vereist)
        </span>
        <input type="number"
          bind:value={minSubs}
          class={{
            'input': true,
            'input-bordered': true,
            'w-full': true,
            'invalid:border-error': true,
            'invalid:text-error': true,
            'input-success': successMessage,
            'input-error': errorSubs,
          }}
          {disabled}
         />
      </label>

      <label class="form-control w-full">
        <span class="text-sm">
          Maximum aantal personen (niet vereist)
        </span>
        <input type="number"
          bind:value={maxSubs}
          class={{
            'input': true,
            'input-bordered': true,
            'w-full': true,
            'invalid:border-error': true,
            'invalid:text-error': true,
            'input-success': successMessage,
            'input-error': errorSubs,
          }}
          {disabled}
         />
      </label>
      {#if errorSubs}
        <span class="text-error text-bold">
          {errorSubs}
        </span>
      {/if}

    </div>

    <button type="submit" class="btn btn-success"
      {disabled}
    >
      Toevoegen
    </button>
  </form>
  </div>
</div>
