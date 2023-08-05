<script>
    import { onMount } from "svelte";
    import { Icon, Text } from "../../core/common";
    import { current_tool } from "../../../../stores/workspace";

    let toolbar_items = [
        {
            index: 1,
            key_name: 1,
            icon: "pan_tool",
        },
        {
            index: 2,
            key_name: 2,
            icon: "arrow_selector_tool",
        },
        {
            index: 3,
            key_name: 3,
            icon: "draw",
        },
        {
            index: 4,
            key_name: 4,
            icon: "swap_calls", // mediation, account_tree, outbound
        },
        {
            index: 5,
            key_name: 5,
            icon: "sell",
        },
        {
            index: 6,
            key_name: 6,
            icon: "cut", // insert_page_break
        },
        {
            index: 7,
            key_name: 7,
            icon: "attach_file", // camera_roll, history
        },
        {
            index: 8,
            key_name: 8,
            icon: "sticky_note_2", // add_notes
        },
        {
            index: 9,
            key_name: 9,
            icon: "file_copy", // "quick_reference_all",
        },
        {
            index: 10,
            key_name: 0,
            icon: "flag", // rtt, clarify, edit_note
        },
    ];

    onMount(() => {
        window.addEventListener("keydown", (e) => {
            if (!isNaN(e.key)) {
                $current_tool = parseInt(e.key);
            }
        });
    });
</script>

<div
    class="fixed bottom-6 left-6 flex flex-row gap-1 transition w-fit h-fit opacity-75 hover:opacity-100"
>
    {#each toolbar_items as item}
        <button
            class="flex justify-center border-2 shadow-xl w-12 h-12 rounded-8 relative hover:opacity-100 {item.key_name ===
            $current_tool
                ? 'bg-stone-700 border-stone-400 opacity-100'
                : 'bg-neutral-900 border-neutral-800 opacity-50'}"
            on:click={() => ($current_tool = item.key_name)}
        >
            <Icon name={item.icon} classes="text-stone-400 mt-2" />
            <Text
                classes="text-white/20 font-mono text-12 bottom-0 right-1 absolute"
                >{item.key_name}</Text
            >
        </button>
    {/each}
</div>
