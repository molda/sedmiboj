AUTH(function($) {

    // "$" inherits these fields from "Data models" section --> "$":

    // Properties:
    // $.ip {String}
    // $.ua {String}
    // $.query {Object}
    // $.language {String}
    // $.url {String}
    // $.headers {Object}
    // NEW: $.websocket {Boolean}

    // Methods:
    // $.cookie(COOKIE_NAME)

    // Call the method if the request is authorized
    var user = { email: 'martin@msmola.cz', password: '123456' };
    $.success(user);

    // Call the method if the request is unauthorized
    // $.invalid();
    // or
    // $.invalid(YOUR_USER_INSTANCE);

});