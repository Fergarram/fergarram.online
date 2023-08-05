<script>
    import { Icon, Text } from "../../core/common";
    let folder_hover_icon = "folder";
    let show_file_menu = false;

    $: folder_hover_icon = show_file_menu ? "folder_open" : "folder";

    const files = [
        {
            rel: "route/to/the/filename.png",
            filename: "filename.png",
            name: "filename",
        },
        {
            rel: "route/to/the/filename.png",
            filename: "filename.png",
            name: "filename",
        },
        {
            rel: "route/to/the/filename.png",
            filename: "filename.png",
            name: "filename",
        },
        {
            rel: "route/to/the/filename.png",
            filename: "filename.png",
            name: "filename",
        },
        {
            rel: "route/to/the/filename.png",
            filename: "filename.png",
            name: "filename",
        },
        {
            rel: "route/to/the/filename.png",
            filename: "filename.png",
            name: "filename",
        },
    ];
</script>

<div class="fixed top-6 left-6 flex flex-col gap-2 transition w-fit h-fit">
    <button
        class="shadow-xl w-12 h-12 rounded-8 flex items-center justify-center relative bg-neutral-900 border-neutral-800 {show_file_menu
            ? 'opacity-100'
            : 'opacity-50 hover:opacity-100'}"
        on:click={() => (show_file_menu = !show_file_menu)}
    >
        <Icon name={folder_hover_icon} />
    </button>
    {#if show_file_menu}
        <div class="shadow-xl bg-neutral-900 rounded-8 w-72 p-3">
            <Text>Parent Folder 1</Text>
            <ul class="flex flex-col gap-2 p-3">
                {#each files as file}
                    <li>
                        <Text>{file.rel}</Text>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
