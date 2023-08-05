<script>
    import { onMount, setContext, onDestroy, getContext } from "svelte";
    import { make_id } from "../../../../utils";
    import {
        objects,
        object_stack,
        current_zoom,
        object_context_menu,
        camera_x1,
        camera_y1,
        camera_x2,
        camera_y2,
    } from "../../../../stores/canvas";

    export let x = 0;
    export let y = 0;
    export let z = 0;
    export let classes = "";
    export let ignore_cursor = false;
    export let id = make_id();
    export let use_svg = false;
    export let svg_attrs = {};

    let resize_observer;
    let is_mounted = false;
    let visible = true;
    let width = 0;
    let height = 0;
    let object_el;
    let is_dragging = false;
    let is_typing = false;
    let delta_x = 0;
    let delta_y = 0;
    let last_mouse_x = 0;
    let last_mouse_y = 0;
    let snap_to_grid = false;
    let grid_size = 24;

    const render_context = getContext("canvas-renderer");

    if (render_context.should_snap) {
        const g = render_context.should_snap();
        snap_to_grid = g[0];
        grid_size = g[1];
    }

    setContext("canvas-object", {
        get_id: () => id,
    });

    function update_card_store() {
        $objects[id] = { x, y, width, height, is_dragging };
        $objects = $objects;
    }

    function set_pointer_events_for(element, option) {
        // FIXME: if line below is uncommented it will prevent the cursor to be set by cursor: grab;
        // element.style.pointerEvents = option;
    }

    function handle_context_menu(e) {
        e.preventDefault();
        $object_context_menu = {
            data: "some payload data",
            mx: e.clientX,
            my: e.clientY,
        };
    }

    function drag_mouse_down(e) {
        if (e.button !== 0) return;
        $object_context_menu = null;

        const index = $object_stack.indexOf(id);
        $object_stack.splice(index, 1);
        $object_stack = [...$object_stack, id];

        last_mouse_x = e.clientX * (100 / $current_zoom);
        last_mouse_y = e.clientY * (100 / $current_zoom);

        e.target.classList.add("!cursor-grabbing");

        document.onmousemove = (e) => {
            if (e.button !== 0) return;
            delta_x = last_mouse_x - e.clientX * (100 / $current_zoom);
            delta_y = last_mouse_y - e.clientY * (100 / $current_zoom);
            last_mouse_x = e.clientX * (100 / $current_zoom);
            last_mouse_y = e.clientY * (100 / $current_zoom);
            x = x - delta_x;
            y = y - delta_y;
            is_dragging = true;
            set_pointer_events_for(object_el, "none");
            update_card_store();
        };

        document.onmouseup = (e) => {
            if (e.button !== 0) return;
            is_dragging = false;
            e.target.classList.remove("!cursor-grabbing");
            set_pointer_events_for(object_el, "initial");
            document.onmousemove = null;
            document.onmouseup = null;
            update_card_store();
        };
    }

    onMount(() => {
        $object_stack = [...$object_stack, id];

        resize_observer = new ResizeObserver((entries) => {
            width = entries[0].target.getBoundingClientRect().width;
            height = entries[0].target.getBoundingClientRect().height;
            update_card_store();
        });

        resize_observer.observe(object_el);

        is_mounted = true;
    });

    onDestroy(() => {
        if (resize_observer) resize_observer.disconnect();
        $object_stack = $object_stack.splice(z, 1);
        delete $objects[id];
    });

    $: if (object_el) {
        const draggables = [...object_el.querySelectorAll("[data-draggable]")];
        draggables.forEach((el) => {
            el.addEventListener("mousedown", drag_mouse_down);
            el.classList.add("hover:cursor-grab");
        });
    }

    $: z = $object_stack.indexOf(id);

    $: if (object_el) {
        let xx = snap_to_grid ? Math.round(x / grid_size) * grid_size : x;
        let yy = snap_to_grid ? Math.round(y / grid_size) * grid_size : y;
        object_el.style.transform = `translate3d(${xx}px, ${yy}px, 0)`;
        object_el.style.zIndex = $object_stack.indexOf(id);
    }

    $: if (is_dragging && is_mounted) {
        document.body.classList.add("select-none");
    } else if (!is_dragging && is_mounted) {
        document.body.classList.remove("select-none");
    }

    // $: if (is_mounted) {
    //     // console.log("test", width);
    //     visible =
    //         x + width > $camera_x1 &&
    //         x < $camera_x2 &&
    //         y + height > $camera_y1 &&
    //         y < $camera_y2;
    // }
</script>

{#if visible}
    {#if use_svg}
        <svg
            key={id}
            data-id={id}
            bind:this={object_el}
            on:contextmenu={handle_context_menu}
            class:pointer-events-none={ignore_cursor}
            class="absolute left-0 top-0 will-change-transform {classes}"
            {...svg_attrs}
        >
            <slot />
        </svg>
    {:else}
        <div
            key={id}
            data-id={id}
            bind:this={object_el}
            on:contextmenu={handle_context_menu}
            class:pointer-events-none={ignore_cursor}
            class="absolute left-0 top-0 will-change-transform {classes}"
        >
            <slot />
        </div>
    {/if}
{/if}
