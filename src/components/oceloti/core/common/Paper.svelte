<script>
  import { onMount, tick } from "svelte";
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

  function create_new_paper(x, y, content = "Edit me daddy") {
    const id = make_id();
    papers.push({
      id,
      x,
      y,
      content,
    });
    papers = papers;
    return id;
  }

  function split_paper(el, paper) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const pre_caret_range = range.cloneRange();
    pre_caret_range.selectNodeContents(el);
    pre_caret_range.setEnd(range.endContainer, range.endOffset);

    const character_index = pre_caret_range.toString().length;

    const currentNode = range.startContainer;
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const lines = currentNode.parentNode.innerText.split("\n");

      let current_char_count = 0;
      let line_with_char_index = -1;
      for (let i = 0; i < lines.length; i++) {
        current_char_count += lines[i].length + 1; // +1 for the newline character

        if (character_index < current_char_count) {
          line_with_char_index = i;
          break;
        }
      }

      if (line_with_char_index === -1) {
        throw new Error("Character index out of bounds.");
      }

      const first_slice = lines.slice(0, line_with_char_index).join("\n");
      const second_slice = lines.slice(line_with_char_index + 1).join("\n");

      const initial_x = paper.x;
      const initial_y = paper.y;

      delete_paper(paper.id);

      const first_id = create_new_paper(initial_x, initial_y, first_slice);

      tick().then(() => {
        const first_el = document.getElementById(`paper-element-${first_id}`);

        const start = initial_x - 32;
        const random_offset = Math.random() * 64;
        const new_x = start + random_offset;
        const new_y = initial_y + first_el.getClientRects()[0].height + 12;

        create_new_paper(new_x, new_y, second_slice);
      });
    } else {
      console.log(currentNode); // For non-text nodes
    }
  }

  function handle_keydown(e, id) {
    const paper = papers.find((t) => t.id === id);
    const el = document.getElementById(`paper-element-${paper.id}`);

    // Handle create command
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

    // Handle delete command
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

    // Handle split line command
    if (paper && el && e.metaKey && e.key === "\\") {
      e.preventDefault();
      e.stopPropagation();
      split_paper(el, paper);
    }
    console.log(e.shiftKey, e.metaKey, e.key);
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
        spellcheck="false"
        contenteditable="plaintext-only"
        on:keydown={(e) => handle_keydown(e, paper.id)}
        bind:innerHTML={paper.content}
      />
    </div>
  </CanvasObject>
{/each}
