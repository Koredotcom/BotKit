"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RedisSocket_instances, _a, _RedisSocket_initiateOptions, _RedisSocket_defaultReconnectStrategy, _RedisSocket_isTlsSocket, _RedisSocket_initiator, _RedisSocket_options, _RedisSocket_socket, _RedisSocket_isOpen, _RedisSocket_isReady, _RedisSocket_writableNeedDrain, _RedisSocket_connect, _RedisSocket_createSocket, _RedisSocket_createNetSocket, _RedisSocket_createTlsSocket, _RedisSocket_onSocketError, _RedisSocket_isCorked;
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const net = require("net");
const tls = require("tls");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
class RedisSocket extends events_1.EventEmitter {
    constructor(initiator, options) {
        super();
        _RedisSocket_instances.add(this);
        _RedisSocket_initiator.set(this, void 0);
        _RedisSocket_options.set(this, void 0);
        _RedisSocket_socket.set(this, void 0);
        _RedisSocket_isOpen.set(this, false);
        _RedisSocket_isReady.set(this, false);
        // `writable.writableNeedDrain` was added in v15.2.0 and therefore can't be used
        // https://nodejs.org/api/stream.html#stream_writable_writableneeddrain
        _RedisSocket_writableNeedDrain.set(this, false);
        _RedisSocket_isCorked.set(this, false);
        __classPrivateFieldSet(this, _RedisSocket_initiator, initiator, "f");
        __classPrivateFieldSet(this, _RedisSocket_options, __classPrivateFieldGet(RedisSocket, _a, "m", _RedisSocket_initiateOptions).call(RedisSocket, options), "f");
    }
    get isOpen() {
        return __classPrivateFieldGet(this, _RedisSocket_isOpen, "f");
    }
    get isReady() {
        return __classPrivateFieldGet(this, _RedisSocket_isReady, "f");
    }
    get writableNeedDrain() {
        return __classPrivateFieldGet(this, _RedisSocket_writableNeedDrain, "f");
    }
    async connect() {
        if (__classPrivateFieldGet(this, _RedisSocket_isOpen, "f")) {
            throw new Error('Socket already opened');
        }
        return __classPrivateFieldGet(this, _RedisSocket_instances, "m", _RedisSocket_connect).call(this, 0);
    }
    writeCommand(args) {
        if (!__classPrivateFieldGet(this, _RedisSocket_socket, "f")) {
            throw new errors_1.ClientClosedError();
        }
        for (const toWrite of args) {
            __classPrivateFieldSet(this, _RedisSocket_writableNeedDrain, !__classPrivateFieldGet(this, _RedisSocket_socket, "f").write(toWrite), "f");
        }
    }
    disconnect() {
        if (!__classPrivateFieldGet(this, _RedisSocket_socket, "f")) {
            throw new errors_1.ClientClosedError();
        }
        else {
            __classPrivateFieldSet(this, _RedisSocket_isOpen, __classPrivateFieldSet(this, _RedisSocket_isReady, false, "f"), "f");
        }
        __classPrivateFieldGet(this, _RedisSocket_socket, "f").destroy();
        __classPrivateFieldSet(this, _RedisSocket_socket, undefined, "f");
        this.emit('end');
    }
    async quit(fn) {
        if (!__classPrivateFieldGet(this, _RedisSocket_isOpen, "f")) {
            throw new errors_1.ClientClosedError();
        }
        __classPrivateFieldSet(this, _RedisSocket_isOpen, false, "f");
        await fn();
        this.disconnect();
    }
    cork() {
        if (!__classPrivateFieldGet(this, _RedisSocket_socket, "f") || __classPrivateFieldGet(this, _RedisSocket_isCorked, "f")) {
            return;
        }
        __classPrivateFieldGet(this, _RedisSocket_socket, "f").cork();
        __classPrivateFieldSet(this, _RedisSocket_isCorked, true, "f");
        queueMicrotask(() => {
            __classPrivateFieldGet(this, _RedisSocket_socket, "f")?.uncork();
            __classPrivateFieldSet(this, _RedisSocket_isCorked, false, "f");
        });
    }
}
exports.default = RedisSocket;
_a = RedisSocket, _RedisSocket_initiator = new WeakMap(), _RedisSocket_options = new WeakMap(), _RedisSocket_socket = new WeakMap(), _RedisSocket_isOpen = new WeakMap(), _RedisSocket_isReady = new WeakMap(), _RedisSocket_writableNeedDrain = new WeakMap(), _RedisSocket_isCorked = new WeakMap(), _RedisSocket_instances = new WeakSet(), _RedisSocket_initiateOptions = function _RedisSocket_initiateOptions(options) {
    var _b, _c;
    options ?? (options = {});
    if (!options.path) {
        (_b = options).port ?? (_b.port = 6379);
        (_c = options).host ?? (_c.host = 'localhost');
    }
    options.connectTimeout ?? (options.connectTimeout = 5000);
    options.keepAlive ?? (options.keepAlive = 5000);
    options.noDelay ?? (options.noDelay = true);
    return options;
}, _RedisSocket_defaultReconnectStrategy = function _RedisSocket_defaultReconnectStrategy(retries) {
    return Math.min(retries * 50, 500);
}, _RedisSocket_isTlsSocket = function _RedisSocket_isTlsSocket(options) {
    return options.tls === true;
}, _RedisSocket_connect = async function _RedisSocket_connect(retries, hadError) {
    if (retries > 0 || hadError) {
        this.emit('reconnecting');
    }
    try {
        __classPrivateFieldSet(this, _RedisSocket_isOpen, true, "f");
        __classPrivateFieldSet(this, _RedisSocket_socket, await __classPrivateFieldGet(this, _RedisSocket_instances, "m", _RedisSocket_createSocket).call(this), "f");
        __classPrivateFieldSet(this, _RedisSocket_writableNeedDrain, false, "f");
        this.emit('connect');
        try {
            await __classPrivateFieldGet(this, _RedisSocket_initiator, "f").call(this);
        }
        catch (err) {
            __classPrivateFieldGet(this, _RedisSocket_socket, "f").destroy();
            __classPrivateFieldSet(this, _RedisSocket_socket, undefined, "f");
            throw err;
        }
        __classPrivateFieldSet(this, _RedisSocket_isReady, true, "f");
        this.emit('ready');
    }
    catch (err) {
        this.emit('error', err);
        const retryIn = (__classPrivateFieldGet(this, _RedisSocket_options, "f")?.reconnectStrategy ?? __classPrivateFieldGet(RedisSocket, _a, "m", _RedisSocket_defaultReconnectStrategy))(retries);
        if (retryIn instanceof Error) {
            __classPrivateFieldSet(this, _RedisSocket_isOpen, false, "f");
            throw new errors_1.ReconnectStrategyError(retryIn, err);
        }
        await (0, utils_1.promiseTimeout)(retryIn);
        return __classPrivateFieldGet(this, _RedisSocket_instances, "m", _RedisSocket_connect).call(this, retries + 1);
    }
}, _RedisSocket_createSocket = function _RedisSocket_createSocket() {
    return new Promise((resolve, reject) => {
        const { connectEvent, socket } = __classPrivateFieldGet(RedisSocket, _a, "m", _RedisSocket_isTlsSocket).call(RedisSocket, __classPrivateFieldGet(this, _RedisSocket_options, "f")) ?
            __classPrivateFieldGet(this, _RedisSocket_instances, "m", _RedisSocket_createTlsSocket).call(this) :
            __classPrivateFieldGet(this, _RedisSocket_instances, "m", _RedisSocket_createNetSocket).call(this);
        if (__classPrivateFieldGet(this, _RedisSocket_options, "f").connectTimeout) {
            socket.setTimeout(__classPrivateFieldGet(this, _RedisSocket_options, "f").connectTimeout, () => socket.destroy(new errors_1.ConnectionTimeoutError()));
        }
        socket
            .setNoDelay(__classPrivateFieldGet(this, _RedisSocket_options, "f").noDelay)
            .once('error', reject)
            .once(connectEvent, () => {
            socket
                .setTimeout(0)
                // https://github.com/nodejs/node/issues/31663
                .setKeepAlive(__classPrivateFieldGet(this, _RedisSocket_options, "f").keepAlive !== false, __classPrivateFieldGet(this, _RedisSocket_options, "f").keepAlive || 0)
                .off('error', reject)
                .once('error', (err) => __classPrivateFieldGet(this, _RedisSocket_instances, "m", _RedisSocket_onSocketError).call(this, err))
                .once('close', hadError => {
                if (!hadError && __classPrivateFieldGet(this, _RedisSocket_isOpen, "f") && __classPrivateFieldGet(this, _RedisSocket_socket, "f") === socket) {
                    __classPrivateFieldGet(this, _RedisSocket_instances, "m", _RedisSocket_onSocketError).call(this, new errors_1.SocketClosedUnexpectedlyError());
                }
            })
                .on('drain', () => {
                __classPrivateFieldSet(this, _RedisSocket_writableNeedDrain, false, "f");
                this.emit('drain');
            })
                .on('data', data => this.emit('data', data));
            resolve(socket);
        });
    });
}, _RedisSocket_createNetSocket = function _RedisSocket_createNetSocket() {
    return {
        connectEvent: 'connect',
        socket: net.connect(__classPrivateFieldGet(this, _RedisSocket_options, "f")) // TODO
    };
}, _RedisSocket_createTlsSocket = function _RedisSocket_createTlsSocket() {
    return {
        connectEvent: 'secureConnect',
        socket: tls.connect(__classPrivateFieldGet(this, _RedisSocket_options, "f")) // TODO
    };
}, _RedisSocket_onSocketError = function _RedisSocket_onSocketError(err) {
    __classPrivateFieldSet(this, _RedisSocket_isReady, false, "f");
    this.emit('error', err);
    __classPrivateFieldGet(this, _RedisSocket_instances, "m", _RedisSocket_connect).call(this, 0, true).catch(() => {
        // the error was already emitted, silently ignore it
    });
};
