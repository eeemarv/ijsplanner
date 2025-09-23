<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Datepicker } from "flowbite-svelte";
  import { getTimeStr, hmToTime, weekDayNames } from "$lib/func";
  import { groups } from "$lib/stores/groups.svelte";
  import { schedules } from "$lib/stores/schedules.svelte";
  import { CalendarPlus, ChevronLeft } from "lucide-svelte";
  import { insertTasks } from "$lib/db/db-tasks";

  let disabled = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');
  let group_id = $derived(page.params.group_id ?? '');
  let schedule_id = $state('');

  let fromDate = $state<Date|undefined>(undefined);
  let toDate = $state<Date|undefined>(undefined);

  const genDayAry = (fromDate: Date, toDate: Date): Date[] =>{
    const dayAry: Date[] = [];
    let current = new Date(fromDate);
    while (current <= toDate) {
      dayAry.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dayAry;
  }

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!schedule_id){
      return;
    }
    if (!fromDate){
      return;
    }
    if (!toDate){
      return;
    }
    if (toDate.getTime() <= fromDate.getTime()){
      return;
    }
    const dayAry = genDayAry(fromDate, toDate);
    const s = schedules.map.get(schedule_id);
    if (!s){
      return;
    }
    disabled = true;
    const dayOfWeek = s.day_of_week;
    const time_start = hmToTime(s.hours_start, s.minutes_start);
    const time_end = hmToTime(s.hours_end, s.minutes_end);
    const min_users = s.min_users;
    const max_users = s.max_users;

    try {
      for (const d of dayAry){
        const dow = (d.getDay() + 6) % 7;
        if (dayOfWeek !== dow){
          continue;
        }

        const ye = d.getFullYear();
        const mo = (d.getMonth() + 1).toString().padStart(2, '0');
        const da = d.getDate().toString().padStart(2, '0');
        const dStr = ye + '-' + mo + '-' + da + ' ';
        const t_start = dStr + time_start;
        const t_end = dStr + time_end;

        await insertTasks({schedule_id, group_id,
          t_start, t_end, min_users, max_users,
          comment:null
        });
      }

      schedule_id = '';
      fromDate = undefined;
      toDate = undefined;

      successMessage = 'Taak/Taken toegevoegd';
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
      Toevoegen taken {groups.map.get(group_id)}
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
        <span class="text-lg">Schema</span>
        <select
          bind:value={schedule_id}
          class={{
            'block': true,
            'select': true,
            'select-bordered': true,
            'w-full': true,
            'invalid:border-error': true,
            'invalid:text-error': true,
            'select-success': successMessage,
          }}
          {disabled}
          required
        >
          {#each schedules.map as [schId, s], i}
            {#if s.group_id === group_id}
            <option value={schId}>
              {weekDayNames[s.day_of_week]},
              {getTimeStr(s.hours_start, s.minutes_start)} -
              {getTimeStr(s.hours_end, s.minutes_end)}
              ( min: {s.min_users ?? '/'},
              max: {s.max_users ?? '/'} )
            </option>
            {/if}
          {/each}
        </select>
      </label>
    </div>

    <div class="mb-4">
      <label class="form-control w-full">
        <span class="text-lg">Periode</span>
        <Datepicker
          {disabled}
          required
          range
          bind:rangeFrom={fromDate}
          bind:rangeTo={toDate}
          color="pink"
          classes={{input: "block input input-bordered w-full invalid:border-error invalid:text-error"}}
          locale="nl-NL"
          dateFormat={{ weekday: "short", year: "numeric", month: "short", day: "2-digit"}}
          firstDayOfWeek={1}
        />
      </label>
    </div>

    <button type="submit" class="btn btn-success"
      {disabled}
    >
      Toevoegen
    </button>
  </form>

  <div class="mb-2"></div>
  <button class="btn btn-primary"
    onclick={() => goto('/mng-tasks/add-one-' + group_id)}
  >
    Of voeg taak toe buiten schema
  </button>

  <div class="mb-64"></div>

</div>
