var BasePayload = require('./BasePayload.js');
var util        = require('util');

function OnMessagePayload(requestId, botId, componentId, opts){
    BasePayload.call(this, requestId, botId, componentId);
    this.payloadClassName   = 'OnMessagePayload';
    this._originalPayload   = opts;
    this.getBotVariableUrl  = opts.getBotVariableUrl;
    var sendUserMessageUrl  = opts.sendUserMessageUrl;
    this.sendUserMessageUrl = sendUserMessageUrl;
    var sendBotMessageUrl   = opts.sendBotMessageUrl;
    this.sendBotMessageUrl  = sendBotMessageUrl;
    var skipUserMessageUrl  = opts.skipUserMessageUrl;
    this.skipUserMessageUrl = skipUserMessageUrl;
    var skipBotMessageUrl   = opts.skipBotMessageUrl;
    this.skipBotMessageUrl  = skipBotMessageUrl;
    var clearConversationSessionUrl   = opts.clearConversationSessionUrl;
    this.clearConversationSessionUrl  = clearConversationSessionUrl;
    this.resetBotUrl        = opts.resetBotUrl;
    this.baseUrl            = opts.baseUrl;
    this.metaInfo           = opts.metaInfo;
    this.context            = opts.context;
    this.channel            = opts.channel;
    this.message            = opts.message;
    this.agent_transfer     = opts.agent_transfer|| false;
    this.ackMessage         = true;
    this.metaTags           = opts.metaTags;
    this.messageObject      = opts.messageObject;
    this.sendFeedbackMessageUrl       = opts.sendFeedbackMessageUrl;
    this.toJSON = function() {
        return {
            __payloadClass     : 'OnMessagePayload',
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
            agent_transfer     : this.agent_transfer,
            baseUrl            : this.baseUrl,
            isTemplate         : this.isTemplate,
            metaInfo           : this.metaInfo,
            formattedMessage   : this.formattedMessage,
            overrideMessagePayload : this.overrideMessagePayload,
            ackMessage: this.ackMessage,
            metaTags:  this.metaTags,
            messageObject      : this.messageObject,
            sendFeedbackMessageUrl        : this.sendFeedbackMessageUrl

        };
    };
}

util.inherits(OnMessagePayload, BasePayload);

module.exports = OnMessagePayload;
