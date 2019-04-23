var BasePayload           = require('./BasePayload.js');
var DialogObject          = require('./DialogObject');
var util                  = require('util');
var getDialogFromPlatform = require("../lib/getDialog");
var errors                = require("../../app/errors");
var Promise               = require("bluebird");

function OnAgentTransferPayload(requestId, botId, componentId, opts) {
    BasePayload.call(this, requestId, botId, componentId);
    this.payloadClassName = 'OnAgentTransferPayload';
    this._originalPayload = opts;

    var callbackUrl       = opts.callbackUrl;
    this.callbackUrl      = opts.callbackUrl;

    this.context          = opts.context;
    this.channel          = opts.channel;

    var sendUserMessageUrl  = opts.sendUserMessageUrl;
    this.sendUserMessageUrl = sendUserMessageUrl;
    var sendBotMessageUrl   = opts.sendBotMessageUrl;
    this.sendBotMessageUrl  = sendBotMessageUrl;
    this.getBotVariableUrl  = opts.getBotVariableUrl;
    this.metaInfo           = opts.metaInfo;
    this.resetBotUrl        = opts.resetBotUrl;
    this.baseUrl            = opts.baseUrl;
    
    this.toJSON = function() {
        return {
            __payloadClass : 'OnAgentTransferPayload',
            requestId      : requestId,
            botId          : botId,
            callbackUrl    : callbackUrl,
            context        : this.context,
            message        : this.message,
            channel        : this.channel,
            baseUrl        : this.baseUrl,
            sendUserMessageUrl : sendUserMessageUrl,
            sendBotMessageUrl  : sendBotMessageUrl,
            getBotVariableUrl:this.getBotVariableUrl,
            overrideMessagePayload: this.overrideMessagePayload
        };
    };

    this.getDialog = function(callback) {
        var self = this;
        if (!opts.getDialogUrl) {
            throw new errors.InsufficientArguments();
        }
        if (self.dialog) {
            return Promise.resolve(self.dialog)
                .nodeify(callback);
        }

        return getDialogFromPlatform(opts.getDialogUrl)
            .then(function(dialog) {
                self.dialog = new DialogObject(dialog);
                return self.dialog;
            })
            .nodeify(callback);
    };
}

util.inherits(OnAgentTransferPayload, BasePayload);

module.exports = OnAgentTransferPayload;
