<script>
	export let templateHtml;
</script>

<svelte:head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1.0">
	<meta name="theme-color" content="#262626">
	<meta name="robots" content="noarchive">
	
	<meta property="og:type" content="website">
	<!-- <meta name="twitter:card" content="summary_large_image"> -->
	<!-- <meta property="og:image" content="absolute link"> -->
	<!-- <meta property="og:image:width" content="1200"> -->
	<!-- <meta property="og:image:height" content="630"> -->

	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="stylesheet" type="text/css" href="/styles.css">
	<!-- @IMPROVE: Use a more performant solution for fonts. -->
	<!-- <link rel="preconnect" href="https://fonts.googleapis.com"> -->
	<!-- <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> -->
	<!-- <link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;500;600;700&display=swap" rel="stylesheet"> -->
</svelte:head>

{@html templateHtml}