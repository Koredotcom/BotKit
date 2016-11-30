var invokeAPI = require("./invokePlatformAPIs");

module.exports = {
    sendUserMessage : function(requestData, callback) {
        var url = requestData.sendUserMessageUrl;

        return invokeAPI(url, requestData)
            .nodeify(callback);
    },
    sendBotMessage : function(requestData, callback) {
        var url = requestData.sendBotMessageUrl;

        return invokeAPI(url, requestData)
            .nodeify(callback);
    }
};
