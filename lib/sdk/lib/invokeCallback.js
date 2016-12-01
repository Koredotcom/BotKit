var invokeAPI = require("./invokePlatformAPIs");

module.exports = function(requestData, callback) {
    var callbackUrl = requestData.callbackUrl;

    return invokeAPI.post(callbackUrl, requestData.toJSON())
    .nodeify(callback);
};
