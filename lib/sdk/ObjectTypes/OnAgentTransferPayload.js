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
    var skipUserMessageUrl  = opts.skipUserMessageUrl;
    this.skipUserMessageUrl = skipUserMessageUrl;
    var skipBotMessageUrl   = opts.skipBotMessageUrl;
    this.skipBotMessageUrl  = skipBotMessageUrl;
    this.getBotVariableUrl  = opts.getBotVariableUrl;
    this.metaInfo           = opts.metaInfo;
    this.resetBotUrl        = opts.resetBotUrl;
    this.baseUrl            = opts.baseUrl;
    var clearConversationSessionUrl   = opts.clearConversationSessionUrl;
    this.clearConversationSessionUrl  = clearConversationSessionUrl;
    this.metaTags = opts.metaTags;
    this.messageObject      = opts.messageObject;
    this.sendFeedbackMessageUrl = opts.sendFeedbackMessageUrl;
    
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
            skipUserMessageUrl : skipUserMessageUrl,
            skipBotMessageUrl  : skipBotMessageUrl,
            getBotVariableUrl:this.getBotVariableUrl,
            overrideMessagePayload: this.overrideMessagePayload,
            metaTags: this.metaTags,
            messageObject      : this.messageObject,
            sendFeedbackMessageUrl:this.sendFeedbackMessageUrl
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
