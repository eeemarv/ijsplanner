<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/components/Navbar.svelte';
  import { channelSubReminder } from '$lib/stores/sub-reminder.svelte';
  import { channelSubAlarm } from '$lib/stores/sub-alarm.svelte';
  import { channelSubOverview } from '$lib/stores/sub-overview.svelte';
  import { channelGroups } from '$lib/stores/groups.svelte';
  import { channelUsernames } from '$lib/stores/usernames.svelte';
  import { channelUsersGroups } from '$lib/stores/users-groups.svelte';
  import { channelRoleManageUsers } from '$lib/stores/role-manage-users.svelte';
  import { channelRoleManageSchedules } from '$lib/stores/role-manage-schedules.svelte';
  import { channelRoleManageTasks } from '$lib/stores/role-manage-tasks.svelte';

	let { children } = $props();

  channelGroups();
  channelUsernames();
  channelUsersGroups();
  channelSubOverview();
  channelSubReminder();
  channelSubAlarm();
  channelRoleManageTasks();
  channelRoleManageSchedules();
  channelRoleManageUsers();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />

<!--
<div role="alert" class="alert alert-error alert-outline mx-4 my-2">
  <span>TEST FASE. Dit is <u>geen</u> echte planning</span>
</div>-->

{@render children?.()}