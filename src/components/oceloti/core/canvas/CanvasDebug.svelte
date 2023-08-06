<script>
  import CanvasObject from "./CanvasObject.svelte";
  import {
    relative_mouse_x,
    relative_mouse_y,
    world_x,
    world_y,
    last_mouse_x,
    last_mouse_y,
    zoomed_origin_x,
    zoomed_origin_y,
    zoom_offset_x,
    zoom_offset_y,
    camera_x1,
    camera_y1,
    camera_x2,
    camera_y2,
  } from "../../../../stores/canvas";
</script>

<CanvasObject x={$relative_mouse_x} y={$relative_mouse_y} z={1000}>
  <div class="bg-white rounded-full">
    ({$relative_mouse_x}, {$relative_mouse_y})
  </div>
</CanvasObject>
<CanvasObject x={$world_x} y={$world_y} z={1000}>
  <div class="w-4 h-4 bg-lime-500 rounded-full" />
</CanvasObject>
<CanvasObject x={$last_mouse_x} y={$last_mouse_y} z={1000}>
  <div class="w-4 h-4 bg-red-500 rounded-full" />
</CanvasObject>
<CanvasObject x={$zoomed_origin_x} y={$zoomed_origin_y} z={1000}>
  <div class="w-4 h-4 bg-purple-300 rounded-full" />
</CanvasObject>
<CanvasObject x={$zoom_offset_x} y={$zoom_offset_y} z={1000}>
  <div class="w-4 h-4 bg-purple-700 rounded-full" />
</CanvasObject>
<CanvasObject x={$camera_x1} y={$camera_y1} z={1000}>
  <div class="w-4 h-4 bg-purple-700 rounded-full" />
</CanvasObject>
<CanvasObject x={$camera_x2 - 16} y={$camera_y2 - 16} z={1000}>
  <div class="w-4 h-4 bg-purple-700 rounded-full" />
</CanvasObject>
