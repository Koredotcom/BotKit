var invokeAPI = require("./invokePlatformAPIs");

module.exports = {
    sendUserMessage : function(requestData, callback) {
        var url = requestData.sendUserMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    sendBotMessage : function(requestData, callback) {
        var url = requestData.sendBotMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    resetBot : function(requestData, callback) {
        var url = requestData.resetBotUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    }

};
