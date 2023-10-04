var Promise = require("bluebird");
var jwt = require("jwt-simple");
var config = require("../../../config");
var { makeHttpCall } = require("../../../makeHttpCall");

function getSignedJWTToken(botId) {
    var appId, apiKey;
    if (config.credentials[botId]) {
        appId = config.credentials[botId].appId;
        apiKey = config.credentials[botId].apikey;
    } else {
        appId = config.credentials.appId;
        apiKey = config.credentials.apikey;
    }
    return jwt.encode({ 
        appId: appId, 
        exp: Date.now()/1000 + (config.jwt_expiry || 60) //set the default expiry as 60 seconds
    }, apiKey);
}

function makeRequest(url, method, body, opts) {
    var botId = url.split("/")[6];
    var headers;
    opts    = opts || {};
    headers = opts.headers || {};
    headers['content-type'] = 'application/json';
    headers.auth = getSignedJWTToken(botId);

    return new Promise(function(resolve, reject) {
        makeHttpCall(method, url, body, headers)
        .then(function(res) {
            return resolve(res.data);
        })
        .catch(function(err) {
            return reject(err);
        })
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

