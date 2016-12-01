var invokeAPI = require("./invokePlatformAPIs");

module.exports = {
    sendUserMessage : function(requestData, callback) {
        var url = requestData.sendUserMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .nodeify(callback);
    },
    sendBotMessage : function(requestData, callback) {
        var url = requestData.sendBotMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .nodeify(callback);
    }
};
