<script>
	import { setContext } from 'svelte';
	//export let data;
	//console.log('app layout', data);

	import AppMenu from '$app_components/AppMenu.svelte';
</script>

<main class="grid grid-cols-[56px_1fr] w-screen h-screen">
	<AppMenu></AppMenu>
	<div class="h-screen overflow-y-auto">
		<slot />
	</div>
</main>