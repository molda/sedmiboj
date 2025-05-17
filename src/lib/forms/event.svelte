<script>
    import { onMount } from 'svelte';

    const { id } = $$props;
    let eventId = $state(id || '');

    let event = {
        title: '',
        organizer: '',
        date: '',
        location: '',
        description: ''
    };

    let isNew = !id;

    if (id) {
        // Fetch event data from the server
        fetch(`/api/events/${id}`)
            .then(response => response.json())
            .then(data => {
                event = data;
                isNew = false;
            })
            .catch(error => console.error('Error fetching event:', error));
    }
    function close() {
        // Close the modal
        // This could be a store update or a prop function passed from the parent component
    };

    function submit() {
        // Submit the event data to the server
        const method = isNew ? 'POST' : 'PUT';
        fetch(`/api/events/${isNew ? '' : id}`, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        })
            .then(response => response.json())
            .then(data => {
                // Handle success
                console.log('Event saved:', data);
                close();
            })
            .catch(error => console.error('Error saving event:', error));
    };
</script>

<div class="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center">
    <div class="bg-white rounded-xl p-8  w-[32rem]">
        <h2 class="text-2xl font-bold mb-4">{#if isNew}Nová{:else}Upravit{/if} událost</h2>
        <div>
            <div class="mb-4">
                <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Název události</label>
                <input type="text" id="title" name="title" bind:value={event.title} class="w-full border rounded-lg p-1">
            </div>
            <div class="mb-4">
                <label for="organizer" class="block text-gray-700 text-sm font-bold mb-2">Pořadatel</label>
                <input type="text" id="organizer" name="organizer" bind:value={event.organizer} class="w-full border rounded-lg p-1">
            </div>
            <div class="mb-4">
                <label for="date" class="block text-gray-700 text-sm font-bold mb-2">Datum</label>
                <input type="date" id="date" name="date" bind:value={event.date} class="w-full border rounded-lg p-1">
            </div>
            <div class="mb-4">
                <label for="location" class="block text-gray-700 text-sm font-bold mb-2">Místo konání</label>
                <input type="text" id="location" name="location" bind:value={event.location} class="w-full border rounded-lg p-1">
            </div>
            <div class="mb-4">
                <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Popis</label>
                <textarea id="description" name="description" bind:value={event.description} class="w-full border rounded-lg p-1"></textarea>
            </div>
            <div class="flex justify-end">
                <button class="mr-4" onclick={() => close()}>Zrušit</button>
                <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl ml-2" onclick={() => submit()}>Uložit</button>
            </div>
        </div>
    </div>
</div>