var invokeAPI = require("./invokePlatformAPIs");
var Promise = require("bluebird");

module.exports = {
    sendUserMessage: function(requestData, callback) {
        var url = requestData.sendUserMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    sendBotMessage: function(requestData, callback) {
        var url = requestData.sendBotMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    sendAlertMessage: function(requestData, callback) {
        var url = requestData.sendAlertMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    resetBot: function(requestData, callback) {
        var url = requestData.resetBotUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },

    startAgentSession: function(requestData, callback) {
        var url = requestData.baseUrl + '/startAgentSession/' + requestData.requestId;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },

    clearAgentSession: function(requestData, callback) {
        var url = requestData.baseUrl + '/clearAgentSession/' + requestData.requestId;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },

    getMessages: function(requestData, callback) {
        var limit = requestData.limit || 20;
        var offset = requestData.skip || 0;
        var userId = requestData.userId || requestData.channel.channelInfos.from;
        var url = requestData.baseUrl + '/getMessages?' + "skip=" + offset + "&limit=" + limit + "&userId=" + userId;

        return invokeAPI.get(url)
            .nodeify(callback);
    },

    extendRequestId : function(requestData,callback){
        var url = requestData.baseUrl+ '/extendcallid/' + requestData.requestId;

        return invokeAPI.post(url, requestData)
            .nodeify(callback);
    },

    fetchBotVariable: function(requestData, langArr, callback) {
        var url = requestData.getBotVariableUrl;
        return Promise.map(langArr, function(lang) {
            var options = {
                'headers': {
                    'bot-language': lang
                }
            };
            return invokeAPI.getWithOptions(url, options);
        }).nodeify(callback);
    },
    skipUserMessage: function(requestData, callback) {
        var url = requestData.skipUserMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    skipBotMessage: function(requestData, callback) {
        var url = requestData.skipBotMessageUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    clearConversationSession: function(requestData, callback) {
        var url = requestData.clearConversationSessionUrl;

        return invokeAPI.post(url, requestData.toJSON())
            .then(function() {})
            .nodeify(callback);
    },
    sendFeedbackMessage : function(requestData, payload, callback) {
        var url = requestData.sendFeedbackMessageUrl;
        return invokeAPI.post(url, {...requestData.toJSON(), ...{ feedbackData: payload}})
            .then(function() {})
            .nodeify(callback);
    }
};