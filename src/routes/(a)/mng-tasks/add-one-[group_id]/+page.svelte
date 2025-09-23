<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Datepicker } from "flowbite-svelte";
  import { timeToMinutes } from "$lib/func";
  import { groups } from "$lib/stores/groups.svelte";
  import { CalendarPlus, ChevronLeft } from "lucide-svelte";
  import { insertTasks } from "$lib/db/db-tasks";

  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  const schedule_id = null;
  let comment = $state<string|null>(null);
  let min_users = $state<number|null>(null);
  let max_users = $state<number|null>(null);
  let group_id = $derived(page.params.group_id ?? '');

  let startTime = $state('');
  let endTime = $state('');

  let disabled = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  let startMinutes = $derived(startTime ? timeToMinutes(startTime) : null);
  let endMinutes = $derived(endTime ? timeToMinutes(endTime) : null);

  let errorTime = $derived.by(() => {
    if (!startMinutes || !endMinutes) return null;
    if (endMinutes <= startMinutes) return 'Einde moet na begin komen';
    if (endMinutes - startMinutes > 6 * 60) return 'Periode kan niet langer zijn dan 6 uur';
    return null;
  });

  let errorUsers = $derived.by(() => {
    if (!min_users || !max_users) return null;
    if (min_users > max_users) return 'Minimum kan niet groter zijn dan maximum';
    return null;
  });

  let tDate = $state<Date|undefined>(undefined);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!tDate){
      return;
    }
    if (!startTime){
      return;
    }
    if (!endTime){
      return;
    }
    disabled = true;

    const y = tDate.getFullYear();
    const m = (tDate.getMonth() + 1).toString().padStart(2, '0');
    const d = tDate.getDate().toString().padStart(2, '0');
    const dStr = y + '-' + m + '-' + d + ' ';
    const t_start = dStr + startTime;
    const t_end = dStr + endTime;

    try {
      await insertTasks({schedule_id, group_id,
        t_start, t_end, min_users, max_users,
        comment
      });

      comment = '';
      startTime = '';
      endTime = '';
      min_users = null;
      max_users = null;
      successMessage = 'Taak toegevoegd';
      setTimeout(() => {
        successMessage = '';
      }, 4000);

    } catch (err) {
      console.log(err);
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
      Taak buiten schema {groups.map.get(group_id)}
    </h1>
    <button
      class="btn btn-info"
      onclick={() => goto('/mng-tasks')}
    >
      <ChevronLeft />
      Terug
    </button>
  </div>

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

    <div class="mb-4">
      <label class="form-control w-full">
        <span class="text-lg">Periode</span>
        <Datepicker
          {disabled}
          required
          bind:value={tDate}
          color="pink"
          classes={{input: "block input input-bordered w-full invalid:border-error invalid:text-error"}}
          locale="nl-NL"
          dateFormat={{ weekday: "short", year: "numeric", month: "short", day: "2-digit"}}
          firstDayOfWeek={1}
        />
      </label>
    </div>

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
            'select-error': errorTime || errorMessage
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
            'select-error': errorTime || errorMessage
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
          bind:value={min_users}
          class={{
            'input': true,
            'input-bordered': true,
            'w-full': true,
            'invalid:border-error': true,
            'invalid:text-error': true,
            'input-success': successMessage,
            'input-error': errorUsers || errorMessage,
          }}
          {disabled}
         />
      </label>

      <label class="form-control w-full">
        <span class="text-sm">
          Maximum aantal personen (niet vereist)
        </span>
        <input type="number"
          bind:value={max_users}
          class={{
            'input': true,
            'input-bordered': true,
            'w-full': true,
            'invalid:border-error': true,
            'invalid:text-error': true,
            'input-success': successMessage,
            'input-error': errorUsers || errorMessage,
          }}
          {disabled}
         />
      </label>
      {#if errorUsers}
        <span class="text-error text-bold">
          {errorUsers}
        </span>
      {/if}

    </div>

    <div class="mb-4">
      <label class="form-control w-full">
        <span class="text-sm">
          Commentaar (niet vereist)
        </span>
        <input type="text"
          bind:value={comment}
          class={{
            'input': true,
            'input-bordered': true,
            'w-full': true,
            'invalid:border-error': true,
            'invalid:text-error': true,
            'input-success': successMessage,
            'input-error': errorMessage,
          }}
          {disabled}
         />
      </label>
    </div>


    <button type="submit" class="btn btn-success"
      {disabled}
    >
      Toevoegen
    </button>
  </form>

  <div class="mb-64"></div>

</div>
