<script>
  import { onMount } from "svelte";
  import CanvasObject from "../canvas/CanvasObject.svelte";
  import { make_id } from "../../../../utils";

  let initial_papers_setup = false;
  let current_unformatted_text = "";
  let papers = [
    {
      id: make_id(),
      x: 0,
      y: 0,
      content: "Edit this motherfucker",
    },
  ];
  const local_storage_key = "papers";

  onMount(() => {
    if (!initial_papers_setup) {
      const local_papers = localStorage.getItem(local_storage_key);
      if (local_papers !== null) {
        papers = JSON.parse(local_papers);
        initial_papers_setup = true;
      } else {
        localStorage.setItem(local_storage_key, JSON.stringify(papers));
        initial_papers_setup = true;
      }
    }
  });

  $: if (initial_papers_setup) {
    localStorage.setItem(local_storage_key, JSON.stringify(papers)); // Reactivity comes from using _papers_ as arg.
  }

  function delete_paper(id) {
    const i = papers.findIndex((t) => t.id === id);
    if (i !== -1) papers.splice(i, 1);
    papers = papers;
  }

  function create_new_paper(x, y) {
    papers.push({
      id: make_id(),
      x: x,
      y: y,
      content: "Edit me daddy",
    });
    papers = papers;
  }

  function handle_keydown(e, id) {
    const paper = papers.find((t) => t.id === id);
    const el = document.getElementById(`paper-element-${paper.id}`);

    if (e.metaKey && e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      let x = 0;
      let y = 0;
      if (paper) {
        x = paper.x + 100;
        y = paper.y + 100;
      }
      create_new_paper(x, y);
    }

    if (
      paper &&
      el &&
      el.innerText === "" &&
      e.metaKey &&
      e.key === "Backspace"
    ) {
      e.preventDefault();
      e.stopPropagation();
      delete_paper(paper.id);
    }
  }
</script>

{#each papers as paper}
  <CanvasObject bind:x={paper.x} bind:y={paper.y} show_shadow={true}>
    <div
      id={paper.id}
      class="flex flex-col gap-1 w-96 min-h-96 bg-gray-200 p-5 bg-blend-lighten bg-cover"
      style="background-image: url(/textures/grain.jpg);"
      data-draggable
    >
      <div
        id="paper-element-{paper.id}"
        class="focus:outline-none font-mono tracking-mono leading-135"
        style="filter: blur(0.2px) opacity(0.8);"
        spellcheck="false"
        contenteditable="plaintext-only"
        on:keydown={(e) => handle_keydown(e, paper.id)}
        bind:innerHTML={paper.content}
      />
    </div>
  </CanvasObject>
{/each}
