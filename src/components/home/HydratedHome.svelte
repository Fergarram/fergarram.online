<script>
  //   import { onMount } from "svelte";
  //   import CanvasObject from "../oceloti/core/canvas/CanvasObject.svelte";
  import CanvasRenderer from "../oceloti/core/canvas/CanvasRenderer.svelte";
  import Text from "../oceloti/core/common/Text.svelte";
  import Todo from "../oceloti/core/common/Todo.svelte";

  export let data, permalink;
  let wallpaper = { url: "/wallpapers/corcho.jpg", width: 1024 };
</script>

<CanvasRenderer {wallpaper} max_zoom={100}>
  <Todo />
</CanvasRenderer>

<Text fontClasses="fixed bottom-2 right-2 text-white text-12">{permalink}</Text>
