<script lang="ts">
  import { groups } from "$lib/stores/groups.svelte";
  import { usernames } from "$lib/stores/usernames.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { CircleUser } from "lucide-svelte";
  import { user } from "$lib/stores/user.svelte";
  import { getGroupName, id2 } from "$lib/func";
    import BackToTasksBtn from "$lib/components/BackToTasksBtn.svelte";

  let uGrps = $derived([...groups.map.keys()].filter((group_id) => {
    return user.id && usersGroups.set.has(id2(group_id, user.id));
  }));
  let rowspan = $derived(uGrps.length ? uGrps.length : 1);

</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl mb-2">
      <CircleUser class="inline-block" />
      Account Instellingen
    </h1>
    <BackToTasksBtn />
  </div>

  <p class="mb-3">
    Je account instellingen kunnen enkel
    door een admin aangepast worden
  </p>

  {#if user.id && user.email}
    <div class="overflow-x-auto">
      <table class="table table-auto table-zebra border border-neutral-content">
        <tbody>

          <tr>
            <th class="border w-0 whitespace-nowrap">Naam</th>
            <td class="border">{usernames.map.get(user.id)}</td>
          </tr>

          <tr>
            <th class="border w-0 whitespace-nowrap">Email</th>
            <td class="border">{user.email}</td>
          </tr>

          {#if uGrps.length < 2}
            <tr>
              <th class="border w-0 whitespace-nowrap">
                Groep
              </th>
              <td class="border">
                {#if uGrps.length}
                  {getGroupName(uGrps[0])}
                {:else}
                  <span class="badge badge-warning">
                    Geen lid van een groep
                  </span>
                {/if}
              </td>
            </tr>
          {:else}
            <tr>
              <th
                {rowspan}
                class="border w-0 whitespace-nowrap"
              >
                Groepen
              </th>
              <td class="border">
                {getGroupName(uGrps[0])}
              </td>
            </tr>
            {#each uGrps as group_id,i}
              {#if i}
                <tr>
                  <td class="border">
                    {getGroupName(group_id)}
                  </td>
                </tr>
              {/if}
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  {/if}
</div>