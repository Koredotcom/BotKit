var request = require("request");
var Promise = require("bluebird");
var jwt     = require("jwt-simple");
var config  = require("../../../config");

function getSignedJWTToken() {
    return jwt.encode({
        appId: config.credentials.appId
    }, config.credentials.apikey);
}

module.exports = function(url, requestData, callback) {
    var reqOptions = {
        url     : url,
        method  : 'POST',
        headers : {
            'content-type' : 'application/json',
            'auth'         : getSignedJWTToken()
        },
        body    : JSON.stringify(requestData.toJSON())
    };

    return new Promise(function(resolve, reject) {
        request(reqOptions, function(err, res) {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    })
    .nodeify(callback);
};
