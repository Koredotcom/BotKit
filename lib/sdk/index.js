var Promise                 = require("bluebird");
var crypto                  = require("crypto");
var EventMappings           = require("./EventMappings");
var ObjectTypes             = require("./ObjectTypes");
var AsyncResponse           = ObjectTypes.AsyncResponse;
var errors                  = require("../app/errors");
var invokeCallback          = require("./lib/invokeCallback");
var invokeSendMessage       = require("./lib/invokeSendMessageAPIs.js");
var invokeSendUserMessage   = invokeSendMessage.sendUserMessage;
var invokeSendBotMessage    = invokeSendMessage.sendBotMessage;
var invokeSendAlertMessage  = invokeSendMessage.sendAlertMessage;
var invokeResetBot          = invokeSendMessage.resetBot;
var invokeClearAgentSession = invokeSendMessage.clearAgentSession;
var invokeStartAgentSession = invokeSendMessage.startAgentSession;
var getMessages             = invokeSendMessage.getMessages;
var extendRequestId         = invokeSendMessage.extendRequestId;
var fetchBotVariable        = invokeSendMessage.fetchBotVariable;
var invokeSkipUserMessage   = invokeSendMessage.skipUserMessage;
var invokeSkipBotMessage    = invokeSendMessage.skipBotMessage;
var clearConversationSession= invokeSendMessage.clearConversationSession;
var invokeSendFeedbackMessage   = invokeSendMessage.sendFeedbackMessage;
var customErrors            = require("./sdkerrors");
var config                  = require("../../config");
var _                       = require('lodash');


errors.registerErrors(customErrors);

var bots = {
};

function getBotHandler(botId) {
    return bots[botId] || bots['default'];
}

function genReqId() {
    return crypto.randomBytes(16).toString('hex');
}

function sendAsyncResponse(){
    if(config.redis.available){
        var sendAsyncRsp     = require("./lib/sendAsyncResponse");
        return sendAsyncRsp.apply(this, arguments);
    } else {
        return Promise.reject(new errors.RedisNotAvailable());
    }
}

function runComponentHandler(botId, componentId, eventName, reqPayload) {
    var botHandler = getBotHandler(botId);
    if (!EventMappings[eventName]) {
        return Promise.reject(new errors.NotFound('Event not found'));
    }

    reqPayload.requestId = reqPayload.requestId || genReqId();

    var _event                  = EventMappings[eventName];
    var eventHandler            = _event.ackImmediately ? Promise.method(_.partialRight(botHandler[_event.callback], _.noop)) : Promise.promisify(botHandler[_event.callback]);
    var ObjectType              = ObjectTypes[_event.payload_class_name];
    var sendComponentNameInArgs = _event.sendComponentNameInArgs;

    var request      = new ObjectType(reqPayload.requestId, botId, componentId, reqPayload);
    return Promise.try(function() {
        var eventHandlerP = sendComponentNameInArgs ?
            eventHandler(request.requestId, request, request.componentName) :
            eventHandler(request.requestId, request);
        return eventHandlerP
            .then(function(response) {
                if (!_event.processResponse) {
                    return request;
                }
                if (response && (!(response instanceof ObjectType) && !(response instanceof AsyncResponse))) {
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
        var ret = {};
        ret.body = response && response.toJSON();
        ret.headers = {};
        ret.headers.supportsMessageAck = config.supportsMessageAck;
        return ret;
    });
}

function getRequestStore(){
    if(config.redis.available){
        return require("./lib/requestStore");
    } else {
        return {
            saveRequest: function(){return Promise.reject(new errors.RedisNotAvailable());},
            getRequestData: function(){return Promise.reject(new errors.RedisNotAvailable());},
            removeRequest: function(){return Promise.reject(new errors.RedisNotAvailable());}
        };
    }
}

function ensureArray(element){
    if(Array.isArray(element))
        return element;
    return [element];
}

module.exports = {
    runComponentHandler   : runComponentHandler,
    Promise               : Promise,
    errors                : errors,
    registerBot           : function(bot) {
        if (!bot.botId) {
            throw new Error('Missing parameter: botId');
        }
        bot.botId = ensureArray(bot.botId);
        bot.botId.map(function(botId){
            bots[botId] = bot;
        });
    },


    saveData              : getRequestStore().saveRequest,
    getSavedData          : getRequestStore().getRequestData,


    AsyncResponse         : AsyncResponse,
    respondToHook         : function(request, callback) {
        return getRequestStore().getRequestData(request.requestId)
            .then(function(requestData) {
                if (!requestData) {
                    return Promise.reject(new errors.NotFound('Request not found in request store'));
                }
                return invokeCallback(request);
            })
            .tap(function() {
                return getRequestStore().removeRequest(request);
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
    },

    sendAlertMessage        : function(request, callback) {
        if (!request.sendBotMessageUrl) {
            throw new errors.InvalidArguments('send bot message url is missing');
        }

        return invokeSendAlertMessage(request)
            .nodeify(callback);
    },

     resetBot        : function(request, callback) {
        if (!request.resetBotUrl) {
            throw new errors.InvalidArguments('reset bot url is missing');
        }

        return invokeResetBot(request)
            .nodeify(callback);
    },

     startAgentSession        : function(request, callback) {
        if (!request.baseUrl) {
            throw new errors.InvalidArguments('base bot url is missing');
        }

        return invokeStartAgentSession(request)
            .nodeify(callback);
    },

     clearAgentSession        : function(request, callback) {
        if (!request.baseUrl) {
            throw new errors.InvalidArguments('base bot url is missing');
        }

        return invokeClearAgentSession(request)
            .nodeify(callback);
    },

    getMessages: function(request, callback){
        if (!request.baseUrl) {
            throw new errors.InvalidArguments('base bot url is missing');
        }

        return getMessages(request)
            .nodeify(callback);
    },

    extendRequestId : function(request,callback){
        if (!request.baseUrl) {
            throw new errors.InvalidArguments('base bot url is missing');
        }

        return extendRequestId(request)
            .nodeify(callback);
    },

    fetchBotVariable: function(request,langArr, callback){
        if (!request.baseUrl) {
            throw new errors.InvalidArguments('base bot url is missing');
        }

        return fetchBotVariable(request,langArr)
        .nodeify(callback);
    },

    skipUserMessage : function(request, callback) {
        if (!request.skipUserMessageUrl) {
            throw new errors.InvalidArguments('skip user message url is missing');
        }

        return invokeSkipUserMessage(request)
            .nodeify(callback);
    },

    skipBotMessage : function(request, callback) {
        if (!request.skipBotMessageUrl) {
            throw new errors.InvalidArguments('skip bot message url is missing');
        }

        return invokeSkipBotMessage(request)
            .nodeify(callback);
    },
    clearConversationSession : function(request, callback) {
        if (!request.clearConversationSessionUrl) {
            throw new errors.InvalidArguments('clear conversation session url is missing');
        }

        return clearConversationSession(request)
            .nodeify(callback);
    },
    checkNodeVersion : function(){
        var clientNodeVersion = process.version.match(/^v(\d+\.\d+)/)[1];
        if(clientNodeVersion < _.get(config, "validations.leastNodeVersion", 10)){
            console.error("The BotKit SDK cannot be initiated. Please use the Node.js version 10.x or above.")
            process.exit(78);
        }
        return;
    },
    closeConversationSession : function(request, callback) {
        if (!request.clearConversationSessionUrl) {
            throw new errors.InvalidArguments('close conversation session url is missing');
        }

        return clearConversationSession(request)
            .nodeify(callback);
    },
    sendFeedbackMessage : function(request, payload, callback) {
        if (!request.sendFeedbackMessageUrl) {
            throw new errors.InvalidArguments('Feedback message url is missing');
        }
        if (!_.has(payload, "name") || !_.has(payload, "score")) {
            throw new errors.InvalidArguments('Missing Feedback Survey Details');
        }

        payload.botId = payload.streamId || request.streamId;
        payload.channelUId = payload.channelUId || _.get(request.body.channel, "from");
        payload.channel = payload.channel || _.get(request.body.channel, "type");
        payload.botLanguage  =  payload.botLanguage ||  _.get(request.body.channel, "botLanguage");
        payload.createdOn = payload.createdOn || new Date();

        return invokeSendFeedbackMessage(request, payload)
            .nodeify(callback);
    }


};
