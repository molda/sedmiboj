<script>
	import { fly, fade } from 'svelte/transition';
	export let confirmTitle = 'OK';
	export let cancelTitle = 'Zrušit';

	let showModal = false;
	let functionToCall = {
		func: null,
		args: null
	};

	function callback() {
		showModal = false;
		functionToCall['func'](...functionToCall['args']);
	}

	function show(func, ...args) {
		functionToCall = { func, args };
		showModal = true;
	}
</script>

<slot {show} />

{#if showModal}
	<div class="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center">
		<div
			class="bg-white rounded-xl p-4 w-[32rem]"
			in:fly={{ y: -10, delay: 200, duration: 200 }}
			out:fly={{ y: -10, duration: 200 }}
		>
			<h2 class="text-2xl font-bold mb-4"><slot name="title" /></h2>
			<div><slot name="content" /></div>

			<div class="flex justify-end">
				<button
					class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl ml-2"
					on:click={callback}>{confirmTitle}</button
				>
				<button class="" type="button" on:click={() => (showModal = false)}
					><slot name="cancel">{cancelTitle}</slot></button
				>
			</div>
		</div>
	</div>
{/if}
