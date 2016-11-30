var BasePayload = require('./BasePayload.js');
var util        = require('util');

function OnHookPayload(requestId, botId, componentId, opts){
    BasePayload.call(this, requestId, botId, componentId);
    this.payloadClassName = 'OnHookPayload';
    this._originalPayload = opts;

    var callbackUrl       = opts.callbackUrl;
    this.callbackUrl      = opts.callbackUrl;

    this.context          = opts.context;
    this.channel          = opts.channel;
    this.message          = opts.message;
    var componentName     = opts.dialogComponentName;
    this.componentName    = opts.dialogComponentName;

    this.toJSON = function() {
        return {
            __payloadClass : 'OnHookPayload',
            requestId      : requestId,
            botId          : botId,
            componentId    : componentId,
            componentName  : componentName,
            callbackUrl    : callbackUrl,
            context        : this.context,
            channel        : this.channel,
            message        : this.message
        };
    };
}

util.inherits(OnHookPayload, BasePayload);

module.exports = OnHookPayload;
