<script>
  export let name;
  export let attrs = {};
  export let classes = "text-black";
  export let size = "text-24";
</script>

<span {...attrs} class="material-symbols-outlined select-none {size} {classes}"
  >{name}</span
>
