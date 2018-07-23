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
    var sendAlertMessageUrl = opts.sendAlertMessageUrl;
    this.sendAlertMessageUrl= sendAlertMessageUrl;
    this.resetBotUrl        = opts.resetBotUrl;
    this.getBotVariableUrl  = opts.getBotVariableUrl;
    this.metaInfo           = opts.metaInfo;
    this.baseUrl            = opts.baseUrl;
    this.context            = opts.context;
    this.message            = opts.message;
    this.channel            = opts.channel;
    this.toJSON = function() {
        return {
            __payloadClass     : 'OnAlertPayload',
            requestId          : requestId,
            botId              : botId,
            componentId        : componentId,
            sendUserMessageUrl : sendUserMessageUrl,
            sendBotMessageUrl  : sendBotMessageUrl,
            sendAlertMessageUrl: sendAlertMessageUrl,
            getBotVariableUrl  : this.getBotVariableUrl,
            context            : this.context,
            channel            : this.channel,
            baseUrl            : this.baseUrl,
            isTemplate         : this.isTemplate,
            message            : this.message,
            metaInfo           : this.metaInfo,
            formattedMessage   : this.formattedMessage,
            overrideMessagePayload : this.overrideMessagePayload
        };
    };
}

util.inherits(OnAlertPayload, BasePayload);

module.exports = OnAlertPayload;
