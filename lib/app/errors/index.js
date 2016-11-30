/* jshint latedef: nofunc */

/**
 * provide application error classes
 * @module errors
 */

var util       = require('util');
var inherits   = util.inherits;
var format     = util.format;
var extend     = util._extend;

var errors = module.exports = {};
var SDKFatalError;

/**
 * abstract SDKError class
 * @constructor
 * @param {(string|Object)} msg - error message
 * @param {Object} edesc - error description
 * @param {string} edesc.message - default error message
 * @param {number} edesc.statusCode - default status code
 * @param {number} edesc.customCode - default custom code
 * @throws {TypeError} JSON.stringify of circular object
 */
function SDKError (msg, edesc) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.status = this.statusCode = edesc.statusCode;
    this.customCode = edesc.customCode;
    this.errors = [];
    this._headers = {};

    if (!msg) this.message = edesc.message;
    else if (typeof msg === 'string') this.message = msg;
    else this.message = JSON.stringify(msg);
}
inherits(SDKError, Error);
SDKError.prototype.name = 'SDKError';

/**
 * add multiple errors to Error Object
 * @param {string|SDKError} msg error description or Error object
 * @param {number} [code=this.customCode] custom error code
 */
SDKError.prototype.push = function (msg, code) {
    if (msg && (errors[msg.name] !== undefined)) {
        this.errors = this.errors.concat(msg.errors);
        this.header(msg._headers);
        return this;
    }
    if (!msg) {
        var _internalError = new errors.Internal();
        this.errors = _internalError.errors;
        this.statusCode = _internalError.statusCode;
        return this;
    }
    if (typeof msg !== 'string') msg = JSON.stringify(msg);
    this.errors.push({'msg': msg, 'code': (code || this.customCode)});
    return this;
};

/**
 * add response headers for error
 * @param   {String|Object} k - header name or hash with header names and values
 * @param   {*} [v=''] - header value
 * @returns {SDKError}
 */
SDKError.prototype.headers =
SDKError.prototype.header = function (k, v) {
    if ((arguments.length === 1) &&
            (!Array.isArray(k)) &&
            (typeof k === 'object')) {
        extend(this._headers, k);
        return this;
    }
    this._headers[k] = (v || v === 0) ? String(v) : '';
    return this;
};

/**
 * convert Error Object to form required for response
 * @returns {Object} with 'body', 'headers', 'status' keys
 */
SDKError.prototype.toResponse = function () {
    var result = {
        'body': {'errors': this.errors},
        'headers': this._headers,
        'status': this.statusCode
    };
    return result;
};

/**
 * Factory to create new Errors
 * @param {String} ename - Error name
 * @param {Object} edesc - description of error
 */
function errorFactory(ename, edesc) {
    if ((!(edesc.statusCode)) && (!(edesc.customCode))) {
        throw new Error('Invalid error definition for ' + ename);
    }
    if (!(edesc.customCode)) {
        edesc.customCode = edesc.statusCode;
    }

    /**
     * custom Error constructor
     * @constructor
     * @extends SDKError
     */
    function CustomSDKError (msg) {
        if (!(this instanceof CustomSDKError))
            throw new Error(format('Invalid Error instantiation, use new %s()', ename));
        SDKError.call(this, msg, edesc);
        this.name = ename;
        return this.push(this.message, this.customCode);
    }
    inherits(CustomSDKError, SDKError);
    CustomSDKError.prototype.name = ename;
    return CustomSDKError;
}

/** for when really bad things happen */
SDKFatalError = errors.SDKFatalError = errorFactory('SDKFatalError', {'statusCode': 500});

/**
 * helper to create new errors and load to global errors
 * @param {Object} o
 */
function registerErrors(o) {
    if ((typeof o !== 'object') || (Array.isArray(o)))
        throw new SDKFatalError('Invalid argument to registerErrors. Only accepts objects.');

    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            if (errors[i] !== undefined)
                throw new SDKFatalError(i + ' already exists.');
            errors[i] = errorFactory(i, o[i]);
        }
    }
}

(function loadErrors() {
    registerErrors(require("./errors"));
})();

errors.SDKError      = SDKError;
errors.registerErrors = registerErrors;
errors.errorFactory   = errorFactory;
