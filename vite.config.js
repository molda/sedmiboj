import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { Server } from "socket.io";

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: "ws-server",
			configureServer(server) {
				// import("./dist/multiplayer.js").then(({ default: multiplayer }) => {
				// 	multiplayer(new Server(server.httpServer));
				// });

				const io = new Server(server.httpServer);
				console.log('WS server started');

				io.on('connection', (socket) => {
					console.log('Client connected');
					socket.on('disconnect', () => {
						console.log('Client disconnected');
					});

					socket.on('message', (data) => {
						console.log('Message received:', data);
						//socket.emit('message', data);
						socket.broadcast.emit('message', data);
					});
				});
			},
		}
	]
});
