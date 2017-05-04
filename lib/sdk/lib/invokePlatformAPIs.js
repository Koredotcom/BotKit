var request = require("request");
var Promise = require("bluebird");
var jwt     = require("jwt-simple");
var config  = require("../../../config");

function getSignedJWTToken() {
    return jwt.encode({
        appId: config.credentials.appId
    }, config.credentials.apikey);
}

function makeRequest(url, method, body) {
    var reqOptions = {
        url     : url,
        method  : method,
        headers : {
            'content-type' : 'application/json',
            'auth'         : getSignedJWTToken()
        }
    };
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
    post : function(url, body, callback) {
        return makeRequest(url, 'post', body)
            .nodeify(callback);
    },
    get  : function(url, callback) {
        return makeRequest(url, 'get')
            .nodeify(callback);
    }
};
