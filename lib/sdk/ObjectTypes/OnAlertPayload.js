var BasePayload = require('./BasePayload.js');
var util        = require('util');

function OnAlertPayload(requestId, botId, componentId, opts){
    BasePayload.call(this, requestId, botId, componentId);
    this.payloadClassName   = 'OnAlertPayload';
    this._originalPayload   = opts;

    var sendUserMessageUrl  = opts.sendUserMessageUrl;
    this.sendUserMessageUrl = sendUserMessageUrl;
    var sendBotMessageUrl   = opts.sendBotMessageUrl;
    this.sendBotMessageUrl  = sendBotMessageUrl;
    var skipUserMessageUrl  = opts.skipUserMessageUrl;
    this.skipUserMessageUrl = skipUserMessageUrl;
    var skipBotMessageUrl   = opts.skipBotMessageUrl;
    this.skipBotMessageUrl  = skipBotMessageUrl;
    var sendAlertMessageUrl = opts.sendAlertMessageUrl;
    this.sendAlertMessageUrl= sendAlertMessageUrl;
    this.resetBotUrl        = opts.resetBotUrl;
    this.getBotVariableUrl  = opts.getBotVariableUrl;
    this.metaInfo           = opts.metaInfo;
    this.baseUrl            = opts.baseUrl;
    this.context            = opts.context;
    this.message            = opts.message;
    this.channel            = opts.channel;
    this.metaTags           = opts.metaTags;
    this.messageObject      = opts.messageObject;
    var clearConversationSessionUrl   = opts.clearConversationSessionUrl;
    this.clearConversationSessionUrl  = clearConversationSessionUrl;
    this.sendFeedbackMessageUrl       = opts.sendFeedbackMessageUrl;
    this.toJSON = function() {
        return {
            __payloadClass     : 'OnAlertPayload',
            requestId          : requestId,
            botId              : botId,
            componentId        : componentId,
            sendUserMessageUrl : sendUserMessageUrl,
            sendBotMessageUrl  : sendBotMessageUrl,
            sendAlertMessageUrl: sendAlertMessageUrl,
            skipUserMessageUrl : skipUserMessageUrl,
            skipBotMessageUrl  : skipBotMessageUrl,
            getBotVariableUrl  : this.getBotVariableUrl,
            context            : this.context,
            channel            : this.channel,
            baseUrl            : this.baseUrl,
            isTemplate         : this.isTemplate,
            message            : this.message,
            metaInfo           : this.metaInfo,
            formattedMessage   : this.formattedMessage,
            overrideMessagePayload : this.overrideMessagePayload,
            metaTags           : this.metaTags,
            messageObject      : this.messageObject,
            sendFeedbackMessageUrl  : this.sendFeedbackMessageUrl
        };
    };
}

util.inherits(OnAlertPayload, BasePayload);

module.exports = OnAlertPayload;
