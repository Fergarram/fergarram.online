<script>
  import HydratedHome from "../../components/home/HydratedHome.svelte";

  export let data, request, settings;
  const permalink = settings.origin + request.permalink;
</script>

<main class="overflow-hidden fixed w-full h-full">
  <HydratedHome hydrate-client={{ data, permalink }} />
</main>
