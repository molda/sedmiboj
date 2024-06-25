import { writable } from 'svelte/store';

export const storeSettings = writable({
    sports: [],
    disciplines: [],
    settings: {}
});

export const treeStore = writable({ selected: 'tenis' });