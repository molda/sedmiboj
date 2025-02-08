<script>
    import { page } from '$app/stores';
	import { onMount } from 'svelte';
    import { PUBLIC_MAPS_APIKEY } from '$env/static/public';
    import { loadScript } from '$lib/utils.js'

	import Gallery from '$lib/components/Gallery.svelte';

    export let data;
    
    let event = data.event;
    let photos = [
        { url: 'https://picsum.photos/seed/picsum/600/400', thumb: 'https://picsum.photos/seed/picsum/200/200', width: 600, height: 400 },
        { url: 'https://picsum.photos/seed/picsum/550/400', thumb: 'https://picsum.photos/seed/picsum/200/200', width: 550, height: 400 },
        { url: 'https://picsum.photos/seed/picsum/860/400', thumb: 'https://picsum.photos/seed/picsum/200/200', width: 860, height: 400 },
        { url: 'https://picsum.photos/seed/picsum/1070/400', thumb: 'https://picsum.photos/seed/picsum/200/200', width: 1070, height: 400 },
        { url: 'https://picsum.photos/seed/picsum/1280/400', thumb: 'https://picsum.photos/seed/picsum/200/200', width: 1280, height: 400 },
        { url: 'https://picsum.photos/seed/picsum/1490/400', thumb: 'https://picsum.photos/seed/picsum/200/200', width: 1490, height: 400 },
        { url: 'https://picsum.photos/seed/picsum/500/400', thumb: 'https://picsum.photos/seed/picsum/200/200', width: 500, height: 400 },
    ];

    onMount(() => {
        console.log(event);
        // console.log('loading maps');
        loadScript(`https://maps.googleapis.com/maps/api/js?key=${PUBLIC_MAPS_APIKEY}&loading=async`).then(initMap).catch((err) => console.log('MAP LOAD FAILED', err));
    });

    function initMap() {
        if (typeof(google.maps?.Map) !== 'function')
            return setTimeout(initMap, 500);

        var map = new google.maps.Map(document.getElementById("googleMap"), {
            center: new google.maps.LatLng(50.361005, 16.0861051),
            zoom: 12
        });
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(50.361005, 16.0861051),
            map: map
        });
        console.log('map loaded');
    };
</script>

<div class="p-8">
    <div class="max-w-screen-lg mx-auto flex justify-between text-gray-600 mb-10">
        <div>
            <h1 class="text-4xl font-bold mb-2">{event.title}</h1>
            <div class="rounded-lg shadow bg-primary-200 px-2 py w-fit"><i class="fa-solid fa-location-dot mr-2"></i>{event.location} | <i class="fa-regular fa-calendar mr-2"></i>{event.date}</div>
        </div>
        <div class="flex text-lg gap-8 justify-center items-center bg-primary-200 shadow px-8 my-2 rounded-lg">
            <a href="/events/{$page.params.event}/photos" class="hidden"><i class="fa-solid fa-camera mr-2"></i>Fotky</a>
            <a href="/"><i class="fa-solid fa-medal mr-2"></i>Sedmiboj.eu</a>
        </div>
    </div>
    <div class="max-w-screen-lg mx-auto mb-10">
        <div class="max-w-screen-lg">
            <p class="mb-4">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolores recusandae natus beatae! Ratione, ex ullam, excepturi adipisci laudantium consectetur ipsa ab a assumenda est tempore quae minus quos. Reiciendis, id.</p>
            <p class="text-right text-lg">Těší se na Vás <b>TJ Nahořany</b></p>
        </div>
    </div>
    <div class="max-w-screen-lg mx-auto mb-10">
        <h1 class="text-2xl font-bold text-gray-600 mb-8"><i class="fa-solid fa-map-location-dot mr-2"></i>Kudy k nám</h1>
        <div class="max-w-screen-lg h-80 rounded-lg shadow-lg bg-white" id="googleMap">
            <div class="flex justify-center items-center h-full">MAPA</div>
        </div>
    </div>
    <div class="max-w-screen-lg mx-auto">
        <h1 class="text-2xl font-bold text-gray-600 mb-8"><i class="fa-solid fa-photo-film mr-2"></i>Fotky</h1>
        <div class="max-w-screen-lg rounded-lg shadow-lg bg-white p-2" id="googleMap">
            <Gallery images={photos} galleryID="event_gallery"></Gallery>
        </div>
    </div>
</div>