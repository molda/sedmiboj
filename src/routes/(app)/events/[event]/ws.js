import { io } from 'socket.io-client';
import { writable } from 'svelte/store';

export const socket = io();
export const messages = writable([]);
export const message = writable({});
export const connected = writable(false);

socket.on('connect', () => {
    connected.set(true);
    console.log('Connected');
});

socket.on('disconnect', () => {
    connected.set(false);
    console.log('Disconnected');
});

socket.on('message', (data) => {
    console.log('Message received:', data);
    messages.update((msgs) => [...msgs, data]);
    message.set(data);
});

export function sendMessage(message) {
    socket.emit('message', message);
}

export function disconnect() {
    socket.disconnect();
}

export function connect() {
    socket.connect();
}   

