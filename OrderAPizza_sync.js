var botId          = "st-c25b022b-c979-5d63-95b1-0045ee45b0ba";
var botName        = "OrderPizza";
var sdk            = require("./lib/sdk");

/*
 * This is the Sync version of OrderAPizza.js.
 *
 * The webhook to PlaceOrder is responding syncronously.
 */

module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : function(requestId, data, callback) {
        sdk.sendBotMessage(data, callback);
    },
    on_bot_message  : function(requestId, data, callback) {
        sdk.sendUserMessage(data, callback);
    },
    on_webhook      : function(requestId, data, componentName, callback) {
        if (componentName === 'PlaceOrder') {
            sdk.saveData(requestId, data)
                .then(function() {
                    //Place the order.
                    data.success = 'true';
                    callback(null, data);
                });
        }
    }
};
