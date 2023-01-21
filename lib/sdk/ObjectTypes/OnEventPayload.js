var BasePayload = require('./BasePayload.js');
var util        = require('util');

function OnEventPayload(requestId, botId, componentId, opts){
    BasePayload.call(this, requestId, botId, componentId);
    this.payloadClassName   = 'OnEventPayload';
    this._originalPayload   = opts;

    var sendUserMessageUrl  = opts.sendUserMessageUrl;
    this.sendUserMessageUrl = sendUserMessageUrl;
    var sendBotMessageUrl   = opts.sendBotMessageUrl;
    this.sendBotMessageUrl  = sendBotMessageUrl;
    var skipUserMessageUrl  = opts.skipUserMessageUrl;
    this.skipUserMessageUrl = skipUserMessageUrl;
    var skipBotMessageUrl   = opts.skipBotMessageUrl;
    this.skipBotMessageUrl  = skipBotMessageUrl;
    this.resetBotUrl        = opts.resetBotUrl;
    this.getBotVariableUrl  = opts.getBotVariableUrl;
    this.baseUrl            = opts.baseUrl;
    this.context            = opts.context;
    this.metaInfo           = opts.metaInfo;
    this.channel            = opts.channel;
    this.message            = opts.message;
    this.event              = opts.event;
    this.agent_transfer     = opts.agent_transfer|| false;
    this.metaTags           = opts.metaTags;
    this.messageObject      = opts.messageObject;
    var clearConversationSessionUrl   = opts.clearConversationSessionUrl;
    this.clearConversationSessionUrl  = clearConversationSessionUrl;
    this.sendFeedbackMessageUrl        = opts.sendFeedbackMessageUrl;
    this.toJSON = function() {
        return {
            __payloadClass     : 'OnEventPayload',
            requestId          : requestId,
            botId              : botId,
            componentId        : componentId,
            sendUserMessageUrl : sendUserMessageUrl,
            sendBotMessageUrl  : sendBotMessageUrl,
            skipUserMessageUrl : skipUserMessageUrl,
            skipBotMessageUrl  : skipBotMessageUrl,
            getBotVariableUrl  : this.getBotVariableUrl,
            context            : this.context,
            channel            : this.channel,
            message            : this.message,
            event              : this.event,
            agent_transfer     : this.agent_transfer,
            baseUrl            : this.baseUrl,
            isTemplate         : this.isTemplate,
            metaInfo           : this.metaInfo,
            formattedMessage   : this.formattedMessage,
            overrideMessagePayload : this.overrideMessagePayload,
            metaTags           : this.metaTags,
            messageObject      : this.messageObject,
            sendFeedbackMessageUrl        : this.sendFeedbackMessageUrl
        };
    };
}

util.inherits(OnEventPayload, BasePayload);

module.exports = OnEventPayload;
