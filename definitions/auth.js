var log = softlog('def:auth');

MAIN.session = SESSION();

MAIN.session.ondata = async function(meta, next) {
    next({});
};

AUTH(function($) {

    MAIN.session.getcookie($.req, { name: CONF.cookie_name, key: CONF.cookie, extendcookie: false, removecookie: true, ddos: 10 }, (err, data, session) => {
		if (!err && session) {
			log.debug('user logged in');
			return $.success({ admin: true });
		}
        log.debug('user NOT logged in');

		$.invalid();
	});

});