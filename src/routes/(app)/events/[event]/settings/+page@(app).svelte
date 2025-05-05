<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

    export let data;
    let disciplines = data.disciplines;
    let settings = data.settings;
    //console.log('page:settings', data);

	let saved = data.settings.sports?.length === 7;

    function save() {
        console.log('save', settings);
		settings.event = $page.params.event;
        fetch(`/api/events/${$page.params.event}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ settings })
        }).then(res => res.json()).then(data => {
            console.log('saved', data);
			!settings.initialized && goto(`/events/${$page.params.event}/teams`);
        });
    }
</script>

<div class="p-4 mx-auto w-[900px]">
	<div class="flex justify-between">
		<h1 class="text-4xl font-bold mb-2">Nastavení</h1>
		<button disabled={settings.initialized || saved} class={ `inline-flex justify-center items-center rounded-lg text-sm font-semibold h-10 py px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl ${settings.initialized || saved ? 'cursor-not-allowed' : '' }` } type="button" on:click={() => { save(); }}><i class="fa-solid fa-save mr-2 float-right"></i>Uložit</button>
	</div>
    
        <h2 class="text-2xl font-bold mb-2">Vyberte 7 disciplín</h2>
    <div class="rounded-xl overflow-hidden">
		<div class="radius-lt radius-rt h-2 bg-primary-200"></div>
		<div class="grid grid-cols-[40px_minmax(200px,_1fr)_80px]">
			<div class="flex items-center justify-center h-10 border-bottom bg-primary-200 b">#</div>
			<div class="flex items-center justify-center h-10 border-bottom bg-primary-200 b">Disciplína</div>
			<div class="flex items-center justify-center h-10 border-bottom bg-primary-200 b">&nbsp;</div>
		</div>
		{#each disciplines as discipline, idx}
		<div class="grid grid-cols-[40px_minmax(200px,_1fr)_80px] bg-primary-100 pointer">
			<div class="flex items-center justify-center h-8 border-bottom">{idx + 1}</div>
			<div class="flex items-center justify-center h-8 border-bottom">{discipline.name}</div>
			<div class="flex items-center justify-center h-8 border-bottom">
                <input type="checkbox" name="{discipline.id}" bind:group={ settings.sports } value="{discipline.id}" disabled={settings.initialized || saved}>
			</div>
		</div>
		{/each}
		<div class="radius-lb radius-rb h-2 bg-primary-200"></div>
	</div>
</div>