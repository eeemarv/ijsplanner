<script>
  import { goto } from "$app/navigation";
  import { ChevronLeft } from "lucide-svelte";
</script>

<button
  class="btn btn-primary"
  onclick={() => goto('/tasks')}
>
  <ChevronLeft />
  Terug
</button>