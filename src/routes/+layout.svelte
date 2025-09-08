<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/components/Navbar.svelte';
  import { channelSubReminderSet } from '$lib/stores/sub-reminder';
  import { channelSubAlarmSet } from '$lib/stores/sub-alarm';
  import { channelSubOverviewSet } from '$lib/stores/sub-overview';
  import { channelGroupsMap } from '$lib/stores/groups';
  import { channelUsernamesMap } from '$lib/stores/usernames';
  import { channelUsersGroupsSet } from '$lib/stores/users-groups';
  import { channelRoleManageUsersSet } from '$lib/stores/role-manage-users';
  import { channelRoleManageSchedules } from '$lib/stores/role-manage-schedules';
  import { channelRoleManageTasks } from '$lib/stores/role-manage-tasks';

	let { children } = $props();

  channelGroupsMap();
  channelUsernamesMap();
  channelUsersGroupsSet();
  channelSubOverviewSet();
  channelSubReminderSet();
  channelSubAlarmSet();
  channelRoleManageTasks();
  channelRoleManageSchedules();
  channelRoleManageUsersSet();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />

{@render children?.()}