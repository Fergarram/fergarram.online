<script>
    import { createEventDispatcher } from "svelte";
    // import SearchIcon from './svgs/Search.svelte';
    import Modal from "./Modal.svelte";
    import Fuse from "fuse.js";

    export let showSearchDialog, flatFileList;

    const dispatch = createEventDispatcher();
    const fuse = new Fuse(flatFileList, {
        includeScore: true,
        includeMatches: true,
        keys: ["name", "path"],
    });

    let resultsEl = null;
    let searchInputEl = null;
    let searchQuery = "";
    let searchFocused = false;
    let results = [];
    let selectedResultItem = "";

    const handleModalOpen = () => {
        dispatch("modal-open");
        if (searchInputEl) searchInputEl.focus();
    };

    const handleModalClose = () => {
        showSearchDialog = false;
        searchQuery = "";
        dispatch("modal-close");
    };

    const handleInputKeydown = (e) => {
        if (e.key === "Enter") {
            location.href = `${location.origin}/${selectedResultItem}`;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (results.length > 0) {
                // Focus on the element below the currently selected item
                const el = document.getElementById(
                    `result-${selectedResultItem}`
                );
                const nextEl = el.nextElementSibling;
                if (nextEl) {
                    const url = nextEl.firstElementChild.dataset.url;
                    if (url) selectedResultItem = url;
                    const topSpacing = 12; // @TODO: get from resultsEl mtop and ptop
                    const pos =
                        nextEl.offsetTop +
                        nextEl.offsetHeight -
                        topSpacing -
                        resultsEl.scrollTop;
                    if (pos > resultsEl.offsetHeight) {
                        const diff = pos - resultsEl.offsetHeight;
                        resultsEl.scroll(0, resultsEl.scrollTop + diff + 15); // @TODO: Figure out why "15"
                    }
                }
            }
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (results.length > 0) {
                // Focus on the element above the currently selected item
                const el = document.getElementById(
                    `result-${selectedResultItem}`
                );
                const previousEl = el.previousElementSibling;
                if (previousEl) {
                    const url = previousEl.firstElementChild.dataset.url;
                    if (url) selectedResultItem = url;
                    const topSpacing = 12; // @TODO: get from resultsEl mtop and ptop
                    const pos =
                        previousEl.offsetTop - topSpacing - resultsEl.scrollTop;
                    if (pos < 0) {
                        const diff = 0 - pos;
                        resultsEl.scroll(0, resultsEl.scrollTop - (diff - 5)); // @TODO: Figure out why "5"
                    }
                }
            }
        }
    };

    $: {
        results = fuse.search(searchQuery);
        if (results.length > 0) selectedResultItem = results[0].item.url;
    }
</script>

<Modal
    id="file-search"
    ariaLabel="Search documents"
    autoPlaceModal={false}
    wrapperClasses="p-4 focus:outline-none"
    modalClasses="max-w-40em mx-auto dark:bg-neutral-800 bg-neutral-200 rounded-8 top-2 md:top-1/4"
    on:modal-close={handleModalClose}
    on:modal-open={handleModalOpen}
>
    <div class="flex items-center gap-2 max-w-full w-full">
        <!-- <SearchIcon /> -->
        <label for="file-search-input" class="block relative max-w-full w-full">
            <span
                class="absolute pointer-events-none opacity-60"
                class:hidden={searchQuery}
            >
                Search files in vault...
            </span>
            <input
                type="text"
                id="file-search-input"
                bind:this={searchInputEl}
                bind:value={searchQuery}
                class="bg-transparent focus:outline-none max-w-full w-full"
                on:keydown={handleInputKeydown}
                on:focus={() => (searchFocused = true)}
                on:blur={() => (searchFocused = false)}
            />
        </label>
    </div>
    {#if results.length > 0}
        <ul
            bind:this={resultsEl}
            aria-label="search results"
            class="relative max-h-[calc(100vh_-_7.5rem)] md:max-h-[40vh] overflow-auto h-fit mt-3 pt-3 border-t border-neutral-300 dark:border-neutral-600 w-full"
        >
            {#each results as result}
                <li class="text-16 w-full" id="result-{result.item.url}">
                    <a
                        data-url={result.item.url}
                        href="/{result.item.url}"
                        on:mouseover={() =>
                            (selectedResultItem = result.item.url)}
                        on:focus={() => (selectedResultItem = result.item.url)}
                        class="grid gap-1 w-full rounded-8 p-2 {selectedResultItem ===
                        result.item.url
                            ? 'dark:bg-neutral-700/50 bg-neutral-100'
                            : ''}"
                    >
                        {result.item.name}
                        <p class="text-12 opacity-60">
                            {result.item.path}
                        </p>
                    </a>
                </li>
            {/each}
        </ul>
    {/if}
</Modal>
