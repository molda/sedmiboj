var users = new Map();
var log = softlog('ctrl:default');

users.set('admin', 'krucky2023!?');

const setCookie = (ctrl, opt, callback) => {
	opt.name = CONF.cookie_name;
	opt.key = CONF.cookie;
	opt.expire = opt.expire || '7 days';

	// setup session so we can later use the UrlEndpoints
	MAIN.session.setcookie(ctrl, opt, (err, data, session) => {
		callback?.();
	});
};

exports.install = function() {
	ROUTE('GET /*');

	ROUTE('GET /login/');
	ROUTE('+GET /logout/', logout);
	ROUTE('POST /login/', login);
};

/*function index() {
	EXEC('GET Meta --> read', (err, response) => {
		log.debug(this.user);
		this.view('index', response);
	});
};*/

function login() {

	var { email, password } = this.body;

	var pwd = users.get(email);
	log.debug('login:users', pwd, typeof(password) === 'string' && pwd && pwd === password);

	if (typeof(password) === 'string' && pwd && pwd === password) {
		log.debug('login success');
		return setCookie(this, { id: email, sessionid: GUID(), data: { } }, (session) => {
			this.json({ ok: true });
		});
	}

	log.debug('login failed', { email, password });
	this.status = 401;
	this.json({ ok: false });
};

function logout() {
	MAIN.session.getcookie(this, { name: CONF.cookie_name, key: CONF.cookie, extendcookie: false, removecookie: true, ddos: 10 }, (err, data, session) => {
		if (!err && session) {
			//log.debug('got cookie', $.req.url, session.id, session.sessionid);
			MAIN.session.remove(session.sessionid, () => {
				log.debug('Session removed');
			});
		}

		this.redirect('/');
	});
};