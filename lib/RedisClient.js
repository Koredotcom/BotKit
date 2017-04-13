/**
 * @module RedisClient
 * helper to create redis client
 */

var redis = require('redis');
var debug = require('debug')('redisclient');
var defaults = ((typeof config === 'object') && config.redis) ?
            config.redis.common
            : {'errorlistener': true};

var redis_client_cache = {};

function errorlistener (e) {
    if (!debug.enabled) console.log(e.stack);
    else debug(e);
}

/**
 * create a redis client with given options
 * falling back to defaults otherwise
 *
 * @param {Object}    opts
 * @param {Object}    [opts.redis=redis] - redis client library
 * @param {Function}  [opts.errorlistener=errorlistener]
 * @param {String}    [opts.name] - name of the service
 * @param {Object}    [opts.options={}] - options for redis.createClient
 * @param {String}    [cache_key] - if provided, cache the redis client with the given cache_key
 *
 * @returns {Object}  RedisClient
 */
function createClient (opts, cache_key) {

    if ((typeof cache_key === 'string') && (redis_client_cache[cache_key] !== undefined)) {
        debug('using %s redis client', cache_key);
        return redis_client_cache[cache_key];
    }

    if (!opts) opts = defaults;

    //use version of redis library passed by caller if provided
    opts.redis = opts.redis || redis;
    opts.options = opts.options || defaults.options;

    var client = opts.redis.createClient(
            opts.options.port,
            opts.options.host,
            opts.options);

    //if errors like connection reset should not cause crash,
    //set opts.errorlistener to true to use default errorlistener
    //or provide a custom errorlistener via options
    if (opts.errorlistener) {
        if (typeof opts.errorlistener !== 'function')
            opts.errorlistener = errorlistener;
        client.on('error', opts.errorlistener);
    }

    if (typeof cache_key === 'string' && (redis_client_cache[cache_key] === undefined)) {
        debug('caching redis client %s', cache_key);
        redis_client_cache[cache_key] = client;
    }

    return client;
}

exports.createClient = createClient;
