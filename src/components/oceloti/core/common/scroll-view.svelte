<script>
    import { is_scrolling_view } from "../../../../stores/canvas";
    export let attrs = {};
    export let styles = "";
    export let classes = "";
    export let type = "overflow-scroll";
    // @TODO: Potentially add logic to detect if scroll view contents don't actually overflow.
    // @TODO: Another optimization would be to hide invisible elements for longer lists like logs.
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
    {...attrs}
    style={styles}
    class="{type} {classes}"
    on:mouseover={() => ($is_scrolling_view = true)}
    on:mouseout={() => ($is_scrolling_view = false)}
>
    <slot />
</div>
