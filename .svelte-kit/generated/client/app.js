export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13')
];

export const server_loads = [0,2];

export const dictionary = {
		"/": [~3],
		"/(app)/events/[event]": [~4,[2]],
		"/(app)/events/[event]/matches": [~6,[2]],
		"/(app)/events/[event]/overview": [7,[2]],
		"/(app)/events/[event]/rankings": [~8,[2]],
		"/(app)/events/[event]/settings": [~9,[2]],
		"/(app)/events/[event]/teams": [~10,[2]],
		"/(app)/events/[event]/trees": [~11,[2]],
		"/(app)/events/[event]/[sport]": [5,[2]],
		"/login": [12],
		"/logout": [~13]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),

	reroute: (() => {})
};

export { default as root } from '../root.svelte';