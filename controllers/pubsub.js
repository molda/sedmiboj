exports.install = function() {
	ROUTE('SOCKET /pubsub', websocket, ['json']);
};

const TOPICS = new Map();
const TOPICS_WILD = new Map();
const TOPICS_SERVER = new Set();
const TOPICS_SERVER_WILD = new Set();
const storage = new Map();
const storage_ids = new Map();

const hasServerWild = topic => {
	const iterator = TOPICS_SERVER_WILD.entries();

	for (const entry of iterator) {
		if (mqttWildcard(topic, entry))
			return true;
	}
};

const sendTo = (clientid, topic, msg) => {
	if (!PUBSUB.ws)
		return;
	var sub = PUBSUB.ws.find(c => c.id === clientid);
	if (sub) {
		//console.log('sendTo', clientid);
		sub.send({
			action: 'publish',
			topic: topic,
			message: msg
		});
	} //else
		//console.log('sendTo, client not found', clientid);
};

const isWild = topic => topic.indexOf('#') > -1 || topic.indexOf('+') > -1;

global.PUBSUB = {
	get_subscriptions: () => ({ TOPICS, TOPICS_WILD }),
	subscribe: function(topic){
		if (isWild(topic)) {
			TOPICS_SERVER_WILD.add(topic);
		} else {
			TOPICS_SERVER.add(topic);
		}
	},
	unsubscribe: function(topic){
		TOPICS_SERVER.delete(topic);
		TOPICS_SERVER_WILD.delete(topic);
	},
	subscribe_client: function(topic, id){

		if (topic instanceof Array)
			topic.forEach(t => PUBSUB._subscribe_client(t, id));
		else
			PUBSUB._subscribe_client(topic, id);
	},
	_subscribe_client: function(topic, id){
		if (isWild(topic)) {
			if (!TOPICS_WILD.has(topic))
				TOPICS_WILD.set(topic, new Set([id]));
			else
				TOPICS_WILD.get(topic).add(id);

		} else {
			if (!TOPICS.has(topic))
				TOPICS.set(topic, new Set([id]));
			else
				TOPICS.get(topic).add(id);
		}
	},
	unsubscribe_client: function(topic, id){
		if (!id) {
			id = topic;
			TOPICS.forEach((ids) => {
				ids.delete(id);
			});
			TOPICS_WILD.forEach((ids) => {
				ids.delete(id);
			});
			return;
		}

		if (topic instanceof Array)
			topic.forEach(t => PUBSUB._unsubscribe_client(t, id));
		else
			PUBSUB._unsubscribe_client(topic, id);
	},
	_unsubscribe_client: function(topic, id){
		let ids = TOPICS.get(topic);
		ids && ids.delete(id);
	},
	unsubscribeAll: function(){
		TOPICS.clear();
		TOPICS_WILD.clear();
	},
	publish: function({ topic, message, options = {} }, clientid, direct){
		if (!PUBSUB.ws)
			return false;

		if (message && options.persist) { // msg.persist --> only 'session' supported at this moment
			//console.log('PERSISTING', JSON.stringify({ msg }));
			storage.set(topic, message);
			storage_ids.set((clientid || 'server') + '|' + topic, options.persist);
		}
		//console.log('PUBLISH', JSON.stringify({ topic, message, clientid, direct }));
		var topic_ids = TOPICS.get(topic);
		var sent = new Set();
		if (topic_ids){
			if (direct) { // only used when client subscribes to stored topic, so send the stored data immediately
				//if (topic_ids.has(clientid))
				sendTo(clientid, topic, message);
				return true;
			}

			topic_ids.forEach(function(cid){
				if (!clientid || cid !== clientid) {
					sendTo(cid, topic, message);
					sent.add(cid);
				}
			});
		}

		TOPICS_WILD.forEach((ids, wildcard) => {
			if (mqttWildcard(topic, wildcard)) {
				//console.log('publish wildcard', wildcard, ids);
				ids.forEach(id => {
					if ((!clientid || id !== clientid) && !sent.has(id)) {
						sendTo(id, topic, message);
						sent.add(id);
					}
				});
			}
		});
		sent = sent.size ? true : false;
		//console.log('SENTTO', sent);
		// if no clientid then it was published by server, ignore it
		if (!clientid)
			return sent;

		if (TOPICS_SERVER.has(topic) || hasServerWild(topic))
			PUBSUB.emit(topic, message);

		return sent;
	},
	$events: {},
	on: function(name, fn) {
		if (PUBSUB.$events[name])
			PUBSUB.$events[name].push(fn);
		else
			PUBSUB.$events[name] = [fn];
	},
	emit: function(name, a, b, c, d, e, f, g) {
		var evt = PUBSUB.$events[name];
		if (evt) {
			var clean = false;
			for (var i = 0, length = evt.length; i < length; i++) {
				if (evt[i].$once)
					clean = true;
				evt[i].call(PUBSUB, a, b, c, d, e, f, g);
			}
			if (clean) {
				evt = evt.remove(n => n.$once);
				if (evt.length)
					PUBSUB.$events[name] = evt;
				else
					PUBSUB.$events[name] = undefined;
			}
		}
	},
	once: function(name, fn) {
		fn.$once = true;
		PUBSUB.on(name, fn);
	},
	removeListener: function(name, fn) {
		var evt = PUBSUB.$events[name];
		if (evt) {
			evt = evt.remove(n => n === fn);
			if (evt.length)
				PUBSUB.$events[name] = evt;
			else
				PUBSUB.$events[name] = undefined;
		}
	},
	removeAllListeners: function(name) {
		if (name)
			self.$events[name] = undefined;
		else
			self.$events = {};
	}
};

function websocket() {
	var self = this;

	self.autodestroy(function() {
		PUBSUB.ws = null;
		PUBSUB.unsubscribeAll();
	});

	self.on('open', function(client) {

	});

	self.on('message', function(client, msg) {
		//console.log('PUBSUB message, client:', client.id, JSON.stringify(msg));
		switch(msg.action) {
			case 'subscribe':
				PUBSUB.subscribe_client(msg.topic, client.id, msg);
				PUBSUB.emit('subscribe', msg.topic, client, msg);
				//if (isWildcard(msg.topic)) {
					// persistent data not returned for wildcard topics, fix or not?
				//}
				if (storage.has(msg.topic) || msg.options.immediate) { // send empty object if no data available
					var data = storage.get(msg.topic);
					//console.log('SUBed to', msg.topic, '| storage data:', data);
					PUBSUB.publish({ topic: msg.topic, message: data || {} }, client.id, true);
				}
				break;
			case 'unsubscribe':
				PUBSUB.unsubscribe_client(msg.topic, client.id, msg);
				PUBSUB.emit('unsubscribe', msg.topic, client.id, msg);
				break;
			case 'publish':
				if (!msg.message || !Object.keys(msg.message).length || Object.getPrototypeOf(msg.message) !== Object.prototype)
					return;
				PUBSUB.publish(msg, client.id);
				PUBSUB.emit('message', msg.topic, msg.message, client.id);
				break;
			case 'system':
				//console.log('WS: System message', msg);
				switch (msg.topic) {
					case 'clients':
						var clients = (PUBSUB.ws && PUBSUB.ws.clients().map(c => c.user)) || [];
						client.send(clients);
						break;
					case '$sys/reload':
						PUBSUB.ws.send(msg);
						break;
				}
		}
	});

	self.on('close', function(client, msg, code) {
		PUBSUB.unsubscribe_client(client.id);
		PUBSUB.emit('client-disconnected', client);
		storage_ids.forEach((val, key) => {
			//console.log('storage_ids.forEach', key, val);
			var split = key.split('|');
			if (split[0] === client.id && val === 'session') {
				storage_ids.delete(key);
				storage.delete(split[1]);
				PUBSUB.publish({ topic: split[1], message: null });
			}
		});
	});

	PUBSUB.ws = self;
}

function isWildcard(topic) {
	return topic.includes('+') || topic.includes('#');
}

function mqttWildcard(topic, wildcard) {
	if (topic === wildcard) {
		return [];
	} else if (wildcard === '#') {
		return [topic];
	}

	var res = [];

	var t = String(topic).split('/');
	var w = String(wildcard).split('/');

	var i = 0;
	for (var lt = t.length; i < lt; i++) {
		if (w[i] === '+') { // || t[i] === '+') { // topic can have + so topic/+/hello matches wildcard topic/abc/#
			res.push(t[i]);
		} else if (w[i] === '#') {
			res.push(t.slice(i).join('/'));
			return res;
		} else if (w[i] !== t[i]) {
			return null;
		}
	}

	if (w[i] === '#') {
		i += 1;
	}

	return (i === w.length) ? res : null;
}

PUBSUB.match = mqttWildcard;