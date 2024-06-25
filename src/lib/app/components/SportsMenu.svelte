<script>
    import { page } from '$app/stores';
    import { treeStore } from '$lib/stores';

    let selected = 'tenis';

    treeStore.subscribe(value => {
        //sconsole.log('selected', value);
        selected = value.selected;
    });

    function selectSport(id) {
        treeStore.update(value => {
            value.selected = id;
            return value;
        });
    }

</script>
<div class="flex justify-center absolute w-full pointer-events-none">
    <ul class="bg-primary-500 flex text-white text-xl shadow-xl pointer-events-auto">
        {#each $page.data.sports as sport}
        <li class="p-1 flex justify-center items-center relative group pointer" class:selected={selected === sport.id} title={sport.name}>
            <button class="w-full h-full px-2 py-1 hover:bg-white/30 rounded-lg flex flex-row justify-center items-center" on:click={() => selectSport(sport.id)}>
                <div class="flex justify-center items-center mr-2">
                    {#if sport.icon}
                    <i class={sport.icon}></i>
                    {:else}
                    {@html sport.svg}
                    {/if}
                </div>
                <div class="font-sm">{sport.name}</div>
            </button>
        </li>
        {/each}
    </ul>
</div>
<style>
    ul {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    }

    ul > li.selected > button {
        background-color: rgba(255, 255, 255, 0.3);
    }
</style>