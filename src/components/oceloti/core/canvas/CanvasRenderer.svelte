<script>
  import { onMount, setContext } from "svelte";
  import { throttle } from "../../../../utils";
  import { object_context_menu } from "../../../../stores/workspace";
  import {
    canvas_logs,
    is_panning,
    world_x,
    world_y,
    camera_x1,
    camera_y1,
    camera_x2,
    camera_y2,
    is_scrolling_view,
    is_dragging,
    is_zooming,
    mouse_x,
    mouse_y,
    background_x,
    background_y,
    last_mouse_x,
    last_mouse_y,
    last_zoom_origin_x,
    last_zoom_origin_y,
    zoom_translation_x,
    zoom_translation_y,
    relative_mouse_x,
    relative_mouse_y,
    current_zoom,
    zoomed_origin_x,
    zoomed_origin_y,
    zoom_offset_x,
    zoom_offset_y,
    is_debug,
  } from "../../../../stores/canvas";
  import CanvasDebug from "./CanvasDebug.svelte";

  export let zoomable = true;
  export let wallpaper = { color: "transparent" };
  export let classes = "w-full h-full absolute";
  export let snap_to_grid = false;
  export let grid_size = 24;
  export let min_zoom = 10;
  export let max_zoom = 200;

  const OCELOTI_CAMERA_STATE_LOCAL_STORAGE_KEY = "oceloti-stored-camera-state";

  let inner_canvas_ref = null;
  let outer_canvas_ref = null;
  let window_width = 0;
  let window_height = 0;
  const PANNING_SPEED = 0.15;
  let ZOOMING_SPEED = 5;
  let is_mounted_in_browser = false;
  let is_trying_to_zoom = false;
  let panning_timeout = null;
  let zooming_timeout = null;
  let initial_touch_distance = 0;
  let last_touch_x = null;
  let last_touch_y = null;

  setContext("canvas-renderer", {
    should_snap() {
      return [snap_to_grid, grid_size];
    },
  });

  onMount(() => {
    if (window) {
      is_mounted_in_browser = true;

      window_width = window.innerWidth;
      window_height = window.innerHeight;

      window.addEventListener("resize", () => {
        window_width = window.innerWidth;
        window_height = window.innerHeight;
      });

      if (!zoomable) return;

      window.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          last_touch_x = e.touches[0].clientX;
          last_touch_y = e.touches[0].clientY;
        }

        if (e.touches.length === 2) { // Two fingers for zoom
          initial_touch_distance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          );
        }
      });

      window.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1) { // Single touch for panning
          const current_touch_x = e.touches[0].clientX;
          const current_touch_y = e.touches[0].clientY;

          const delta_x = current_touch_x - last_touch_x;
          const delta_y = current_touch_y - last_touch_y;

          $world_x += delta_x * PANNING_SPEED;
          $world_y += delta_y * PANNING_SPEED;

          last_touch_x = current_touch_x;
          last_touch_y = current_touch_y;

          $is_panning = true;
          clearTimeout(panning_timeout);
          panning_timeout = setTimeout(() => {
            $is_panning = false;
          }, 500);
        }
        if (e.touches.length === 2) {
          // @FIXME: Disable native pinch zoom on mobile
          const new_distance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          );
          const zoom_factor = new_distance / initial_touch_distance;

          $current_zoom *= zoom_factor;
          initial_touch_distance = new_distance;
        }
      });

      window.addEventListener(
        "wheel",
        (e) => {
          $object_context_menu = null;

          if ($is_scrolling_view && !$is_panning) {
            return;
          }

          if ((e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            start_zooming();
            $is_zooming = true;
            clearTimeout(zooming_timeout);
            zooming_timeout = setTimeout(() => {
              $is_zooming = false;
            }, 500);
          }

          if ((e.ctrlKey || e.metaKey) && inner_canvas_ref) {
            $is_panning = false;
            $current_zoom += -e.deltaY / ZOOMING_SPEED;
            if ($current_zoom <= min_zoom) $current_zoom = min_zoom;
            if ($current_zoom >= max_zoom) $current_zoom = max_zoom;
            $zoomed_origin_x = $last_mouse_x * (100 / $current_zoom);
            $zoomed_origin_y = $last_mouse_y * (100 / $current_zoom);
            $zoom_offset_x =
              $last_mouse_x -
              $zoomed_origin_x -
              $zoom_translation_x * (100 / $current_zoom);
            $zoom_offset_y =
              $last_mouse_y -
              $zoomed_origin_y -
              $zoom_translation_y * (100 / $current_zoom);
          } else {
            $world_x += e.wheelDeltaX * PANNING_SPEED;
            $world_y += e.wheelDeltaY * PANNING_SPEED;
            $is_panning = true;
            clearTimeout(panning_timeout);
            panning_timeout = setTimeout(() => {
              $is_panning = false;
            }, 500);
          }
        },
        { passive: false }
      );

      window.addEventListener("mousemove", (e) => {
        $is_panning = false;
        $mouse_x = e.clientX;
        $mouse_y = e.clientY;
      });

      window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "0") {
          $is_zooming = true;
          $current_zoom = 100;
          start_zooming();
        }
      });
    }
  });

  function stop_zooming() {
    is_trying_to_zoom = false;
    $last_zoom_origin_x = $last_mouse_x;
    $last_zoom_origin_y = $last_mouse_y;
    $zoom_translation_x = 0;
    $zoom_translation_y = 0;
    $zoom_translation_x = -$zoom_offset_x * ($current_zoom / 100);
    $zoom_translation_y = -$zoom_offset_y * ($current_zoom / 100);
    $last_mouse_x = 0;
    $last_mouse_y = 0;
  }

  function start_zooming() {
    stop_zooming();

    if (!is_trying_to_zoom) {
      is_trying_to_zoom = true;
      $last_mouse_x = $relative_mouse_x;
      $last_mouse_y = $relative_mouse_y;

      $zoom_translation_x -= $last_mouse_x;
      $zoom_translation_y -= $last_mouse_y;
      $zoom_translation_x += $last_mouse_x * ($current_zoom / 100);
      $zoom_translation_y += $last_mouse_y * ($current_zoom / 100);
    }
  }

  function handle_click_outside(e) {
    if (e.target === inner_canvas_ref || e.target === outer_canvas_ref) {
      const custom_event = new CustomEvent("canvas-mousedown", {
        detail: { mouse_event: e },
      });
      window.dispatchEvent(custom_event);
    }
  }

  const log_zoom = throttle(() => {
    $canvas_logs.push(`Zoomed to ${Math.round($current_zoom)}%`);
    $canvas_logs = $canvas_logs;
  }, 200);

  $: if (is_mounted_in_browser && $is_dragging) {
    document.body.classList.add("select-none");
  } else if (is_mounted_in_browser && !$is_dragging) {
    document.body.classList.remove("select-none");
  }

  $: $camera_x1 = (0 - $world_x) * (100 / $current_zoom) + $zoom_offset_x;
  $: $camera_y1 = (0 - $world_y) * (100 / $current_zoom) + $zoom_offset_y;
  $: $camera_x2 =
    (window_width - $world_x) * (100 / $current_zoom) + $zoom_offset_x;
  $: $camera_y2 =
    (window_height - $world_y) * (100 / $current_zoom) + $zoom_offset_y;

  $: $relative_mouse_x =
    ($mouse_x - $world_x) * (100 / $current_zoom) + $zoom_offset_x;
  $: $relative_mouse_y =
    ($mouse_y - $world_y) * (100 / $current_zoom) + $zoom_offset_y;

  $: $background_x = $world_x + -$zoom_offset_x * ($current_zoom / 100);
  $: $background_y = $world_y + -$zoom_offset_y * ($current_zoom / 100);

  $: {
    if ($current_zoom <= min_zoom) $current_zoom = min_zoom;
    if ($current_zoom >= max_zoom) $current_zoom = max_zoom;
    log_zoom();
  }
</script>

<div
  bind:this={outer_canvas_ref}
  on:mousedown={handle_click_outside}
  class="overflow-hidden {classes}"
  style="
        background-color: {wallpaper.color || 'white'};
        background-image: url('{wallpaper.url}');
        background-size: {(wallpaper.width || 600) * ($current_zoom / 100)}px;
        background-position: {$background_x}px {$background_y}px;
    "
>
  <div
    bind:this={inner_canvas_ref}
    class="absolute w-full h-full will-change-transform"
    style="transform: translate3d({$world_x}px, {$world_y}px, 0)"
  >
    <div
      class="relative will-change-transform"
      style="
                left: {$zoom_translation_x}px;
                top: {$zoom_translation_y}px;
                transform: scale({$current_zoom / 100});
                transform-origin: {$last_mouse_x}px {$last_mouse_y}px;
            "
    >
      <slot />
      {#if $is_debug}
        <CanvasDebug />
      {/if}
    </div>
    {#if $is_debug}
      <div
        class="absolute left-0 top-0 w-full h-full border-2 border-red-700 pointer-events-none"
      />
    {/if}
  </div>
</div>
