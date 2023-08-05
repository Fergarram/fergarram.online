<script>
  //   import CanvasObject from "../oceloti/core/canvas/CanvasObject.svelte";
  import CanvasRenderer from "../oceloti/core/canvas/CanvasRenderer.svelte";
  import Todo from "../oceloti/core/common/Todo.svelte";

  export let data, permalink;
  let wallpaper = { url: "/wallpapers/corcho.jpg", width: 1024 };
</script>

<CanvasRenderer {wallpaper}>
  <Todo />
</CanvasRenderer>
