/*

	SoftLog v 1.0.1

	Global config

	softlog     (Object)   : { level: 'debug', http: { url: 'https://example.com/log', headers: { 'x-token': '123456' }}, beautify: true, hidedate: true, disabled: ['def:database'] }

	Log levels:
	- debug ->  debug, info, warn, error
	- info  ->  info, warn, error
	- warn  ->  warn, error
	Error logs are always logged

	disabled is an Array of ids to ignore

	Usage:

	var log = softlog(id [, options]);

	id = string identificator
	options = {
		filename: String // log file name, default name is 'softlog'
		beautify: Boolean // beautify json, default false
		hidedate: Boolean // date will not be added to log, default false
		debuglocal: Boolean // if true log.debug goes only to console and fs, default true
		targets: Array of strings // build-in targets are console and fs, default console
	}

	Enable logging to log server, only needed when not set in config
	MODULE('softlog').http('https://example.com/log', { 'x-token': '123456' }); 

	Additional targets can be added using
	MODULE('softlog').addTarget('name', function(obj){ obj; //{ app: CONF.id, level: level, source: id, body: String } })

	Force debug log
	MODULE('softlog').forceDebug(true); // false to restore 

	Example:

	var log = softlog('def:database', { targets: ['console', 'fs'] });

	log.debug('Hello', { hello: 'world' }); // output > "2020-02-21 09:17:55 [DEBUG] [def:database] Hello { 'hello': 'world' }"
	log.info(...);
	log.warn(...);
	log.error(...);
*/

const Util = require('util');
const Fs = require('fs');
const Path = require('path');

exports.install = function(options) {

};

var opt = CONF.softlog || {};
opt.level = opt.level || 'debug';
console.log(format('INFO', 'module:softlog', ['Level:', opt.level]));

const loggers = {};

global.softlog = function(id, options) {
	options = options || {};
	options.disabled = options.disabled || (opt.disabled && opt.disabled.indexOf(id) > -1);
	if (loggers[id]) {
        console.log(format('ERROR', 'module:softlog', ['Logger "{0}" already exists.'.format(id)]));
		return loggers[id];
    }
	loggers[id] = new Logger(id, options);
	return loggers[id];
};

var TARGETS = {};

exports.addTarget = function(name, fn){
	if (typeof(fn) !== 'function')
		return console.log(format('WARN', 'module:softlog', ['Can\'t add target "{0}". Second param is not a function.'.format(name)]));

	console.log(format('INFO', 'module:softlog', ['Softlog target "{0}" added.'.format(name)]));
	TARGETS[name] = fn;
};

exports.forceDebug = function(enable) {
	Object.keys(loggers).forEach(function(id){
        var l = loggers[id];
        l.forceDebug = enable;
		if (enable)
			l.debug = debug;
		else if (!enable && l.level !== 'debug')
			l.debug = NOOP;
	});
};

exports.http = function (url, headers) {

	if (!url || !headers)
		return console.log(format('ERROR', 'module:softlog', ['Cannot enable http. `url` and `headers` required.']));
	console.log(format('INFO', 'module:softlog', ['Looging to log server enabled, log server url:', url]));
	opt.url = url;
	opt.headers = headers;
	opt.httpEnabled = true;
};

exports.request = function (obj) {
	if (!opt.url || !opt.headers)
		return console.log(format('ERROR', 'module:softlog', ['Cannot post log to log server, `url` or `headers` not set.']));
	
	RESTBuilder.make(function (builder) {

		Object.keys(opt.headers).forEach(function (key) {
			builder.header(key, opt.headers[key]);
		});
		
		builder.url(opt.url);
		builder.post(obj);

		builder.exec(function (err, data, response) { 
			if (err)
				return console.log(format('ERROR', 'module:softlog', ['Log post failed', err]));
		});
	});
};

function Logger(id, options) {
	if (typeof id == 'object') {
		options = id;
		id = 'default';
	}
	options = options || {};
	this.id = id || 'default';
	this.level = options.level || opt.level || 'warn';
	this.filename = options.filename || opt.filename || 'softlog';
	this.fsdir = options.fsdir || opt.fsdir || F.path.logs();
	this.disabled = options.disabled;
	this.beautify = options.beautify || opt.beautify || false;
	this.hidedate = options.hidedate || opt.hidedate || false;
	this.debuglocal = options.debuglocal === false ? false : !(opt.debuglocal === false);

	this.targets = (options.targets instanceof Array) ? options.targets : (opt.targets instanceof Array) ? opt.targets : ['console'];
};

var LP = Logger.prototype;

function debug() {
	this.append('DEBUG', arguments);
};

function info() {
	this.append('INFO', arguments);
};

function warn() {
	this.append('WARN', arguments);
};

function error() {
	this.append('ERROR', arguments);
};

function format(level, id, args) {
	var str = '';
	if (!this.hidedate)
		str += new Date().format('yyyy-MM-dd HH:mm:ss');
	str += ' [' + level + ']' + (level.length === 4 ? ' ' : '') + ' [' + id + ']';

	str += formatArgs(args, this.beautify)

	return str;
};

function formatArgs(args, beautify) {
	var len = args.length;
	var str = '';
	for (var i = 0; i < len; i++) {
		var arg = args[i];
		str += ' ';
		if (typeof arg === 'object')
			str += Util.inspect(arg, { breakLength: !beautify ? Infinity : 80 });
		else
			str += arg;
	}
	return str;
};

LP.format = format;

LP.append = function (level, args) {
	if (this.disabled || !args || !args.length)
		return;

	var self = this;

	self.targets.forEach(function (target) {

		if (target === 'console')
			return console.log(self.format(level, self.id, args));

		if (target === 'fs')
			return Fs.appendFile(Path.join(self.fsdir, self.filename + '.log'), self.format(level, self.id, args) + '\n', 'utf8', NOOP);

		if (!self.forceDebug && (level === 'DEBUG' && opt.debuglocal))
			return;
		
		var msg = { app: CONF.id, level: level, source: self.id, msg: formatArgs(args, self.beautify) };
			
		if (TARGETS[target] && typeof(TARGETS[target]) === 'function')
			TARGETS[target](msg);
		
		if (opt.httpEnabled) {
			exports.request(msg);
		}
	});
};

LP.debug = (opt.level === 'debug') ? debug : NOOP;
LP.info = (opt.level === 'debug' || opt.level === 'info') ? info : NOOP;
LP.warn = (opt.level === 'debug' || opt.level === 'info' || opt.level === 'warn') ? warn : NOOP;
LP.error = error;

exports.Logger = Logger;