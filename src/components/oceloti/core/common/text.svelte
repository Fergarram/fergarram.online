<script>
  export let is_selectable = false;
  export let fontClasses = "text-14 text-black font-sans";
  export let label_for = null;
  export let classes = "flex";
  export let attrs = {};
</script>

{#if label_for}
  <label
    {...attrs}
    class="{fontClasses} {classes}"
    class:select-none={!is_selectable}
    for={label_for}
  >
    <slot />
  </label>
{:else}
  <span
    {...attrs}
    class="{fontClasses} {classes}"
    class:select-none={!is_selectable}
  >
    <slot />
  </span>
{/if}
