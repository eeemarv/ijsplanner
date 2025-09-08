<script lang="ts">
  import { user } from "$lib/stores/user";
  import { groupsMap } from "$lib/stores/groups";
  import { usernamesMap } from "$lib/stores/usernames";
  import { usersGroupsMap } from "$lib/stores/users-groups";
  import { capitalize } from "$lib/func";
  import { CircleUser } from "lucide-svelte";

  const getGroupName = (group_id: string) => {
    return capitalize($groupsMap.get(group_id) ?? '** ERROR **');
  };

</script>

<div class="p-4">
  <h1 class="text-2xl mb-2">
     <CircleUser class="inline-block" />
     Account Instellingen
  </h1>
  <p class="mb-3">
    Je account instellingen kunnen enkel
    door een admin aangepast worden
  </p>

  <div class="overflow-x-auto">
    <table class="table table-auto table-zebra border border-neutral-content">
      <tbody>

        <tr>
          <th class="border w-0 whitespace-nowrap">Naam</th>
          <td class="border">{$usernamesMap.get($user.id)}</td>
        </tr>

        <tr>
          <th class="border w-0 whitespace-nowrap">Email</th>
          <td class="border">{$user.email}</td>
        </tr>

        {#if !$usersGroupsMap.has($user.id) || ($usersGroupsMap.get($user.id)?.size ?? 0) < 2}
          <tr>
            <th class="border w-0 whitespace-nowrap">
              Groep
            </th>
            <td class="border">
              {#if $usersGroupsMap.has($user.id)}
                {getGroupName([...$usersGroupsMap.get($user.id) ?? []][0])}
              {:else}
                <span class="badge badge-warning">
                  Geen lid van een groep
                </span>
              {/if}
            </td>
          </tr>
        {:else}
          <tr>
            <th rowspan="{$usersGroupsMap.get($user.id)?.size ?? 1}"  class="border w-0 whitespace-nowrap">
              Groepen
            </th>
            <td class="border">
              {getGroupName([...$usersGroupsMap.get($user.id) ?? []][0])}
            </td>
          </tr>
          {#each [...$usersGroupsMap.get($user.id)?.values() ?? []] as group_id,i}
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
</div>