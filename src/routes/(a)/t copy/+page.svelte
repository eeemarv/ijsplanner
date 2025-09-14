<script>
  import { CirclePlus, Plus } from "lucide-svelte";

  const schedule = [
    {
      date: "Monday, May 5",
      tasks: [
        { time: "08:00–09:00", title: "Morning Setup" },
        { time: "10:00–11:00", title: "Food Distribution" },
        { time: "13:00–14:00", title: "Cleanup" },
        { time: "13:00–14:00", title: "Cleanup" },
        { time: "13:00–14:00", title: "Cleanup" },
      ],
    },
    {
      date: "Tuesday, May 6",
      tasks: [
        { time: "09:00–10:00", title: "Inventory Check" },
        { time: "11:00–12:00", title: "Volunteer Briefing" },
      ],
    },
    {
      date: "Tuesday, May 6",
      tasks: [
        { time: "09:00–10:00", title: "Inventory Check" },
        { time: "11:00–12:00", title: "Volunteer Briefing" },
      ],
    },
    {
      date: "Wednesday, May 7",
      tasks: [
      ],
    },
    {
      date: "Thursday, May 8",
      tasks: [
        { time: "09:00–10:00", title: "Inventory Check" },
        { time: "11:00–12:00", title: "Volunteer Briefing" },
      ],
    }
  ]
</script>


<div class="p-4">
  {#each schedule as day, index}
      {#if index == 2}
        <div class="divider">
          <div class="badge badge-outline">
          Week 17
          </div>
        </div>
      {:else}
        <div class="divider my-0"></div>
      {/if}
    <div class="px-2 py-1{index % 2 ? '' : ' bg-base-200'}">


      <h2 class="text-lg font-semibold">{#if !index}&#9654; {/if}{day.date}</h2>
      <div class="flex flex-wrap gap-2 font-semibold">
        {#each day.tasks as task}

          <div
            class="card border border-error bg-base-300 min-w-[150px] sm:min-w-[200px] my-2"
          >
            <div class="card-body p-2">
              <div class="badge badge-success">
                <CirclePlus strokeWidth="3" />
                0/2
              </div>

              <span class="badge badge-primary"><span class="card-title text-sm sm:text-base">{task.title}</span></span>
              <p class="text-xs sm:text-sm">{task.time}
                <span class="btn btn-success btn-sm text-2xl">
                  <Plus strokeWidth="4" />
                </span>
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
