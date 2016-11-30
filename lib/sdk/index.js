var Promise               = require("bluebird");
var crypto                = require("crypto");
var EventMappings         = require("./EventMappings");
var ObjectTypes           = require("./ObjectTypes");
var AsyncResponse         = ObjectTypes.AsyncResponse;
var errors                = require("../app/errors");
var requestStore          = require("./lib/requestStore");
var sendAsyncResponse     = require("./lib/sendAsyncResponse");
var invokeCallback        = require("./lib/invokeCallback");
var invokeSendMessage     = require("./lib/invokeSendMessageAPIs.js");
var invokeSendUserMessage = invokeSendMessage.sendUserMessage;
var invokeSendBotMessage  = invokeSendMessage.sendBotMessage;
var customErrors          = require("./sdkerrors");
errors.registerErrors(customErrors);

var bots = {
};

function getBotHandler(botId) {
    return bots[botId] || bots['default'];
}

function genReqId() {
    return crypto.randomBytes(16).toString('hex');
}

function runComponentHandler(botId, componentId, eventName, reqPayload) {
    var botHandler = getBotHandler(botId);
    if (!EventMappings[eventName]) {
        return Promise.reject(new errors.NotFound('Event not found'));
    }

    reqPayload.requestId = reqPayload.requestId || genReqId();

    var eventHandler = Promise.promisify(botHandler[EventMappings[eventName].callback]);
    var ObjectType   = ObjectTypes[EventMappings[eventName].payload_class_name];
    var request      = new ObjectType(reqPayload.requestId, botId, componentId, reqPayload);

    return Promise.try(function() {
        return eventHandler(request.requestId, request)
            .then(function(response) {
                if (!(response instanceof ObjectType) && !(response instanceof AsyncResponse)) {
                    console.error('Invalid Response Type.');
                    throw new Error('Invalid return type.');
                }
                return response;
            });
    })
    .then(function(response) {
        if (response instanceof AsyncResponse) {
           return sendAsyncResponse(request, response);
        }
        return response.toJSON();
    });
}

module.exports = {
    runComponentHandler   : runComponentHandler,
    Promise               : Promise,
    errors                : errors,
    registerBot           : function(bot) {
        if (!bot.botId) {
            throw new Error('Missing parameter: botId');
        }
        bots[bot.botId] = bot;
    },


    saveData              : requestStore.saveRequest,
    getSavedData          : requestStore.getRequestData,


    AsyncResponse         : AsyncResponse,
    respondToHook         : function(request, callback) {
        return requestStore.getRequestData(request.requestId)
            .then(function(requestData) {
                if (!requestData) {
                    return Promise.reject(new errors.NotFound('Request not found in request store'));
                }
                return invokeCallback(request);
            })
            .tap(function() {
                return requestStore.removeRequest(request);
            })
            .nodeify(callback);
    },


    sendUserMessage       : function(request, callback) {
        if (!request.sendUserMessageUrl) {
            throw new errors.InvalidArguments('send user message url is missing');
        }

        return invokeSendUserMessage(request)
            .nodeify(callback);
    },
    sendBotMessage        : function(request, callback) {
        if (!request.sendBotMessageUrl) {
            throw new errors.InvalidArguments('send bot message url is missing');
        }

        return invokeSendBotMessage(request)
            .nodeify(callback);
    }
};
