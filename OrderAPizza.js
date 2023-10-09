var botId          = "st-c25b022b-c979-5d63-95b1-0045ee45b0ba";
var botName        = "OrderPizza";
var sdk            = require("./lib/sdk");
var Promise        = sdk.Promise;
var { makeHttpCall } = require("./makeHttpCall");
var config         = require("./config");
var mockServiceUrl = config.examples.mockServicesHost + '/pizzabot';

/*
 * This example showcases the async capability of webhook nodes
 *
 * 'placeOrderToStore' method is called in the PlaceOrder webhook.
 * This service responds asyncronously
 */
function placeOrderToStore(requestId, storeId, order, callbacks) {
    return new Promise(function(resolve, reject) {
        let data = {
            requestId : requestId,
            storeId   : storeId,
            order     : order
        }
        let headers = {
            'content-type' : 'application/json'
        }
        makeHttpCall(
            'post',
            mockServiceUrl + '/',
            data,
            headers
        )
        .then(function(res) {
            if (res.data && res.data.success) {
                callbacks.on_success(requestId, res.data);
                return;
            } else {
                callbacks.on_failure(requestId);
            }
            resolve(res);
        })
        .catch(function(err) {
            return reject(err);
        })
    });
}

function onOrderConfirmationSuccess(requestId, resBody) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            data.context.orderReferenceId = resBody.orderReferenceId;
            data.context.successful = true;

            sdk.respondToHook(data);
        });
}

function onOrderConfirmationFailure(requestId) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            data.context.successful = false;

            sdk.respondToHook(data);
        });
}

function placeOrder(requestId, storeId, order) {
    placeOrderToStore(requestId, storeId, order, {
        on_success : onOrderConfirmationSuccess,
        on_failure : onOrderConfirmationFailure
    });
}

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
        var context = data.context;

        if (componentName === 'PlaceOrder') {
            var order = context.order;
            var storeId = context.storeId;

            sdk.saveData(requestId, data)
                .then(function() {
                    placeOrder(requestId, storeId, {
                        order       : order,
                        userDetails : {
                            address : context.entities.address,
                            phoneNo : context.entities.phoneNo
                        }
                    });
                    callback(null, new sdk.AsyncResponse());
                });
        }
    }
};
