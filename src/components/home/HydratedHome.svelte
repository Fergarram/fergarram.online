<script>
  import { onMount } from "svelte";
  import CanvasObject from "../oceloti/core/canvas/CanvasObject.svelte";
  import CanvasRenderer from "../oceloti/core/canvas/CanvasRenderer.svelte";
  import Paper from "../oceloti/core/common/Paper.svelte";
  import FancyPaper from "../cool/FancyPaper.svelte";
  import Text from "../oceloti/core/common/Text.svelte";
  import Todo from "../oceloti/core/common/Todo.svelte";
  import { sound_player } from "../../utils";
  import Icon from "../oceloti/core/common/Icon.svelte";

  export let data, permalink;

  let sound_off = true;
  let wallpaper = {
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/14400761/original_af9888e4f220975392bb0dc8a441e38f.jpg?1639842153?bc=0",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/12922690/original_984bf65b44e5fdea0e8d38891595266b.jpg",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/21719417/original_a4dd76628507105bd8925f400fbc1532.png?1683442212?bc=0",

    // url: "https://d2w9rnfcy7mm78.cloudfront.net/813262/original_deb74bfc85f525f552829d4cf9ab5ff5.png?1482811188?bc=1",

    // url: "https://d2w9rnfcy7mm78.cloudfront.net/22921013/original_3fb648095b7accf353940dadb8b5f2ef.jpg?1690922768?bc=0",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/12081292/original_b10faaf9c1561f086fc14844c9424eee.jpg?1622062452?bc=0",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/12093897/original_b63de94728071090bcb2e54f0f588d5f.png?1622146473?bc=0",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/21819570/original_9c78769417fbc76591a83c31923eea3f.gif?1684014592?bc=0",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/23211531/original_df88fe97ba68068f334ad0fe6d9d0076.png?1692305738?bc=0",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/21914731/original_278a80cb0cf3068c656e50fe88a44d26.jpg?1684614299?bc=0",
    url: "/wallpapers/test.jpg",
    // url: "https://d2w9rnfcy7mm78.cloudfront.net/2279588/original_3dea05dd766140033483dd78e04424dd.gif?1528414613?bc=1",
    // width: 500,
    width: 1400,
    // url: "/wallpapers/back.svg",
    // url: "/wallpapers/back.svg",
    // width: 48,
    // color: "#3057E1"
  };

  function enable_sounds() {
    sound_off = !sound_off;
    if (sound_off) {
      sound_player.is_mute = true;
      sound_player.stop();
    } else {
      sound_player.is_mute = false;
      sound_player.play("switch");
    }
  }

  const arena_api_base = "https://api.are.na/v2";
  const user_id = "fernando-garcia"; // Replace with your user ID

  // Fetch collections
  async function fetch_collections() {
    try {
      const response = await fetch(
        `${arena_api_base}/users/${user_id}/channels`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }

      const data = await response.json();
      console.log("Collections:", data);
      return data;
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  }

  // Fetch blocks
  async function fetch_blocks() {
    try {
      const response = await fetch(`${arena_api_base}/users/${user_id}/blocks`);

      if (!response.ok) {
        throw new Error("Failed to fetch blocks");
      }

      const data = await response.json();
      console.log("Blocks:", data);
      return data;
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  }

  onMount(async () => {
    sound_player.initialize();
    sound_off = sound_player.is_mute;
    await sound_player.load_files([
      { name: "switch", file: "/audio/switch.wav" },
      { name: "poof", file: "/audio/poof.wav" },
      { name: "new-paper", file: "/audio/new-paper.wav" },
      { name: "paper-rip", file: "/audio/rip-fast.wav" },
    ]);

    // Usage
    // fetch_collections();
    // fetch_blocks();

    if ("ontouchstart" in document.documentElement) {
      console.log("your device is a touch screen device.");

    } else {
     console.log("your device is NOT a touch device");
    }
  });
</script>

<CanvasRenderer {wallpaper} max_zoom={200}>
  <Todo />
  <Paper />
  <FancyPaper />
  <!-- <CanvasObject>
    <a
      href="http://dev.are.na/oauth/authorize?client_id=fergarram-online&redirect_uri=localhost:1122&response_type=code"
      >Arena Login</a
    >
  </CanvasObject> -->
</CanvasRenderer>

<div class="fixed bottom-2 right-2 flex items-center gap-2">
  <Text fontClasses="text-white text-12">{permalink}</Text>
  <button class="flex" on:click={enable_sounds}>
    <Icon
      name={sound_off ? "volume_off" : "volume_up"}
      classes="text-white"
      size="text-20"
    />
  </button>
</div>
