<script lang="ts">
  import { usersGroups } from "$lib/stores/users-groups.svelte";
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
  import { Bell, BellRing, Calendar1, Pin } from "lucide-svelte";
  import { user } from "$lib/stores/user.svelte";
  import { getGroupName } from "$lib/func";
    import { groups } from "$lib/stores/groups.svelte";

  let overviewDis = $state(false);
  let reminderDis = $state(false);
  let alarmDis = $state(false);

  const toggleSubOverview = async (group_id: string) => {
    if (!user.id){
      return;
    }
    overviewDis = true;
    if (subOverview.set.has(id2(group_id, user.id))){
      await deleteSubOverview(group_id, user.id);
      overviewDis = false;
      return;
    }
    await insertSubOverview(group_id, user.id);
    overviewDis = false;
  };

  const toggleSubReminder = async (group_id: string) => {
    if (!user.id){
      return;
    }
    reminderDis = true;
    if (subReminder.set.has(id2(group_id, user.id))){
      await deleteSubReminder(group_id, user.id);
      reminderDis = false;
      return;
    }
    await insertSubReminder(group_id, user.id);
    reminderDis = false;
  };

  const toggleSubAlarm = async (group_id: string) => {
    if (!user.id){
      return;
    }
    alarmDis = true;
    if (subAlarm.set.has(id2(group_id, user.id))){
      await deleteSubAlarm(group_id, user.id);
      alarmDis = false
      return;
    }
    await insertSubAlarm(group_id, user.id);
    alarmDis = false;
  };
</script>

<div class="p-4">
  <h1 class="text-2xl mb-2">
    <Bell class="inline-block" />
    Email Notificaties
  </h1>

  {#if user.id}
    {#if !(usersGroups.map.get(user.id)?.size)}
      <div class="card card-border bg-warning text-warning-content">
        <div class="card-body">
          <p class="text-lg">
            Je kan geen email notificaties instellen want
            je bent geen lid van een groep.
          </p>
        </div>
      </div>
    {/if}

    {#each [...(usersGroups.map.get(user.id) ?? [])] as group_id, i}

      <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
        <legend class="fieldset-legend text-lg">
          Groep {getGroupName(group_id)}
        </legend>

        <label
          class="label text-lg text-wrap inline-flex"
          class:text-success={false}
        >
          <input type="checkbox"
            disabled={overviewDis}
            checked={subOverview.set.has(id2(group_id, user.id))}
            class="checkbox checkbox-xl"
            class:checkbox-success={false}
            onchange={() => toggleSubOverview(group_id)}
          />
          <span>
            <Calendar1 class="inline-block" />
            <b>Overzicht</b> van
            {groups.map.get(group_id)}-taken
            elke zondagmiddag
            voor de komende week.
          </span>
        </label>

        <label class="label text-lg text-wrap inline-flex">
          <input type="checkbox"
            disabled={reminderDis}
            checked={subReminder.set.has(id2(group_id, user.id))}
            class="checkbox checkbox-xl"
            onchange={() => toggleSubReminder(group_id)}
          />
          <span>
            <Pin class="inline-block" />
            <b>Herinnering</b> als je de volgende
            dag een {groups.map.get(group_id)}-taak hebt.
          </span>
        </label>

        <label class="label text-lg text-wrap inline-flex">
          <input type="checkbox"
            disabled={alarmDis}
            checked={subAlarm.set.has(id2(group_id, user.id))}
            class="checkbox checkbox-xl"
            onchange={() => toggleSubAlarm(group_id)}
          />
          <span>
            <BellRing class="inline-block" />
            <b>Alarm</b>:
            melding als de volgende dag nog
            een {groups.map.get(group_id)}-taak
            open staat.
          </span>
        </label>
      </fieldset>

    {/each}
  {/if}
</div>
