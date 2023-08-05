<script>
    import { getContext } from "svelte";
    import { objects } from "../../../../stores/canvas";

    export let is_draggable = false;
    export let styles = "";
    export let classes = "";
    export let dragging_classes = "";
    export let idle_classes = "";
    export let attrs = {};
    export let show_shadow = true;

    let is_dragging = false;
    const { get_id } = getContext("canvas-object");
    const id = get_id();

    $: is_dragging = $objects[id] ? $objects[id].is_dragging : false;
</script>

<div
    {...attrs}
    style={styles}
    data-draggable={is_draggable ? true : null}
    class="transition {classes} {is_dragging
        ? `shadow-grabbing scale-[1.01] ${dragging_classes}`
        : show_shadow
        ? `shadow-floor ${idle_classes}`
        : ''}"
>
    <slot />
</div>
