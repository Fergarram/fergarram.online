<script>
  import { onMount, setContext } from "svelte";
  // import CanvasObject from "./CanvasObject.svelte";
  import { throttle } from "../../../../utils";
  import {
    canvas_logs,
    object_context_menu,
    world_x,
    is_panning,
    world_y,
    camera_x1,
    camera_y1,
    camera_x2,
    camera_y2,
    is_scrolling_view,
    is_dragging,
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
    is_zooming,
    relative_mouse_x,
    relative_mouse_y,
    current_zoom,
    zoomed_origin_x,
    zoomed_origin_y,
    zoom_offset_x,
    zoom_offset_y,
    is_meta_pressed,
  } from "../../../../stores/canvas";

  export let zoomable = true;
  export let wallpaper = { color: "transparent" };
  export let classes = "w-full h-full absolute";
  export let snap_to_grid = false;
  export let grid_size = 24;
  export let min_zoom = 10;
  export let max_zoom = 200;

  let inner_canvas_ref = null;
  let window_width = 0;
  let window_height = 0;
  const PANNING_SPEED = 0.15;
  const INITIAL_ZOOMING_SPEED = 18;
  let ZOOMING_SPEED = INITIAL_ZOOMING_SPEED;
  let is_mounted = false;

  setContext("canvas-renderer", {
    should_snap() {
      return [snap_to_grid, grid_size];
    },
  });

  onMount(() => {
    if (window) {
      is_mounted = true;
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
            $is_panning = true;
            $world_x += e.wheelDeltaX * PANNING_SPEED;
            $world_y += e.wheelDeltaY * PANNING_SPEED;
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

        if ($is_meta_pressed && e.key === "0") {
          $current_zoom = 100;
        }
      });

      window.addEventListener("keyup", (e) => {
        if (e.key === "Meta") {
          stop_zooming();
        }
      });
    }
  });

  function stop_zooming() {
    $is_meta_pressed = false;
    $is_zooming = false;
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
    if ((pinch || $is_meta_pressed) && !$is_zooming) {
      $is_zooming = true;
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

  $: if (is_mounted && $is_dragging) {
    document.body.classList.add("select-none");
  } else if (is_mounted && !$is_dragging) {
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
      <!-- <div class="absolute top-0 left-0 pointer-events-none select-none border-2 border-red-700">
                <img class="w-[200px]" draggable="false" src="/woodtex.jpg" alt="" />
            </div> -->
      <slot />
      <!-- <CanvasObject
                x={$relative_mouse_x}
                y={$relative_mouse_y}

                z={1000}
            >
                <div class="bg-white rounded-full">
                    ({$relative_mouse_x}, {$relative_mouse_y})
                </div>
            </CanvasObject>
            <CanvasObject x={$world_x} y={$world_y} z={1000}>
                <div class="w-4 h-4 bg-lime-500 rounded-full" />
            </CanvasObject>
            <CanvasObject
                x={$last_mouse_x}
                y={$last_mouse_y}

                z={1000}
            >
                <div class="w-4 h-4 bg-red-500 rounded-full" />
            </CanvasObject>
            <CanvasObject
                x={$zoomed_origin_x}
                y={$zoomed_origin_y}

                z={1000}
            >
                <div class="w-4 h-4 bg-purple-300 rounded-full" />
            </CanvasObject>
            <CanvasObject
                x={$zoom_offset_x}
                y={$zoom_offset_y}

                z={1000}
            >
                <div class="w-4 h-4 bg-purple-700 rounded-full" />
            </CanvasObject> -->
      <!-- <CanvasObject x={$camera_x1} y={$camera_y1} z={1000}>
                <div class="w-4 h-4 bg-purple-700 rounded-full" />
            </CanvasObject>
            <CanvasObject x={$camera_x2 - 16} y={$camera_y2 - 16} z={1000}>
                <div class="w-4 h-4 bg-purple-700 rounded-full" />
            </CanvasObject> -->
    </div>
    <!-- <div
            class="absolute left-0 top-0 w-full h-full border-2 border-red-700 pointer-events-none"
        /> -->
  </div>
</div>
