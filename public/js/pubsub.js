function PubSub(opt = {}, user) {
	var self = this;
	var url = (location.protocol.length === 6 ? 'wss' : 'ws') + `://${location.host}/pubsub`;
	var ws;
	var queue = [];
	var sending = false;
	var subscribtions = {};
	var config = { resubscribe: true, ...opt };
	self.online = false;

	self.connect = function() {
		ws && self.close();
		setTimeout(function() {
			ws = new WebSocket(url);
			ws.onopen = onOpen;
			ws.onclose = onClose;
			ws.onerror = onError;
			ws.onmessage = onMessage;
		}, 100);
		return self;
	};

	self.close = function(isClosed) {
		if (!ws)
			return self;
		self.online = false;
		ws.onopen = ws.onclose = ws.onmessage = null;
		!isClosed && ws.close();
		ws = null;
		self.emit('disconnected');
		!config.resubscribe && (subscribtions = {});
		return self;
	};

	self.subscribe = function(topic, options = {}) {
		if (!subscribtions[topic]) {
			//console.log('Subscribing:', topic);
			queue.push(JSON.stringify({
				action: 'subscribe',
				topic: topic,
				options
			}));
			subscribtions[topic] = { count: 1, options };
			processQueue();
		} else {
			subscribtions[topic].count++;
		}
		return self;
	};

	self.unsubscribe = function(topic) {
		if (subscribtions[topic]) {
			subscribtions[topic].count--;
			if (subscribtions[topic].count > 0)
				return;
			queue.push(JSON.stringify({
				action: 'unsubscribe',
				topic: topic
			}));
			processQueue();
			delete subscribtions[topic];
		}
		return self;
	};

	self.publish = function(topic, message, persist) {
		if (!message || !Object.keys(message).length)
			return;
		queue.push(JSON.stringify({
			action: 'publish',
			topic,
			message,
			persist
		}));
		processQueue();
		return self;
	};

	self.send = function(topic, data) {
		queue.push(JSON.stringify({
			action: 'system',
			topic,
			data
		}));
		processQueue();
		return self;
	};

	function processQueue(callback) {

		if (!ws || sending || !queue.length || ws.readyState !== 1) {
			callback && callback();
			return;
		}

		sending = true;

		function next(cb) {
			if (!queue.length) {
				cb && cb();
				sending = false;
				return;
			}
			var msg = queue.pop();
			ws && ws.send(msg);
			setTimeout(function(){ next(cb); }, 10);
		};
		next(callback);
	};

	function onClose(ev) {
		self.close(true);
		if (ev.reason && ev.reason.includes('401')) {
			self.emit('error', 401);
			return console.warn('Websocket disabled');
		}
		setTimeout(self.connect, 2000);
	};

	function onError(err) {
		console.log('PUBSUB error', err);
	};

	function onMessage(e) {
		var msg;
		try {
			msg = JSON.parse(e.data);
		} catch (e) {
			WARN('PubSub "{0}": {1}'.format(url, e.toString()));
		}

		if (msg.action === 'publish'/* && subscribtions[msg.topic]*/) {
			self.emit('message', msg.topic, msg.message);
			self.emit(msg.topic, msg.message);
		}
	};

	function onOpen() {
		self.online = true;
		if (config.resubscribe) {
			//console.log('Re-subscribing', subscribtions);
			var keys = Object.keys(subscribtions);
			if (keys && keys.length)
				keys.forEach(key => queue.push(JSON.stringify({
					action: 'subscribe',
					topic: key,
					options: subscribtions[key].options
				})));
			processQueue();
		}

		processQueue(function() {
			self.emit('connected');
		});
	};

	self.$events = {};
	self.on = function(name, fn) {
		if (self.$events[name])
			self.$events[name].push(fn);
		else
			self.$events[name] = [fn];
	};

	self.emit = function(name, a, b, c, d, e, f, g) {
		var evt = self.$events[name];
		if (evt) {
			var clean = false;
			for (var i = 0, length = evt.length; i < length; i++) {
				if (evt[i].$once)
					clean = true;
				evt[i].call(self, a, b, c, d, e, f, g);
			}
			if (clean) {
				evt = evt.remove(n => n.$once);
				if (evt.length)
					self.$events[name] = evt;
				else
					self.$events[name] = undefined;
			}
		}
	};

	self.once = function(name, fn) {
		fn.$once = true;
		self.on(name, fn);
	};

	self.removeListener = self.off = function(name, fn) {
		var evt = self.$events[name];
		if (evt) {
			evt = evt.remove(n => n === fn);
			if (evt.length)
				self.$events[name] = evt;
			else
				self.$events[name] = undefined;
		}
	};

	self.removeAllListeners = function(name) {
		if (name)
			self.$events[name] = undefined;
		else
			self.$events = {};
	};

	self.connect();
	return self;
};

