<script>
    import { onMount } from "svelte";
    import { CanvasRenderer, CanvasObject } from "./oceloti/core/canvas/";
    import { Card, ScrollView, Text } from "./oceloti/core/common";

    import TableOfContents from "./TableOfContents.svelte";
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    import Sidebar from "./Sidebar.svelte";
    import CommentsControl from "./CommentsControl.svelte";
    import SearchModal from "./SearchModal.svelte";

    export let data, shortcuts, permalink;

    let wallpaper = { url: "/wallpapers/corcho.jpg", width: 1024 };

    const {
        homeUrl,
        frontmatter,
        breadcrumbs,
        tocTree,
        logo,
        routeFileTree,
        flatFileList,
    } = data;

    const contentHasH1 =
        tocTree && tocTree.length > 0 && tocTree.find((i) => i.depth === 1);

    let showMobileMenu = false;
    let showSearchDialog = false;
    let keysPressed = [];
    let lastPos = 0;
    let mounted = false;

    const lock = (mobileOnly = false) => {
        if (document.body.style.position === "fixed") return;

        lastPos = window.scrollY;
        let bodyWidth = document.body.getClientRects()[0].width;
        let widthDiff = window.innerWidth - bodyWidth;

        document.body.style.position = "fixed";
        document.body.style.overflow = "hidden";
        document.body.style.top = `-${lastPos}px`;
        if (mobileOnly) document.body.classList.add("mobile-only-scroll-lock");

        if (widthDiff !== 0) {
            document.body.style.width = `${bodyWidth}px`;
            document.body.classList.add("scroll-lock");
        } else {
            document.body.style.width = "100%";
        }
    };

    const unlock = (mobileOnly = false) => {
        document.body.classList.remove("scroll-lock");
        if (mobileOnly)
            document.body.classList.remove("mobile-only-scroll-lock");
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("width");
        document.body.style.removeProperty("top");
        window.scroll(0, lastPos);
    };

    const onKeyup = (e) => {
        keysPressed = [];
    };

    const onKeydown = (e) => {
        keysPressed[e.key] = true;

        if (keysPressed["Escape"]) {
            e.preventDefault();
            showMobileMenu = false;
        }

        if (
            (keysPressed["Meta"] && keysPressed["o"]) ||
            (keysPressed["Control"] && keysPressed["o"]) ||
            (keysPressed["Meta"] && keysPressed["k"]) ||
            (keysPressed["Control"] && keysPressed["k"])
        ) {
            e.preventDefault();
            if (showMobileMenu) return;
            showSearchDialog = true;
        }
    };

    onMount(() => {
        mounted = true;
        document.addEventListener("keyup", onKeyup);
        document.addEventListener("keydown", onKeydown);
    });

    $: if (mounted) {
        if (showMobileMenu) lock(true);
        else if (!showMobileMenu) unlock(true);
    }
</script>

<svelte:head>
    <meta property="og:site_name" content={data.siteTitle} />
    <meta property="og:locale" content={data.locale} />

    {#if frontmatter}
        <title>{frontmatter.title}</title>
        <meta property="og:title" content={frontmatter.title} />
        <meta property="twitter:title" content={frontmatter.title} />

        <meta name="author" content={frontmatter.author} />

        <meta name="description" content={frontmatter.description} />
        <meta property="og:description" content={frontmatter.description} />
        <meta name="twitter:description" content={frontmatter.description} />
    {/if}

    <link rel="canonical" href={permalink} />
    <meta property="og:url" content={data.permalink} />
</svelte:head>

<CanvasRenderer
    classes="rounded-8 fixed w-full h-full"
    {wallpaper}
    snap_to_grid={false}
>
    {#each flatFileList as file}
        <CanvasObject x={300} y={300}>
            <Card
                is_draggable={true}
                classes="bg-yellow-200 p-5 rounded-8 flex flex-col"
            >
                <Text classes="font-mono text-14 font-medium text-slate-800">
                    Name: {file.name}
                </Text>
                <Text classes="font-mono text-14 font-medium text-slate-800">
                    Name: {file.name}
                </Text>
                <Text classes="font-mono text-14 font-medium text-slate-800">
                    Directory: {file.path}
                </Text>
                <Text classes="font-mono text-14 font-medium text-slate-800">
                    Url: /{file.url}
                </Text>
            </Card>
        </CanvasObject>
    {/each}
</CanvasRenderer>

{#if 0}
    <div
        id="obscure"
        class="dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 min-h-screen"
    >
        <div class="p-4 pt-0 sm:p-8 sm:pt-4 md:p-10 md:pt-6">
            <!-- @TODO: Add "skip to content" button -->

            <!-- Header -->
            <Header
                {homeUrl}
                {shortcuts}
                bind:showMobileMenu
                bind:showSearchDialog
            />

            <div class="lg:grid lg:grid-cols-auto-1fr">
                <!-- Sidebar -->
                <Sidebar
                    fileTree={routeFileTree}
                    {shortcuts}
                    bind:showMobileMenu
                    bind:showSearchDialog
                />

                <!-- Main -->
                <main
                    id="main-content"
                    class="py-4 pt-8 lg:py-6 lg:px-10 w-full max-w-[60em] mx-auto"
                >
                    <!-- Breadcrumbs -->
                    {#if breadcrumbs && breadcrumbs.length > 0}
                        <ul
                            class="overflow-auto hide-scrollbars flex gap-2 text-14 mb-6 lg:mb-8"
                        >
                            <li
                                class="opacity-80 dark:opacity-60 hover:opacity-100"
                            >
                                <a href={homeUrl}>
                                    <!-- <HomeIcon size={20} /> -->
                                </a>
                            </li>
                            {#each breadcrumbs as item}
                                <li
                                    class="flex items-center gap-2 opacity-80 dark:opacity-60 hover:opacity-100"
                                >
                                    <!-- <ArrowRightIcon size={16} classes="mt-px" /> -->
                                    <a
                                        href={item.url}
                                        class="whitespace-nowrap"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    {/if}

                    <!-- Article -->
                    <article class="grid md:grid-cols-1fr-auto">
                        {#if frontmatter && frontmatter.title && !contentHasH1}
                            <h1
                                class="article-content__h1 mb-6 md:col-start-1 md:col-end-3"
                            >
                                {frontmatter.title}
                            </h1>
                        {/if}

                        <!-- ToC -->
                        <TableOfContents
                            {tocTree}
                            backLinks={[]}
                            classes="md:col-start-2 md:col-end-3 md:row-start-2 mb-2 md:mb-0 md:mt-6"
                        />

                        <!-- Content -->
                        <div
                            class="article-content md:col-start-1 md:col-end-2 md:row-start-2 pb-10"
                        >
                            {#if data.html}
                                {#if data.html.includes("md-comment")}
                                    <CommentsControl />
                                {/if}
                                {@html data.html}
                            {:else}
                                <div
                                    class="w-full bg-neutral-100 dark:bg-neutral-700/20 p-4 rounded-4 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center"
                                >
                                    This file is not populated yet.
                                </div>
                            {/if}
                        </div>
                    </article>

                    <!-- Search Dialog -->
                    {#if showSearchDialog}
                        <SearchModal
                            {flatFileList}
                            bind:showSearchDialog
                            on:modal-open={() => lock()}
                            on:modal-close={() => unlock()}
                        />
                    {/if}
                </main>
            </div>

            <!-- Footer -->
            <Footer />
        </div>
    </div>
{/if}
