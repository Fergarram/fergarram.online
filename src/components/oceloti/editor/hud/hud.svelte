<script>
    import Consoles from "./consoles.svelte";
    import FileNavigator from "./file-navigator.svelte";
    import PageNavigation from "./page-navigation.svelte";
    import GlobalControls from "./global-controls.svelte";
    import Toolbar from "./toolbar.svelte";
</script>

<PageNavigation />
<Toolbar />
<GlobalControls />
<FileNavigator />
<Consoles />

<div
    class="fixed top-0 left-0 w-full h-5 flex items-center justify-center"
    style="-webkit-app-region: drag;"
>
    <div class="rounded-full bg-white opacity-30 h-1.5 w-32" />
</div>
