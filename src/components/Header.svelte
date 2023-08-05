<script>
    // import ExternalIcon from './svgs/External.svelte';
    // import MenuIcon from './svgs/Menu.svelte';
    // import SearchIcon from './svgs/Search.svelte';

    export let shortcuts, showMobileMenu, showSearchDialog, homeUrl;
</script>

<header
    class="sticky top-0 lg:static z-header dark:bg-neutral-800 bg-white pt-4 border-b border-neutral-200 dark:border-neutral-700 pb-4 flex items-center justify-between"
>
    <button
        class="lg:hidden"
        on:click={() => (showMobileMenu = !showMobileMenu)}
        aria-label="Toggle sidebar menu"
    >
        <!-- <MenuIcon /> -->
    </button>
    <a
        href={homeUrl}
        class="font-semibold text-20 tracking-title block leading-100"
    >
        Obscurity Wiki
    </a>
    <nav class="hidden lg:flex">
        <ul class="flex items-center gap-8">
            {#each shortcuts as item}
                <li>
                    <a
                        href={item.url}
                        class="flex items-center gap-2 hover:underline"
                        rel={item.ext ? "noopener" : null}
                    >
                        {item.text}
                        {#if item.ext}
                            <!-- <ExternalIcon size={20}/> -->
                        {/if}
                    </a>
                </li>
            {/each}
        </ul>
    </nav>
    <button
        class="lg:hidden"
        on:click={() => (showSearchDialog = !showSearchDialog)}
        aria-label="Search vault files"
    >
        <!-- <SearchIcon /> -->
    </button>
</header>
