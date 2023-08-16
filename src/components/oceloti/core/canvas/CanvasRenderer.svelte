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
    is_meta_pressed,
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
  let has_local_camera_state_been_stored = false;

  const OCELOTI_CAMERA_STATE_LOCAL_STORAGE_KEY = "oceloti-stored-camera-state";

  let inner_canvas_ref = null;
  let window_width = 0;
  let window_height = 0;
  const PANNING_SPEED = 0.15;
  const INITIAL_ZOOMING_SPEED = 18;
  let ZOOMING_SPEED = INITIAL_ZOOMING_SPEED;
  let is_mounted_in_browser = false;
  let is_trying_to_zoom = false;
  let panning_timeout = null;
  let zooming_timeout = null;

  setContext("canvas-renderer", {
    should_snap() {
      return [snap_to_grid, grid_size];
    },
  });

  onMount(() => {
    if (window) {
      is_mounted_in_browser = true;

      if (!has_local_camera_state_been_stored) {
        const local_stored_camera_state = localStorage.getItem(
          OCELOTI_CAMERA_STATE_LOCAL_STORAGE_KEY
        );
        if (local_stored_camera_state !== null) {
          update_camera_from_storage(JSON.parse(local_stored_camera_state));
        } else {
          save_camera_state_on_storage();
        }
      }

      window_width = window.innerWidth;
      window_height = window.innerHeight;

      window.addEventListener("resize", () => {
        window_width = window.innerWidth;
        window_height = window.innerHeight;
      });

      if (!zoomable) return;

      window.addEventListener(
        "wheel",
        (e) => {
          $object_context_menu = null;

          if ($is_scrolling_view && !$is_panning) {
            return;
          }

          // @FIXME: Get a better delta for pinch zooming
          // console.log(e.ctrlKey, e.wheelDelta, e.deltaY);

          if (e.ctrlKey) {
            e.preventDefault();
            start_zooming(true);
            $is_zooming = true;
            clearTimeout(zooming_timeout);
            zooming_timeout = setTimeout(() => {
              $is_zooming = false;
            }, 500);
          }

          if (($is_meta_pressed || e.ctrlKey) && inner_canvas_ref) {
            $is_panning = false;
            $current_zoom += e.wheelDeltaY / ZOOMING_SPEED;
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
        $is_meta_pressed = e.key === "Meta";

        start_zooming();
        $is_zooming = true;

        if (e.metaKey && e.key === "0") {
          $current_zoom = 100;
        }
      });

      window.addEventListener("keyup", (e) => {
        if (e.key === "Meta") {
          stop_zooming();
          $is_zooming = false;
        }
      });
    }
  });

  function update_camera_from_storage(stored_state) {
    $background_x = stored_state.background_x;
    $background_y = stored_state.background_y;
    $current_zoom = stored_state.current_zoom;
    $world_x = stored_state.world_x;
    $world_y = stored_state.world_y;
    $zoom_translation_x = stored_state.zoom_translation_x;
    $zoom_translation_y = stored_state.zoom_translation_y;
    has_local_camera_state_been_stored = true;
  }

  function save_camera_state_on_storage() {
    if (!is_mounted_in_browser) return;

    localStorage.setItem(
      OCELOTI_CAMERA_STATE_LOCAL_STORAGE_KEY,
      JSON.stringify({
        background_x: $background_x,
        background_y: $background_y,
        current_zoom: $current_zoom,
        world_x: $world_x,
        world_y: $world_y,
        zoom_translation_x: $zoom_translation_x,
        zoom_translation_y: $zoom_translation_y,
      })
    );
    has_local_camera_state_been_stored = true;
  }

  function stop_zooming() {
    $is_meta_pressed = false;
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

  function start_zooming(pinch = false) {
    if (pinch) {
      stop_zooming();
      ZOOMING_SPEED = INITIAL_ZOOMING_SPEED * 3;
    } else {
      ZOOMING_SPEED = INITIAL_ZOOMING_SPEED;
    }
    if ((pinch || $is_meta_pressed) && !is_trying_to_zoom) {
      is_trying_to_zoom = true;
      $last_mouse_x = $relative_mouse_x;
      $last_mouse_y = $relative_mouse_y;

      if ($current_zoom !== 100) {
        $zoom_translation_x -= $last_mouse_x;
        $zoom_translation_y -= $last_mouse_y;
        $zoom_translation_x += $last_mouse_x * ($current_zoom / 100);
        $zoom_translation_y += $last_mouse_y * ($current_zoom / 100);
      } else {
        $zoomed_origin_x = $last_mouse_x * (100 / $current_zoom);
        $zoomed_origin_y = $last_mouse_y * (100 / $current_zoom);
        $zoom_offset_x = $last_mouse_x - $zoomed_origin_x;
        $zoom_offset_y = $last_mouse_y - $zoomed_origin_y;
      }
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

  $: save_camera_state_on_storage($is_zooming, $is_panning, $is_dragging);
</script>

<div
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
      {#if has_local_camera_state_been_stored}
        <slot />
      {/if}
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
