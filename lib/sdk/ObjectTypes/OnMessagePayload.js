var BasePayload = require('./BasePayload.js');
var util        = require('util');

function OnMessagePayload(requestId, botId, componentId, opts){
    BasePayload.call(this, requestId, botId, componentId);
    this.payloadClassName   = 'OnMessagePayload';
    this._originalPayload   = opts;

    var sendUserMessageUrl  = opts.sendUserMessageUrl;
    this.sendUserMessageUrl = sendUserMessageUrl;
    var sendBotMessageUrl   = opts.sendBotMessageUrl;
    this.sendBotMessageUrl  = sendBotMessageUrl;

    this.context            = opts.context;
    this.channel            = opts.channel;
    this.message            = opts.message;

    this.toJSON = function() {
        return {
            __payloadClass     : 'OnMessagePayload',
            requestId          : requestId,
            botId              : botId,
            componentId        : componentId,
            sendUserMessageUrl : sendUserMessageUrl,
            sendBotMessageUrl  : sendBotMessageUrl,
            context            : this.context,
            channel            : this.channel,
            message            : this.message
        };
    };
}

util.inherits(OnMessagePayload, BasePayload);

module.exports = OnMessagePayload;
