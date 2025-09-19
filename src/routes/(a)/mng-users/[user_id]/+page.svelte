<script lang="ts">
  import { page } from "$app/state";
  import { usernames } from "$lib/stores/usernames.svelte";
  import { groups } from "$lib/stores/groups.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { roleSchedules } from "$lib/stores/role-schedules.svelte";
  import { roleTasks } from "$lib/stores/role-tasks.svelte";
  import { subOverview } from "$lib/stores/sub-overview.svelte";
  import { subReminder } from "$lib/stores/sub-reminder.svelte";
  import { subAlarm } from "$lib/stores/sub-alarm.svelte";
  import { BellRing, Calendar1, ChevronLeft, ClockAlert, Pin, TableProperties, UserPen, UsersRound } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { id2 } from "$lib/func";
  import { deleteSubOverview, insertSubOverview } from "$lib/db/db-sub-overview";
  import { deleteSubReminder, insertSubReminder } from "$lib/db/db-sub-reminder";
  import { deleteSubAlarm, insertSubAlarm } from "$lib/db/db-sub-alarm";
  import { deleteRoleSchedules, insertRoleSchedules } from "$lib/db/db-role-schedules";
  import { deleteRoleTasks, insertRoleTasks } from "$lib/db/db-role-tasks";
  import { deleteUsersGroups, insertUsersGroups } from "$lib/db/db-users-groups";
	import type { PageProps } from './$types';
  import { supabase } from "$lib/supabase";
  import { updateUsername } from "$lib/db/db-usernames";
  import { getGroupName } from "$lib/func";

	let { data }: PageProps = $props();

  let disabled = $state(false);
  let email = $state(data.email);
  //let user_id = $state<string>('');
  let message = $state('');
  let isError = $state(false);

  let emailErrorMsg = $state('');

  let showUpdateEmailSuccess = $state(false);
  let showUpdateUsernameSuccess = $state(false);
  let showUpdateCheckboxSuccess = $state(false);

  let user_id = $derived(page.params.user_id ?? '');
  let username = $derived.by(() => {
    if (!user_id){
      return '** ERR **';
    }
    const u = usernames.map.get(user_id);
    if (!u){
      return '** ERR **/2';
    }
    return u;
  });

  $effect(() => {
    if (!user_id || !usernames.map.has(user_id)) {
      goto('/');
    }
  });

  const submitEmail = async (e : Event) => {
    disabled = true;
    e.preventDefault();

    const { error } = await supabase.functions.invoke('update-user-email', {
      body: { user_id, new_email: email }
    });

    disabled = false;

    if (error) {
      console.log('--error--', error);
      emailErrorMsg = error.message;
      setTimeout(() => {
        emailErrorMsg = '';
      }, 5000);
      return;
    }
    setTimeout(() => {
      showUpdateEmailSuccess = false;
    }, 500);
    showUpdateEmailSuccess = true;
  };

  const submitUsername = async (e : Event) => {
    disabled = true;
    e.preventDefault();
    try {
      await updateUsername({user_id, username});
      setTimeout(() => {
        showUpdateUsernameSuccess = false;
      }, 500);
      showUpdateUsernameSuccess = true;
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
  };

  const toggleUsersGroups = async (group_id: string) => {
    disabled = true;
    if (usersGroups.set.has(id2(group_id, user_id))){
      try {
        await deleteUsersGroups({group_id, user_id});
      } catch (err) {
        console.log(err);
      } finally {
        disabled = false;
      }
      return;
    }
    try {
      await insertUsersGroups({group_id, user_id});
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
  };

  const toggleRoleTasks = async (group_id: string) => {
    disabled = true;
    if (roleTasks.set.has(id2(group_id, user_id))){
      try {
        await deleteRoleTasks({group_id, user_id});
      } catch (err) {
        console.log(err);
      } finally {
        disabled = false;
      }
      return;
    }
    try {
      await insertRoleTasks({group_id, user_id});
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
  };

  const toggleRoleSchedules = async (group_id: string) => {
    disabled = true;
    if (roleSchedules.set.has(id2(group_id, user_id))){
      try {
        await deleteRoleSchedules({group_id, user_id});
      } catch (err) {
        console.log(err);
      } finally {
        disabled = false;
      }
      return;
    }
    try {
      await insertRoleSchedules({group_id, user_id});
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
  };

  const toggleSubOverview = async (group_id: string) => {
    disabled = true;
    if (subOverview.set.has(id2(group_id, user_id))){
      try {
        await deleteSubOverview({group_id, user_id});
      } catch (err) {
        console.log(err);
      } finally {
        disabled = false;
      }
      return;
    }
    try {
      await insertSubOverview({group_id, user_id});
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
    return;
  };

  const toggleSubReminder = async (group_id: string) => {
    disabled = true;
    if (subReminder.set.has(id2(group_id, user_id))){
      try {
        await deleteSubReminder({group_id, user_id});
      } catch (err) {
        console.log(err);
      } finally {
        disabled = false;
      }
      return;
    }
    try {
      await insertSubReminder({group_id, user_id});
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
  };

  const toggleSubAlarm = async (group_id: string) => {
    disabled = true;
    if (subAlarm.set.has(id2(group_id, user_id))){
      try {
        await deleteSubAlarm({group_id, user_id});
      } catch (err) {
        console.log(err);
      } finally {
        disabled = false;
      }
      return;
    }
    try {
      await insertSubAlarm({group_id, user_id});
    } catch (err) {
      console.log(err);
    } finally {
      disabled = false;
    }
  };
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <UserPen class="inline-block" />
      Aanpassen gebruiker {usernames.map.get(user_id) ?? '** ERR **'}
    </h1>
    <button
      class="btn btn-info"
      onclick={() => goto('/mng-users')}
    >
      <ChevronLeft />
      Terug
    </button>
  </div>

  <div class="px-4">

  {#if message}
    <div role="alert" class="alert"
      class:alert-success={!isError}
      class:alert-error={isError}
    >
      <span>{message}</span>
    </div>
  {/if}

  <form onsubmit={submitEmail}>
    <label class="block">
      <span class="text-sm">Email address</span>
      <input type="email" {disabled}
        class="input input-bordered invalid:border-error invalid:text-error w-full mb-2"
        class:input-success={showUpdateEmailSuccess}
        bind:value={email}
        required
      />
      {#if emailErrorMsg}
        <span class="text-error">
          {emailErrorMsg}
        </span>
      {/if}
    </label>
    <button type="submit" class="btn btn-primary"
      {disabled}
    >
      Pas aan
    </button>
  </form>

  <form onsubmit={submitUsername} >
    <label class="block">
      <span class="text-sm">Gebruikersnaam</span>
      <input type="text" {disabled}
        minlength="3"
        class="input input-bordered invalid:border-error invalid:text-error w-full mb-2"
        class:input-success={showUpdateUsernameSuccess}
        bind:value={username}
        required
      />
    </label>
    <button type="submit" class="btn btn-primary"
      {disabled}
    >
      Pas aan
    </button>
  </form>


  </div>

  {#each groups.map.keys() as group_id, i}

    <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
      <legend class="fieldset-legend text-lg">
        Groep {getGroupName(group_id)}
      </legend>

      <label class="label text-lg text-wrap inline-flex">
        <input type="checkbox" {disabled}
          checked={usersGroups.set.has(id2(group_id, user_id))}
          class="checkbox checkbox-xl"
          onchange={() => toggleUsersGroups(group_id)}
        />
        <span>
          <UsersRound class="inline-block" />
          <b>Lid van deze groep</b>
        </span>
      </label>

      <label class="label text-lg text-wrap inline-flex">
        <input type="checkbox" {disabled}
          checked={subOverview.set.has(id2(group_id, user_id))}
          class="checkbox checkbox-xl"
          onchange={() => toggleSubOverview(group_id)}
        />
        <span>
          <Calendar1 class="inline-block" />
          <b>Overzicht</b>
          Email notificatie
        </span>
      </label>

      <label class="label text-lg text-wrap inline-flex">
        <input type="checkbox" {disabled}
          checked={subReminder.set.has(id2(group_id, user_id))}
          class="checkbox checkbox-xl"
          onchange={() => toggleSubReminder(group_id)}
        />
        <span>
          <Pin class="inline-block" />
          <b>Herinnering</b>
          Email notificatie
        </span>
      </label>

      <label class="label text-lg text-wrap inline-flex">
        <input type="checkbox" {disabled}
          checked={subAlarm.set.has(id2(group_id, user_id))}
          class="checkbox checkbox-xl"
          onchange={() => toggleSubAlarm(group_id)}
        />
        <span>
          <BellRing class="inline-block" />
          <b>Alarm</b> Email notificatie
        </span>
      </label>

      <label class="label text-lg text-wrap inline-flex">
        <input type="checkbox" {disabled}
          checked={roleSchedules.set.has(id2(group_id, user_id))}
          class="checkbox checkbox-xl"
          onchange={() => toggleRoleSchedules(group_id)}
        />
        <span>
          <TableProperties class="inline-block" />
          <b>Schema Beheer</b>
        </span>
      </label>

      <label class="label text-lg text-wrap inline-flex">
        <input type="checkbox" {disabled}
          checked={roleTasks.set.has(id2(group_id, user_id))}
          class="checkbox checkbox-xl"
          onchange={() => toggleRoleTasks(group_id)}
        />
        <span>
          <ClockAlert class="inline-block" />
          <b>Taken Beheer</b>
        </span>
      </label>
    </fieldset>
  {/each}

</div>