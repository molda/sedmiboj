(function(W) {
	var User = {};

	User.events = [];
	User.on = function(name, fn) {
		var t = this;
		if (t.events[name])
			t.events[name].push(fn);
		else
			t.events[name] = [fn];
	};

	User.emit = function(name, a, b, c, d, e) {
		var t = this;
		var items = t.events[name];
		if (items) {
			for (var fn of items)
				fn.call(t, a, b, c, d, e);
		}
	};

	User.get = () => User.data;
	User.set = function(user, local) {
		this.data = user;
		this.save(local);
	};
	// User.update(user => user.name = 'PK'); or User.update(user => ({ new user object }));
	User.update = function(cb) {
		var user = cb(this.data);
		// just make sure the user is an object
		// they may not use "return user"
		if (user && user.UsrCd)
			this.data = user;
		this.save();
	};

	User.save = function(local) {
		var data = STRINGIFY(this.data);
		sessionStorage.setItem('user', data);
		local && localStorage.setItem('user', data);
		this.emit('change', this.data);
		SET('user', this.data);
	};

	User.logout = function() {
		AJAX('POST [api]static/auth/j_spring_security_logout', function(value, err) {
			//SET('user', {});
			User.set({}, true);
			location.href = '/login/';
		});
	};

	User.login = function(data, callback) {
		SETTER('loading/show');
		AJAX('POST [api]static/auth/j_spring_security_check { accept: "application/json" }', QUERIFY(data).substring(1), function(value, err, response) {
			SETTER('loading/hide', 200);
			if (response.status === 200) {
				User.loadData(callback);
			} else {
				callback('Invalid credentials, please try again.');
				SETTER('loading/hide');
			}
		});
	};

	User.loadData = function(callback) {
		AJAX('GET [api]web/AfterLoginData', function(value, err) {
			if (value && value.dsAfterlogindata && value.dsAfterlogindata.ttAfterlogindata) {
				var user = value.dsAfterlogindata.ttAfterlogindata[0];
				user.UsrPictureUrl = user.UsrPictureUrl || '/img/icons/Other contacts.svg';
				user.token = GUID();
				user.id = user.UsrCd.slug(); // used in pubsub, topic-safe string
				//user.CustomRoomId = user.token; //GUID(); THIS NEEDS TO BE GENERATED PER BROWSER WINDOW
				User.set(user);
				//localStorage.setItem('defaultCoCd', user.CoCd);
				callback(null, user, value.dsAfterlogindata);
			} else if (value.dsAfterlogindata && value.dsAfterlogindata.ttResult) {
				callback(value.dsAfterlogindata.ttResult[0].RetText);
			}
		});
	};

	User.data = PARSE(sessionStorage.getItem('user')) || PARSE(localStorage.getItem('user'));

	//if ((!User.data || !User.data.UsrCd) && !location.pathname.startsWith('/login'))
		//return User.logout();

	SET('user', User.data);
	window.addEventListener('load', () => User.emit('change', User.data));

	W.User = User;
}(window));