<script>
    import { ScrollView, Icon } from "../../core/common";
    import { canvas_logs } from "../../../../stores/canvas";
    let show_canvas_logs = false;
</script>

<div
    class="fixed bottom-6 right-6 flex items-center gap-1 transition w-fit h-fit opacity-75 hover:opacity-100"
>
    <button
        class="border-2 opacity-75 hover:opacity-100 shadow-xl w-12 h-12 rounded-8 flex items-center justify-center relative bg-neutral-900 border-neutral-800"
    >
        <Icon name="search" />
    </button>
    <button
        class="border-2 opacity-75 hover:opacity-100 shadow-xl w-12 h-12 rounded-8 flex items-center justify-center relative bg-neutral-900 border-neutral-800"
    >
        <Icon name="chat" />
    </button>
    <button
        class="border-2 opacity-75 hover:opacity-100 shadow-xl w-12 h-12 rounded-8 flex items-center justify-center relative bg-neutral-900 border-neutral-800"
    >
        <Icon name="robot" />
    </button>
    <button
        class="border-2 opacity-75 hover:opacity-100 shadow-xl w-12 h-12 rounded-8 flex items-center justify-center relative bg-neutral-900 border-neutral-800"
    >
        <Icon name="terminal" />
    </button>
    <button
        on:click={() => (show_canvas_logs = !show_canvas_logs)}
        class="border-2 opacity-75 hover:opacity-100 shadow-xl w-12 h-12 rounded-8 flex items-center justify-center relative {show_canvas_logs
            ? 'bg-stone-700 border-stone-400 opacity-100'
            : 'bg-neutral-900 border-neutral-800'}"
    >
        <Icon name="problem" />
        {#if !show_canvas_logs}
            <div
                class="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-stone-200 w-1.5 h-1.5"
            />
        {/if}
    </button>
    {#if $canvas_logs && $canvas_logs.length > 0}
        {#if show_canvas_logs}
            <ScrollView
                classes="opacity-75 hover:opacity-100 absolute bg-neutral-900 border-2 border-neutral-800 w-96 max-h-32 rounded-8 right-0 top-0 -mt-2 -translate-y-full p-3 flex flex-col-reverse"
            >
                <div>
                    {#each $canvas_logs as log}
                        <pre
                            class="font-mono text-12 text-neutral-300 text-right">{log}</pre>
                    {/each}
                </div>
            </ScrollView>
        {:else}
            <ScrollView
                styles="-webkit-mask-image: -webkit-gradient(linear, left 50%, left top, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))"
                classes="absolute border-neutral-800 max-w-96 max-h-16 rounded-8 right-0 top-0 -mt-2 -translate-y-full pr-1 flex flex-col-reverse"
            >
                <div>
                    {#each $canvas_logs.slice(-3) as log}
                        <pre
                            class="font-mono text-12 text-neutral-300 text-right">{log}</pre>
                    {/each}
                </div>
            </ScrollView>
        {/if}
    {/if}
</div>
