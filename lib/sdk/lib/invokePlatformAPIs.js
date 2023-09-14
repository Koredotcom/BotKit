var request = require("request");
var Promise = require("bluebird");
var jwt = require("jwt-simple");
var config = require("../../../config");
var { get, extend, has, isEmpty, set, clone } = require('lodash');

function getSignedJWTToken(botId) {
    var appId, apiKey, jwtAlgorithm, jwtExpiry;
    var defAlg = "HS256";

    if (config.credentials[botId]) {
        appId = config.credentials[botId].appId;
        apiKey = config.credentials[botId].apikey;
    } else {
        appId = config.credentials.appId;
        apiKey = config.credentials.apikey;
    }

    if (config.jwt[botId]) {
        jwtAlgorithm = config.jwt[botId].jwtAlgorithm;
        jwtExpiry = config.jwt[botId].jwtExpiry;
    } else {
        jwtAlgorithm = config.jwt.jwtAlgorithm;
        jwtExpiry = config.jwt.jwtExpiry;
    }

    return jwt.encode({ 
        appId: appId, 
        exp: Date.now()/1000 + (jwtExpiry || 60) //set the default expiry as 60 seconds
    }, apiKey, (jwtAlgorithm || defAlg));
}

function makeRequest(url, method, body, opts) {
    var botId = url.split("/")[6];
    var headers;
    var reqOptions = {
        url: url,
        method: method
    };
    
    opts    = opts || {};
    headers = opts.headers || {};
    headers['content-type'] = 'application/json';

    headers.auth = getSignedJWTToken(botId);

    extend(headers, clone(get(config, 'headers', {})));

    if (!has(headers, 'user-agent') || isEmpty(get(headers, 'user-agent', ''))) {
        set(headers, 'user-agent','Kore/BotKit');
    }

    reqOptions.headers = headers;

    if (body) {
        reqOptions.body = body;
    }
    reqOptions.json = true;

    return new Promise(function(resolve, reject) {
        request(reqOptions, function(err, res) {
            if (err) {
                return reject(err);
            }
            return resolve(res.body);
        });
    });
}

module.exports = {
    post: function(url, body, callback) {
        return makeRequest(url, 'post', body)
            .nodeify(callback);
    },
    get: function(url, callback) {
        return makeRequest(url, 'get')
            .nodeify(callback);
    },
    getWithOptions: function(url, opts, callback) {
        return makeRequest(url, 'get', undefined, opts)
            .nodeify(callback);
    }

};
