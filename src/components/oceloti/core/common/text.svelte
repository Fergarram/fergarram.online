<script>
    export let is_selectable = false;
    export let attrs = {};
    export let classes = "text-12 text-neutral-100 font-mono";
    // @TODO: Check store??? and make is_selectable false if dragging???
</script>

<span {...attrs} class={classes} class:select-none={!is_selectable}>
    <slot />
</span>
