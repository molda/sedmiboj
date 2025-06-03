<script>
    import { page } from '$app/stores';
    import { signIn, signOut } from '@auth/sveltekit/client';

    let selected = 'home';

    page.subscribe((value) => {
        if (value.route.id === '/(app)/events/[event]')
            selected = 'home';
        else
            selected = value.route.id.split('/').pop();

        //console.log({selected}, value);        
    });

</script>

<nav class="h-full text-white text-xl z-10 py-2">
    <div class="bg-primary-500 flex flex-col justify-between h-full rounded-r-lg">
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
            <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === 'overview'}>
                <a href="/events/{$page.params.event}/overview" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center text-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M3 9h4V5H3zm0 5h4v-4H3zm5 0h4v-4H8zm5 0h4v-4h-4zM8 9h4V5H8zm5-4v4h4V5zm5 9h4v-4h-4zM3 19h4v-4H3zm5 0h4v-4H8zm5 0h4v-4h-4zm5 0h4v-4h-4zm0-14v4h4V5z"/></svg>
                </a>
                <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Všechny pavouci</div>
            </li>
        </ul>
        <ul>
            {#if $page.data.session?.user}
            <li class="w-full aspect-square p-2 flex justify-center items-center relative group" class:selected={selected === 'settings'}>
                <a href="/events/{$page.params.event}/settings" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center"><i class="fa-solid fa-gear"></i></a>
                <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Nastavení</div>
            </li>
            <li class="w-full aspect-square p-2 flex justify-center items-center relative group">
                <a href="/logout" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center" on:click={() => signOut()}><i class="fa-solid fa-sign-in"></i></a>
                <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Odhlásit</div>
            </li>
            {/if}
            {#if !$page.data.session?.user}
            <li class="w-full aspect-square p-2 flex justify-center items-center relative group">
                <a href="/login" class="w-full h-full hover:bg-white/30 rounded-lg flex justify-center items-center"><i class="fa-solid fa-sign-in"></i></a>
                <div class="absolute left-[64px] text-sm text-gray-800 bg-white p-2 rounded-xl text-nowrap shadow-xl invisible group-hover:visible">Přihlásit</div>
            </li>
            {/if}
        </ul>
    </div>
</nav>
<style>
    nav > div {
        box-shadow: 4px 0px 17px 0px #00000045;
    }
    
    li.selected > a {
        background-color: rgba(255, 255, 255, 0.3);
    }
</style>