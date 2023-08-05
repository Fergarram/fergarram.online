<script>
	export let tocTree, backLinks;
	export let classes = '';
	const topHeadings = tocTree && tocTree.length === 1 && tocTree[0].depth === 1 ? tocTree[0].children : tocTree;
</script>

<div class="md:pl-8 xl:pl-10 {classes}">
	{#if (topHeadings && topHeadings.length > 0) || (backLinks && backLinks.length > 0)}
		<div class="py-1 pl-4 border-l border-neutral-200 dark:border-neutral-700 lg:w-56 top-24 lg:top-10 md:sticky">
			{#if topHeadings && topHeadings.length > 0}
				<h2 class="mb-3 font-medium tracking-subtitle">
					Table of Contents
				</h2>
				<ul class="grid gap-3">
					{#each topHeadings as item}
						<li class="leading-115">
							<a href="#{item.id}" class="hover:underline text-14 text-blue-700 dark:text-blue-300">
								{item.text}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
			<!-- @TODO: Implement backlinks here -->
			<!-- <h2 class="mb-3 mt-6 font-medium">
				Backlinks
			</h2>
			<ul class="grid gap-3">
				<li class="leading-115">
					<a href="#" class="hover:underline text-14 text-blue-700 dark:text-blue-300">
						Testing something
					</a>
				</li>
				<li class="leading-115">
					<a href="#" class="hover:underline text-14 text-blue-700 dark:text-blue-300">
						Testing something
					</a>
				</li>
				<li class="leading-115">
					<a href="#" class="hover:underline text-14 text-blue-700 dark:text-blue-300">
						Testing something
					</a>
				</li>
				<li class="leading-115">
					<a href="#" class="hover:underline text-14 text-blue-700 dark:text-blue-300">
						Testing something
					</a>
				</li>
			</ul> -->
		</div>
	{/if}
</div>