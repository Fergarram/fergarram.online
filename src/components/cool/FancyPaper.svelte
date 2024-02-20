<script>
  import { onMount, tick } from "svelte";
  import CanvasObject from "../oceloti/core/canvas/CanvasObject.svelte";
  import { sound_player, make_id, set_caret_position } from "../../utils";

  const local_storage_key = "fancy_papers";

  const og_paper = {
    id: make_id(),
    x: 0,
    y: 0,
    content: "Edit me, madam",
    can_focus: false,
    is_focused: false,
  };

  let initial_papers_setup = false;
  let papers = [ og_paper ];

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
      can_focus: false,
      is_focused: true,
    });
    unfocus_all_papers(null, id);
    tick().then(() => {
      const el = document.getElementById(`paper-element-${id}`);
      el.focus();
      set_caret_position(el, -1);
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
      sound_player.play("new-paper");
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
      sound_player.play("poof");
    }

    // Handle split line command
    if (paper && el && e.metaKey && e.key === "\\") {
      e.preventDefault();
      e.stopPropagation();
      split_paper(el, paper);
      sound_player.play("paper-rip");
    }

    // Remove focus
    if (paper && e.key === "Escape") {
      paper.can_focus = false;
      paper.is_focused = false;
      papers = papers;
    }

    // console.log(e.shiftKey, e.metaKey, e.key);
  }

  function handle_focus_click(e, paper) {
    if (e.metaKey && paper && paper.can_focus) {
      paper.is_focused = true;
      unfocus_all_papers(null, paper.id);
      papers = papers;
    }
  }

  function handle_paper_blur(paper) {
    if (paper) {
      paper.is_focused = false;
      paper.can_focus = false;
      papers = papers;
    }
  }

  function handle_mouse_move(e, paper) {
    if (e.metaKey && paper) {
      paper.can_focus = true;
      papers = papers;
    } else if (paper && !paper.is_focused) {
      paper.can_focus = false;
      papers = papers;
    }
  }

  function handle_mouse_leave(e, paper) {
    if (!paper.is_focused && paper.can_focus) {
      paper.can_focus = false;
      papers = papers;
    }
  }

  function unfocus_all_papers(e, exception_id = null) {
    if (papers) {
      papers.forEach((p) => {
        if (p.id === exception_id) return;
        p.can_focus = false;
        p.is_focused = false;
      });
      papers = papers;
    }
  }

  onMount(() => {
    if (!initial_papers_setup) {
      const local_papers = localStorage.getItem(local_storage_key);
      if (local_papers !== null) {
        papers = JSON.parse(local_papers);
        if (papers.length === 0) {
          papers = [ og_paper ];
        }
        initial_papers_setup = true;
      } else {
        localStorage.setItem(local_storage_key, JSON.stringify(papers));
        initial_papers_setup = true;
      }
    }

    window.addEventListener("canvas-mousedown", unfocus_all_papers);
  });

  $: if (initial_papers_setup) {
    localStorage.setItem(local_storage_key, JSON.stringify(papers));
  }
</script>

{#each papers as paper, pi}
  <CanvasObject
    bind:x={paper.x}
    bind:y={paper.y}
    show_shadow={true}
    can_drag={!paper.can_focus && !paper.is_focused}
  >
    <div
      id={paper.id}
      class="relative flex flex-col gap-1 px-24 py-24 w-196 min-h-196 bg-gray-200 bg-blend-lighten bg-repeat {paper.can_focus |
      paper.is_focused
        ? 'outline outline-4 outline-purple-500'
        : ''}"
      style="background-image: url(/textures/grain.jpg); background-size: 30rem;"
      on:click={(e) => handle_focus_click(e, paper)}
      on:mousemove={(e) => handle_mouse_move(e, paper)}
      on:mouseleave={(e) => handle_mouse_leave(e, paper)}
    >
      <div class="p-5 flex justify-center uppercase">
        <h2 contenteditable="plaintext-only" class="font-serif text-24">FIRST-LETTER PSEUDO ELEMENT</h2>
      </div>
      {#if paper.can_focus || paper.is_focused}
        <div
          id="paper-element-{paper.id}"
          class="block grow w-full h-full focus:outline-none font-serif text-justify tracking-serif text-16 leading-135 p-5 first-letter:text-48 first-letter:mr-3 first-letter:float-left first-letter:leading-100"
          spellcheck="false"
          contenteditable="plaintext-only"
          on:blur={() => handle_paper_blur(paper)}
          on:keydown={(e) => handle_keydown(e, paper.id)}
          bind:innerHTML={paper.content}
        />
      {:else}
        <div
          id="paper-element-{paper.id}"
          class="block grow w-full h-full font-serif text-justify tracking-serif text-16 leading-135 p-5 select-none cursor-grab first-letter:text-48 first-letter:mr-3 first-letter:float-left first-letter:leading-100"
        >
          {@html paper.content.replace(/\n/g, "<br>").trim()}
        </div>
      {/if}
      <span class="select-none absolute bottom-6 right-8 text-italic text-14 font-serif opacity-50 text-right">
        {pi + 1}
      </span>
    </div>
  </CanvasObject>
{/each}
