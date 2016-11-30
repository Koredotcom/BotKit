var invokeAPI = require("./invokePlatformAPIs");

module.exports = function(requestData, callback) {
    var callbackUrl = requestData.callbackUrl;

    return invokeAPI(callbackUrl, requestData)
    .nodeify(callback);
};
