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
    this.resetBotUrl        = opts.resetBotUrl;
    this.baseUrl            = opts.baseUrl;
    this.context            = opts.context;
    this.channel            = opts.channel;
    this.event              = opts.event;
    this.agent_transfer     = opts.agent_transfer|| false;
    this.toJSON = function() {
        return {
            __payloadClass     : 'OnEventPayload',
            requestId          : requestId,
            botId              : botId,
            componentId        : componentId,
            sendUserMessageUrl : sendUserMessageUrl,
            sendBotMessageUrl  : sendBotMessageUrl,
            context            : this.context,
            channel            : this.channel,
            event              : this.event,
            agent_transfer     : this.agent_transfer,
            baseUrl            : this.baseUrl,
            isTemplate         : this.isTemplate,
            metaInfo           : this.metaInfo,
            formattedMessage   : this.formattedMessage,
            overrideMessagePayload : this.overrideMessagePayload
        };
    };
}

util.inherits(OnEventPayload, BasePayload);

module.exports = OnEventPayload;
