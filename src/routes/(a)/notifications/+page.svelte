<script lang="ts">
  import { user } from "$lib/stores/user";
  import { usersGroupsMap } from "$lib/stores/users-groups";
  import { groupsMap } from "$lib/stores/groups";
  import { capitalize } from "$lib/func";
  import { id2 } from "$lib/func";
  import { subOverviewSet } from "$lib/stores/sub-overview";
  import { subReminderSet } from "$lib/stores/sub-reminder";
  import { subAlarmSet } from "$lib/stores/sub-alarm";
  import { insertSubOverview } from "$lib/db/db-sub-overview";
  import { deleteSubOverview } from "$lib/db/db-sub-overview";
  import { insertSubReminder } from "$lib/db/db-sub-reminder";
  import { deleteSubReminder } from "$lib/db/db-sub-reminder";
  import { insertSubAlarm } from "$lib/db/db-sub-alarm";
  import { deleteSubAlarm } from "$lib/db/db-sub-alarm";
  import { Bell } from "lucide-svelte";

  //$: groups = [...$groupsMap.keys()].filter((gr) => $usersGroupsSet.has(id2(gr, $user?.id ?? '')));

  const getGroupName = (group_id: string) => {
    return $groupsMap.get(group_id) ?? '** ERROR **';
  };

  let subOverviewDis = false;
  let subReminderDis = false;
  let subAlarmDis = false;

  $: {
    console.log('**Overview**', $subOverviewSet);
    subOverviewDis = false;
  }

  $: {
    console.log('**Reminder**', $subReminderSet);
    subReminderDis = false;
  }

  $: {
    console.log('**Alarm**', $subAlarmSet);
    subAlarmDis = false;
  }

  const toggleSubOverview = (group_id: string) => {
    if (!$user || !$user.id){
      return;
    }
    subOverviewDis = true;
    if ($subOverviewSet.has(id2(group_id, $user.id))){
      deleteSubOverview(group_id, $user.id);
      return;
    }
    insertSubOverview(group_id, $user.id);
  };

  const toggleSubReminder = (group_id: string) => {
    if (!$user || !$user.id){
      return;
    }
    subReminderDis = true;
    if ($subReminderSet.has(id2(group_id, $user.id))){
      deleteSubReminder(group_id, $user.id);
      return;
    }
    insertSubReminder(group_id, $user.id);
  };

  const toggleSubAlarm = (group_id: string) => {
    if (!$user || !$user.id){
      return;
    }
    subAlarmDis = true;
    if ($subAlarmSet.has(id2(group_id, $user.id))){
      deleteSubAlarm(group_id, $user.id);
      return;
    }
    insertSubAlarm(group_id, $user.id);
  };
</script>

<div class="p-4">
  <h1 class="text-2xl mb-2">
    <Bell class="inline-block" />
    Email Notificaties
  </h1>

  {#if !($usersGroupsMap.get($user?.id)?.size)}
    <div class="card card-border bg-warning text-warning-content">
      <div class="card-body">
        <p class="text-lg">
          Je kan geen email notificaties instellen want
          je bent geen lid van een groep.
        </p>
      </div>
    </div>
  {/if}

  {#each [...($usersGroupsMap.get($user?.id) ?? [])] as group_id, i}

    <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
      <legend class="fieldset-legend text-lg">
        Groep {capitalize(getGroupName(group_id))}
      </legend>
      <label class="label text-lg text-wrap inline-flex">
        <input
          type="checkbox"
          disabled={subOverviewDis}
          checked={$subOverviewSet.has(id2(group_id, $user.id))}
          class="checkbox checkbox-xl"
          on:change={() => toggleSubOverview(group_id)}
        />
        <span>
          <b>Overzicht</b> van
          {getGroupName(group_id)}-taken
          elke zondagmiddag
          voor de komende week.
        </span>

      </label>
      <label class="label text-lg text-wrap inline-flex">
        <input
          type="checkbox"
          disabled={subReminderDis}
          checked={$subReminderSet.has(id2(group_id, $user.id))}
          class="checkbox checkbox-xl"
          on:change={() => toggleSubReminder(group_id)}
        />
        <span>
          <b>Herinnering</b> als je de volgende
          dag een {getGroupName(group_id)}-taak hebt.
        </span>
      </label>
      <label class="label text-lg text-wrap inline-flex">
        <input
          type="checkbox"
          disabled={subAlarmDis}
          checked={$subAlarmSet.has(id2(group_id, $user.id))}
          class="checkbox checkbox-xl"
          on:change={() => toggleSubAlarm(group_id)}
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
