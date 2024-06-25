<script>
    import { page } from '$app/stores';

    let selected = 'home';

    page.subscribe((value) => {
        if (value.route.id === '/(app)/events/[event]')
            selected = 'home';
        else
            selected = value.route.id.split('/').pop();

        //console.log({selected}, value);        
    });
    //console.log($page.data.sports);
    //console.log($page.data.settings.sports);

</script>

<nav class="bg-primary-500 flex flex-col justify-between text-white text-xl rounded-r-lg my-2 z-10">
    <ul>
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group" title="Hlavní stránka - Sedmiboj.eu">
            <a href="/" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center"><i class="fa-solid fa-medal"></i></a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Hlavní stránka - Sedmiboj.eu</div>
        </li>
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === 'home'}>
            <a href="/events/{$page.params.event}" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center"><i class="fa-solid fa-home"></i></a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Hlavní stránka události</div>
        </li>
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === 'teams'}>
            <a href="/events/{$page.params.event}/teams" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center"><i class="fa-solid fa-users"></i></a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Týmy</div>
        </li>
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === 'rankings'}>
            <a href="/events/{$page.params.event}/rankings" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center"><i class="fa-solid fa-ranking-star"></i></a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Aktuální pořadí</div>
        </li>
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === 'matches'}>
            <a href="/events/{$page.params.event}/matches" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center text-2xl"><i class="fa-solid fa-table-list"></i></a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Zápasy</div>
        </li>
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === 'trees'}>
            <a href="/events/{$page.params.event}/trees" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center text-2xl rotate-90">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M5.5 5.5v-3h5v3zM4 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-.103l1.535 2H14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h.541L9.007 7H6.993L5.46 9H6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1.568l1.535-2H5a1 1 0 0 1-1-1zm-1.5 8.5v3h3v-3zm8 3v-3h3v3z" clip-rule="evenodd"/></svg>
            </a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Pavouk</div>
        </li>
    </ul>
    <!-- <ul>
        {#each $page.data.sports as sport}
        {#if $page.data.settings.sports.includes(sport.id)}
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === sport.id} title={sport.name}>
            <a href="/events/{$page.params.event}/{sport.id}" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center">
                {#if sport.icon}
                <i class={sport.icon}></i>
                {:else}
                {@html sport.svg}
                {/if}
            </a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">{sport.name}</div>
        </li>
        {/if}
        {/each}
    </ul> -->
    <ul>
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === 'settings'}>
            <a href="/events/{$page.params.event}/settings" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center"><i class="fa-solid fa-gear"></i></a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Nastavení</div>
        </li>
        {#if !$page.data.session?.user}
        <li class="w-full aspect-square p-2 flex justify-center items-center relative group">
            <a href="/login" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center"><i class="fa-solid fa-sign-in"></i></a>
            <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Přihlásit</div>
        </li>
        {/if}
    </ul>
</nav>
<style>
    nav {
        box-shadow: 4px 0px 17px 0px #00000045;
    }
    nav > ul > li.selected > a {
        background-color: rgba(255, 255, 255, 0.3);
    }
</style>