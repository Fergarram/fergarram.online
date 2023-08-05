<script>
	let commentsShown = false;
	const showComments = () => {
		const els = document.querySelectorAll('.md-comment');
		if (els && els.length > 0) {
			els.forEach(el => {
				el.style.display = commentsShown ? 'none' : 'block';
			});
			commentsShown = !commentsShown;
		}
	};
</script>

<section
	class="bg-neutral-100 text-14 font-sans dark:bg-neutral-700/40 px-3 py-2 rounded-4 w-full sm:flex gap-6 items-center justify-between">
	<p class="not-content mb-2 sm:mb-0">
		{commentsShown ? 'This document is currently showing hidden notes' : 'This document has hidden notes'}
	</p>
	<button
		on:click={showComments}
		class="text-blue-700 dark:text-blue-300 hover:underline">
		{commentsShown ? 'Hide Notes' : 'Show Notes'}
	</button>
</section>