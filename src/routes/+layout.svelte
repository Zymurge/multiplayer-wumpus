<script>
	import '../app.css';
</script>

<main>
	<slot />
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
