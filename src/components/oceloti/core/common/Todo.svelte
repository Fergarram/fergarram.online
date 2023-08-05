<script>
  import { onMount } from "svelte";
  import CanvasObject from "../canvas/CanvasObject.svelte";
  import Text from "./Text.svelte";
  import Icon from "./Icon.svelte";

  let initial_todo_setup = false;
  let todo_input = "";
  let todo = [];

  onMount(() => {
    if (!initial_todo_setup) {
      const local_todo = localStorage.getItem("todo");
      if (local_todo !== null) {
        todo = JSON.parse(local_todo);
        initial_todo_setup = true;
      } else {
        localStorage.setItem("todo", JSON.stringify(todo));
        initial_todo_setup = true;
      }
    }
  });

  $: if (initial_todo_setup) {
    localStorage.setItem("todo", JSON.stringify(todo));
  }

  function delete_todo_item(text) {
    const i = todo.findIndex((t) => t.text === text);
    if (i !== -1) todo.splice(i, 1);
    todo = todo;
  }

  function handle_todo_input(e) {
    if (e.key === "Enter") {
      todo.push({
        checked: false,
        text: todo_input,
      });
      todo = todo;
      todo_input = "";
    }
  }
</script>

<CanvasObject x={0} y={0}>
  <div class="flex flex-col gap-1 max-w-72 bg-amber-200 p-5">
    <Text fontClasses="text-16 font-semibold" classes="mb-2">Focus Pocus</Text>
    {#each todo as item}
      <span class="flex items-center gap-2 {item.checked ? '' : 'opacity-20'}">
        <input class="" type="checkbox" bind:checked={item.checked} />
        <Text classes="block leading-125">{item.text}</Text>
        <button
          on:click={() => delete_todo_item(item.text)}
          class="ml-auto rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/20"
        >
          <Icon name="close" size="text-20" />
        </button>
      </span>
    {/each}
    <input
      placeholder="New todo"
      class="bg-black/10 rounded-4 p-1 pl-2 mt-2 text-14 placeholder:text-black/20"
      type="text"
      bind:value={todo_input}
      on:keydown={handle_todo_input}
    />
  </div>
</CanvasObject>
