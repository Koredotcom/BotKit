var BasePayload = require('./BasePayload.js');
var util        = require('util');

function OnVariableUpdate(requestId, botId, componentId, opts){
    BasePayload.call(this, requestId, botId, componentId);
    this.payloadClassName   = 'OnVariableUpdate';
    this._originalPayload   = opts;
    this.resetBotUrl        = opts.resetBotUrl;
    this.baseUrl            = opts.baseUrl;
    this.metaInfo           = opts.metaInfo;
    this.context            = opts.context;
    this.channel            = opts.channel;
    this.message            = opts.message;
    this.eventType          = opts.data.eventType;
    this.variable           = opts.data.variable;
    this.language           = opts.data.language;
    this.getBotVariableUrl  = opts.getBotVariableUrl;
    this.agent_transfer     = opts.agent_transfer|| false;
    var sendUserMessageUrl  = opts.sendUserMessageUrl;
    this.sendUserMessageUrl = sendUserMessageUrl;
    var sendBotMessageUrl   = opts.sendBotMessageUrl;
    this.sendBotMessageUrl  = sendBotMessageUrl;
    var skipUserMessageUrl  = opts.skipUserMessageUrl;
    this.skipUserMessageUrl = skipUserMessageUrl;
    var skipBotMessageUrl   = opts.skipBotMessageUrl;
    this.skipBotMessageUrl  = skipBotMessageUrl;
    this.resetBotUrl        = opts.resetBotUrl;
    this.ackMessage         = true;
    this.metaTags           = opts.metaTags;
    var clearConversationSessionUrl   = opts.clearConversationSessionUrl;
    this.clearConversationSessionUrl  = clearConversationSessionUrl;
    this.messageObject      = opts.messageObject;
    this.sendFeedbackMessageUrl        = opts.sendFeedbackMessageUrl;

    this.toJSON = function() {
        return {
            __payloadClass     : 'OnVariableUpdate',
            requestId          : requestId,
            botId              : botId,
            componentId        : componentId,
            context            : this.context,
            channel            : this.channel,
            message            : this.message,
            variable           : this.variable,
            eventType          : this.eventType,
            getBotVariableUrl  : this.getBotVariableUrl,
            sendBotMessageUrl  : this.sendBotMessageUrl,
            sendUserMessageUrl : this.sendUserMessageUrl,
            skipBotMessageUrl  : this.skipBotMessageUrl,
            skipUserMessageUrl : this.skipUserMessageUrl,
            resetBotUrl        : this.resetBotUrl,
            language           : this.language,
            agent_transfer     : this.agent_transfer,
            baseUrl            : this.baseUrl,
            ackMessage         : this.ackMessage,
            metaTags           : this.metaTags,
            messageObject      : this.messageObject,
            sendFeedbackMessageUrl        : this.sendFeedbackMessageUrl
        };
    };
}

util.inherits(OnVariableUpdate, BasePayload);

module.exports = OnVariableUpdate;
