<script lang="ts">
  import { user } from "$lib/stores/user";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { groups } from "$lib/stores/groups.svelte";
  import { capitalize } from "$lib/func";
  import { id2 } from "$lib/func";
  import { subOverview } from "$lib/stores/sub-overview.svelte";
  import { subReminder } from "$lib/stores/sub-reminder.svelte";
  import { subAlarm } from "$lib/stores/sub-alarm.svelte";
  import { insertSubOverview } from "$lib/db/db-sub-overview";
  import { deleteSubOverview } from "$lib/db/db-sub-overview";
  import { insertSubReminder } from "$lib/db/db-sub-reminder";
  import { deleteSubReminder } from "$lib/db/db-sub-reminder";
  import { insertSubAlarm } from "$lib/db/db-sub-alarm";
  import { deleteSubAlarm } from "$lib/db/db-sub-alarm";
  import { Bell } from "lucide-svelte";

  const getGroupName = (group_id: string) => {
    return groups.map.get(group_id) ?? '** ERROR **';
  };

  let overviewDis = $state(false);
  let reminderDis = $state(false);
  let alarmDis = $state(false);

  /*
  $effect(() => {
    console.log('**Overview**', subOverview);
    disabled = false;
  });

  $effect(() => {
    console.log('**Reminder**', subReminder);
    disabled = false;
  });

  $effect(() => {
    console.log('**Alarm**', subAlarm);
    disabled = false;
  });
  */

  const toggleSubOverview = async (group_id: string) => {
    if (!$user || !$user?.id){
      return;
    }
    overviewDis = true;
    if (subOverview.set.has(id2(group_id, $user?.id))){
      await deleteSubOverview(group_id, $user?.id);
      overviewDis = false;
      return;
    }
    await insertSubOverview(group_id, $user?.id);
    overviewDis = false;
  };

  const toggleSubReminder = async (group_id: string) => {
    if (!$user || !$user?.id){
      return;
    }
    reminderDis = true;
    if (subReminder.set.has(id2(group_id, $user?.id))){
      await deleteSubReminder(group_id, $user?.id);
      reminderDis = false;
      return;
    }
    await insertSubReminder(group_id, $user?.id);
    reminderDis = false;
  };

  const toggleSubAlarm = async (group_id: string) => {
    if (!$user || !$user?.id){
      return;
    }
    alarmDis = true;
    if (subAlarm.set.has(id2(group_id, $user?.id))){
      await deleteSubAlarm(group_id, $user?.id);
      alarmDis = false
      return;
    }
    await insertSubAlarm(group_id, $user?.id);
    alarmDis = false;
  };
</script>

<div class="p-4">
  <h1 class="text-2xl mb-2">
    <Bell class="inline-block" />
    Email Notificaties
  </h1>

  {#if !(usersGroups.map.get($user?.id)?.size)}
    <div class="card card-border bg-warning text-warning-content">
      <div class="card-body">
        <p class="text-lg">
          Je kan geen email notificaties instellen want
          je bent geen lid van een groep.
        </p>
      </div>
    </div>
  {/if}

  {#each [...(usersGroups.map.get($user?.id) ?? [])] as group_id, i}

    <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
      <legend class="fieldset-legend text-lg">
        Groep {capitalize(getGroupName(group_id))}
      </legend>

      <label
        class="label text-lg text-wrap inline-flex"
        class:text-success={false}
      >
        <input type="checkbox"
          disabled={overviewDis}
          checked={subOverview.set.has(id2(group_id, $user?.id))}
          class="checkbox checkbox-xl"
          class:checkbox-success={false}
          onchange={() => toggleSubOverview(group_id)}
        />
        <span>
          <b>Overzicht</b> van
          {getGroupName(group_id)}-taken
          elke zondagmiddag
          voor de komende week.
        </span>
      </label>

      <label class="label text-lg text-wrap inline-flex">
        <input type="checkbox"
          disabled={reminderDis}
          checked={subReminder.set.has(id2(group_id, $user?.id))}
          class="checkbox checkbox-xl"
          onchange={() => toggleSubReminder(group_id)}
        />
        <span>
          <b>Herinnering</b> als je de volgende
          dag een {getGroupName(group_id)}-taak hebt.
        </span>
      </label>

      <label class="label text-lg text-wrap inline-flex">
        <input type="checkbox"
          disabled={alarmDis}
          checked={subAlarm.set.has(id2(group_id, $user?.id))}
          class="checkbox checkbox-xl"
          onchange={() => toggleSubAlarm(group_id)}
        />
        <span>
          <b>Alarm</b>:
          melding als de volgende dag nog
          een {getGroupName(group_id)}-taak
          open staat.
        </span>
      </label>
    </fieldset>

  {/each}
</div>
