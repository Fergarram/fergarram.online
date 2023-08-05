<script>
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	export let id;
	export let wrapperClasses = 'p-4';
	export let modalClasses = 'max-w-40em mx-auto dark:bg-neutral-800 bg-neutral-200 rounded-8';
	export let baseClasses = 'overflow-auto p-5';
	export let backdropClasses = 'backdrop-blur-sm bg-black/60';
	export let autoPlaceModal = true;
	export let ariaLabel = null;

	let modalEl, contentEl;
	let modalFitsScreen = false;
	let keysPressed = [];
	let currentFocusedEl = null;
	let firstEl = null;
	let lastEl = null;
	let lastPos = 0;

	const dispatch = createEventDispatcher();

	const lock = () => {
		if (document.body.style.position === 'fixed') return;

		lastPos = window.scrollY;
		let bodyWidth = document.body.getClientRects()[0].width;
		let widthDiff = window.innerWidth - bodyWidth;

		document.body.style.position = 'fixed';
		document.body.style.overflow = 'hidden';
		document.body.style.top = `-${lastPos}px`;

		if (widthDiff !== 0) {
			document.body.style.width = `${bodyWidth}px`;
			document.body.classList.add('scroll-lock');
		} else {
			document.body.style.width = '100%';
		}
	};

	const unlock = () => {
		document.body.classList.remove('scroll-lock');
		document.body.style.removeProperty('position');
		document.body.style.removeProperty('overflow');
		document.body.style.removeProperty('width');
		document.body.style.removeProperty('top');
		window.scroll(0, lastPos);
	};

	const closeModal = () => {
		keysPressed = [];
		document.removeEventListener('keydown', onKeydown);
		document.removeEventListener('keyup', onKeyup);

		dispatch('modal-close');
	};

	const onKeyup = e => {
		keysPressed[e.key] = false;
	};

	const onKeydown = e => {
		keysPressed[e.key] = true;

		if (keysPressed['Escape']) {
			closeModal();
		}

		if (currentFocusedEl && currentFocusedEl.dataset.lastFocusable) {
			if (keysPressed['Tab'] && !keysPressed['Shift']) {
				e.preventDefault();
				firstEl.focus();
			}
		}

		if (currentFocusedEl && currentFocusedEl.dataset.firstFocusable) {
			if (keysPressed['Tab'] && keysPressed['Shift']) {
				e.preventDefault();
				lastEl.focus();
			}
		}
	};

	onMount(() => {
		const rect = modalEl.getBoundingClientRect();
		modalFitsScreen = (rect && rect.height <= window.innerHeight * 0.9);
		modalEl.style.opacity = '1';

		contentEl.focus();
		const focusableElements = [...modalEl.querySelectorAll(
			'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
		)].filter(el => !el.hasAttribute('disabled'));

		firstEl = focusableElements[0];
		lastEl = focusableElements[ focusableElements.length - 1 ];
		firstEl.setAttribute( 'data-first-focusable', true );
		lastEl.setAttribute( 'data-last-focusable', true );

		const setCurrentFocuesEl = (e) => currentFocusedEl = e.currentTarget;

		firstEl.addEventListener('focus', setCurrentFocuesEl);
		lastEl.addEventListener('focus', setCurrentFocuesEl);

		document.addEventListener('keyup', onKeyup);
		document.addEventListener('keydown', onKeydown);

		dispatch('modal-open');
	});
</script>

<div class="fixed z-modal top-0 left-0 w-full h-full {baseClasses}">
	<div
		aria-hidden="true"
		on:click={closeModal}
		class="absolute top-0 left-0 w-full h-full {backdropClasses}">
	</div>
	<div
		{id}
		bind:this={modalEl}
		class="opacity-0 relative {modalClasses} {modalFitsScreen && autoPlaceModal ? 'top-1/2 -translate-y-1/2' : ''}"
		role="dialog"
		aria-modal="true"
		aria-label={ariaLabel}>
		<div tabindex="0" bind:this={contentEl} class={wrapperClasses}>
			<slot />
		</div>
	</div>
</div>
