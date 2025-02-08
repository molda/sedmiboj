<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { writable, derived } from 'svelte/store';
    import { enhance, applyAction } from '$app/forms';
    import MainMenu from '$components/MainMenu.svelte';
	import { onMount } from 'svelte';

    let form_visible = false;
    
    const events_today = writable([]);
    const events_upcomming = writable([]);
    const events_old = writable([]);

    const fetchEvents = async () => {
        const res = await fetch('/events', { headers: { Accept: 'application/json' }});
        const data = await res.json();
        var dt = new Date();
        //console.log(data.events);

        events_today.set(data.events.filter(ev => new Date(ev.date).toDateString() === dt.toDateString()));

        events_upcomming.set(data.events.filter(ev => {
            var ev_dt = new Date(ev.date);
            return ev_dt > dt && ev_dt.toDateString() !== dt.toDateString();
        }));

        events_old.set(data.events.filter(ev => {
            var ev_dt = new Date(ev.date);
            return ev_dt < dt && ev_dt.toDateString() !== dt.toDateString();
        }));
    };

    onMount(() => {
        fetchEvents();
    });

</script>
<div class="">
    <MainMenu></MainMenu>
    <div class="md:mx-auto flex flex-col relative max-w-2xl px-4 py-8 mt-14">
        <div class="fixed right-[-170px] h-[600px] w-[170px] bg-primary-200 rounded-xl text-center">
            Reklama
        </div>
        {#if $page.data.session?.user}
        <div class="flex justify-end">
            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl" on:click={() => (form_visible = true)}><i class="fa-solid fa-plus mr-2 float-right"></i>Nová událost</button>
            {#if form_visible}
            <div class="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center">
                <div class="bg-white rounded-xl p-8  w-[32rem]">
                    <h2 class="text-2xl font-bold mb-4">Nová událost</h2>
                    <form action="?/create" method="POST" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
                        // `formElement` is this `<form>` element
                        // `formData` is its `FormData` object that's about to be submitted
                        // `action` is the URL to which the form is posted
                        // calling `cancel()` will prevent the submission
                        // `submitter` is the `HTMLElement` that caused the form to be submitted
                
                        return async ({ result, update }) => {
                            // `result` is an `ActionResult` object
                            // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
                            if (result.type === 'redirect') {
                                goto(result.location);
                            } else {
                                await applyAction(result);
                            }
                            await fetchEvents();
                            form_visible = false;
                            await update();
                        };
                    }}
                    >
                        <div class="mb-4">
                            <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Název události</label>
                            <input type="text" id="title" name="title" class="w-full border rounded-lg p-1">
                        </div>
                        <div class="mb-4">
                            <label for="organizer" class="block text-gray-700 text-sm font-bold mb-2">Pořadatel</label>
                            <input type="text" id="organizer" name="organizer" class="w-full border rounded-lg p-1">
                        </div>
                        <div class="mb-4">
                            <label for="date" class="block text-gray-700 text-sm font-bold mb-2">Datum</label>
                            <input type="date" id="date" name="date" class="w-full border rounded-lg p-1">
                        </div>
                        <div class="mb-4">
                            <label for="location" class="block text-gray-700 text-sm font-bold mb-2">Místo konání</label>
                            <input type="text" id="location" name="location" class="w-full border rounded-lg p-1">
                        </div>
                        <div class="mb-4">
                            <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Popis</label>
                            <textarea id="description" name="description" class="w-full border rounded-lg p-1"></textarea>
                        </div>
                        <div class="flex justify-end">
                            <button class="mr-4" on:click={() => (form_visible = false)}>Zrušit</button>
                            <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl ml-2">Uložit</button>
                        </div>
                    </form>
                </div>
            </div>
            {/if}
        </div>
        {/if}
        {#if $events_today.length}
            <h2 class="text-2xl tracking-tight text-gray-400 text-center">Dnešní události</h2>
            {#each $events_today as event}
            <a href="/events/{event.id}" class="my-4 w-full shadow-lg rounded-xl p-4 bg-white hover:shadow-xl">
                <div class="flex justify-between w-full">
                    <h2 class="text-3xl font-bold tracking-tight text-gray-700">{event.title}</h2>
                    <div class="">
                        <h3><span class="text-gray-500">Pořádá:</span>&nbsp;<span class="text-xl font-bold text-gray-700">{event.organizer}</span></h3>
                    </div>
                </div>
                <div class="flex justify-between items-center text-gray-500">
                    <div><i class="fa-solid fa-location-dot mr-2"></i>{event.location} | <i class="fa-regular fa-calendar mr-2"></i>{event.date}</div>
                    <div><button class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-primary-500 hover:text-white"><i class="fa-solid fa-arrow-right mr-2"></i>Otevřít</button></div>
                </div>
            </a>
            {/each}
            <br>
        {/if}
        {#if $events_upcomming.length}
            <h2 class="text-2xl tracking-tight text-gray-400 text-center">Nadcházející události</h2>
            {#each $events_upcomming as event}
            <a href="/events/{event.id}" class="my-4 w-full shadow-lg rounded-xl p-4 bg-white hover:shadow-xl">
                <div class="flex justify-between w-full">
                    <h2 class="text-3xl font-bold tracking-tight text-gray-700 ">{event.title}</h2>
                    <div class="">
                        <h3><span class="text-gray-500">Pořádá:</span>&nbsp;<span class="text-xl font-bold text-gray-700">{event.organizer}</span></h3>
                    </div>
                </div>
                <div class="flex justify-between items-center text-gray-500">
                    <div><i class="fa-solid fa-location-dot mr-2"></i>{event.location} | <i class="fa-regular fa-calendar mr-2"></i>{event.date}</div>
                    <div><button class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-primary-500 hover:text-white"><i class="fa-solid fa-arrow-right mr-2"></i>Otevřít</button></div>
                </div>
            </a>
            {/each}
            <br>
        {/if}
        {#if $events_old.length}
            <h2 class="text-2xl tracking-tight text-gray-400 text-center">Starší události</h2>
            {#each $events_old as event}
            <a href="/events/{event.id}" class="my-4 w-full shadow-lg rounded-xl p-4 bg-white hover:shadow-xl">
                <div class="flex justify-between w-full">
                    <h2 class="text-3xl font-bold tracking-tight text-gray-700">{event.title}</h2>
                    <div class="">
                        <h3><span class="text-gray-500">Pořádá:</span>&nbsp;<span class="text-xl font-bold text-gray-700">{event.organizer}</span></h3>
                    </div>
                </div>
                <div class="flex justify-between items-center text-gray-500">
                    <div><i class="fa-solid fa-location-dot mr-2"></i>{event.location} | <i class="fa-regular fa-calendar mr-2"></i>{event.date}</div>
                    <div><button class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-primary-500 hover:text-white"><i class="fa-solid fa-arrow-right mr-2"></i>Otevřít</button></div>
                </div>
            </a>
            {/each}
        {/if}
    </div>
</div>