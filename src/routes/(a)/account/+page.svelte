<script lang="ts">
  import { groups } from "$lib/stores/groups.svelte";
  import { usernames } from "$lib/stores/usernames.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { CircleUser } from "lucide-svelte";
  import { user } from "$lib/stores/user.svelte";
  import { getGroupName } from "$lib/func";

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

          {#if !usersGroups.map.has(user.id) || (usersGroups.map.get(user.id)?.size ?? 0) < 2}
            <tr>
              <th class="border w-0 whitespace-nowrap">
                Groep
              </th>
              <td class="border">
                {#if usersGroups.map.has(user.id)}
                  {getGroupName([...usersGroups.map.get(user.id) ?? []][0])}
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
                rowspan="{usersGroups.map.get(user.id)?.size ?? 1}"
                class="border w-0 whitespace-nowrap"
              >
                Groepen
              </th>
              <td class="border">
                {getGroupName([...usersGroups.map.get(user.id) ?? []][0])}
              </td>
            </tr>
            {#each [...usersGroups.map.get(user.id)?.values() ?? []] as group_id,i}
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