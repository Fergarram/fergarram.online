<script>
    import { Icon, Text } from "../../core/common";
</script>

<div class="fixed top-6 left-1/2 -translate-x-1/2 h-12 flex items-center">
    <div
        class="flex items-center gap-4 bg-neutral-900/50 hover:bg-neutral-900 rounded-8 px-0.5 transition"
    >
        <button
            class="flex items-center p-2 text-stone-200 border-r border-neutral-700/70 opacity-50 hover:opacity-100"
            ><Icon name="menu_book" classes="" /></button
        >
        <Text classes="text-neutral-300 text-12 font-mono flex items-center">
            <button class="opacity-50 hover:opacity-100 hover:underline"
                >Home</button
            >
            <Icon classes="opacity-50" name="arrow_right" />
            <button class="opacity-50 hover:opacity-100 hover:underline"
                >Onboarding</button
            >
            <Icon classes="opacity-50" name="arrow_right" />
            <button class="opacity-50 hover:opacity-100 hover:underline"
                >Setup local environment</button
            >
        </Text>
        <button
            class="flex items-center p-2 text-stone-200 border-l border-neutral-700/70 opacity-50 hover:opacity-100"
            ><Icon name="list" classes="" /></button
        >
    </div>
</div>
