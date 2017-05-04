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
    },
    
   startAgentSession : function(requestData, callback) {
        var url = requestData.baseUrl+ '/startAgentSession/' + requestData.requestId;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    
   clearAgentSession : function(requestData, callback) {
        var url = requestData.baseUrl+ '/clearAgentSession/' + requestData.requestId;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    
   getMessages : function(requestData, callback) {
       var limit = requestData.limit || 20;
       var offset = requestData.skip || 0;
       var userId = requestData.userId || requestData.channel.channelInfos.from;
       var url = requestData.baseUrl+ '/getMessages?' + "skip="+offset+ "&limit="+limit  + "&userId=" +userId;

       return invokeAPI.get(url)
            .nodeify(callback);
    }



};
