var botId          = "st-007da037-67f9-55c3-bf93-6272ca639359";
var botName        = "Book a Cab";
var sdk            = require("./lib/sdk");
var Promise        = sdk.Promise;
var config         = require("./config");
var mockServiceUrl = config.examples.mockServicesHost + '/cabbot';
var { makeHttpCall } = require("./makeHttpCall");

/*
 * This example showcases the 2 different ways to use the webhook node:
 *  Synchronously (FindNearbyCabs)
 *  Asynchronously (BookTheCab)
 */

//Make request to mockservice app
function findCabs(/*userLoc*/) {
    return new Promise(function(resolve, reject) {
        makeHttpCall(
            'get',
            mockServiceUrl + '/findcabs'
        )
        .then(function(res) {
            resolve(res.data);
        }).catch(function(err) {
            return reject(err);
        })
    });
}

/*
 * Make request to mock service app, and call 'on_success' or 'on_failure' callback
 */
function cabBookingService(requestId, cabId, userLoc, destination, callbacks) {
    return new Promise(function(resolve, reject) {
        makeHttpCall(
            'post',
            mockServiceUrl + '/findcabs',
            {
                requestId   : requestId,
                cabId       : cabId,
                loc         : userLoc,
                destination : destination
            },
            {
                'content-type' : 'application/json'
            }
        )
        .then(function(res) {
            if (res.data && res.data.success) {
                callbacks.on_success(requestId);
                return;
            } else {
                callbacks.on_failure(requestId);
            }
            resolve(res);
        })
        .catch(function(err){
            return reject(err);
        })
    });
}

/*/
 * Responds to the webhook asynchronously with the success flag.
 */
function onBookingSuccess(requestId) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            data.context.bookedCab = data.entities.selectedCab;
            data.context.successful = true;

            sdk.respondToHook(data);
        });
}

function onBookingFailure(requestId) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            data.context.successful = false;

            sdk.respondToHook(data);
        });
}

//call cabBookingService with the requestId. This service is expected to respond asynchronously.
//'requestId' must be passed along all asynchronous flows, to allow the BotKit to respond
// back to the hook once the async process is completed.
function bookTheCab(requestId, cabId, userLoc, destination) {
    cabBookingService(requestId, cabId, userLoc, destination, {
        on_success : onBookingSuccess,
        on_failure : onBookingFailure
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

        if (componentName === 'FindNearbyCabs') {
            findCabs()
                .then(function(cabList) {
                    context.cabList = cabList;
                    callback(null, data);
                });
        } else if (componentName === 'BookTheCab') {
            sdk.saveData(requestId, data)
                .then(function() {
                    bookTheCab(requestId, context.entities.selectedCab.id, context.session.UserSession.location, context.entities.whereTo);
                    callback(null, new sdk.AsyncResponse());
                });
        }
    }
};
