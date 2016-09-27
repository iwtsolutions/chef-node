var authenticate = require('./chef/authenticate'),
    request = require('request'),
    methods = ['delete', 'get', 'post', 'put'];

function Chef(user, key, options) {
    this.user = user;
    this.key = key;

    options = options || {};
    options.version = options.version || '12.8.0';
    options.timeout = options.timeout || 30000;
    this.options = options;
}

function req(method, uri, body, callback) {
    method = method.toUpperCase();

    // Add the base property of the client if the request does not specify the
    // full URL.
    if (uri.indexOf(this.options.base) !== 0) { uri = this.options.base + uri; }

    // Use the third parameter as the callback if a body was not given (like for
    // a GET request.)
    if (typeof body === 'function') { callback = body; body = undefined; }

    return request({
        body: body,
        headers: authenticate(this, { body: body, method: method, uri: uri }),
        json: true,
        method: method,
        uri: uri,
        timeout: this.options.timeout
    }, callback);
}

methods.forEach(function (method) {
    Chef.prototype[method] = function (uri, body, callback) {
        return req.call(this, method, uri, body, callback);
    };
});

exports.createClient = function (user, key, options) {
    return new Chef(user, key, options);
};
