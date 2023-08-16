<script>
  //   import { onMount } from "svelte";
  //   import CanvasObject from "../oceloti/core/canvas/CanvasObject.svelte";
  import CanvasRenderer from "../oceloti/core/canvas/CanvasRenderer.svelte";
  import Paper from "../oceloti/core/common/Paper.svelte";
  import Text from "../oceloti/core/common/Text.svelte";
  import Todo from "../oceloti/core/common/Todo.svelte";

  export let data, permalink;
  let wallpaper = {
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/14400761/original_af9888e4f220975392bb0dc8a441e38f.jpg?1639842153?bc=0",
    url: "https://d2w9rnfcy7mm78.cloudfront.net/12922690/original_984bf65b44e5fdea0e8d38891595266b.jpg",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/2880285/original_d1459f5c36e8d1a6f3953b9e9f4abf30.gif?1539698587?bc=1",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/22921013/original_3fb648095b7accf353940dadb8b5f2ef.jpg?1690922768?bc=0",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/12081292/original_b10faaf9c1561f086fc14844c9424eee.jpg?1622062452?bc=0",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/12093897/original_b63de94728071090bcb2e54f0f588d5f.png?1622146473?bc=0",
    // url: "/wallpapers/corcho.jpg",
    width: 800,
  };
</script>

<CanvasRenderer {wallpaper} max_zoom={200}>
  <Todo />
  <Paper />
</CanvasRenderer>

<Text fontClasses="fixed bottom-2 right-2 text-white text-12">{permalink}</Text>
