var botId          = "st-007da037-67f9-55c3-bf93-6272ca639359";
var botName        = "Book a Cab";
var sdk            = require("./lib/sdk");
var Promise        = sdk.Promise;
var request        = require("request");
var config         = require("./config");
var mockServiceUrl = config.examples.mockServicesHost + '/cabbot';


/*
 * This example is the sync version of 'BookACab.js'. Both the webhook calls in this are responding syncly
 */
function findCabs(/*userLoc*/) {
    return new Promise(function(resolve, reject) {
        request({
            url: mockServiceUrl + '/findcabs',
            method: 'get',
        }, function(err, res) {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
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
                    //Assuming the cab booking was successful. A mock service to book the cab can be called here.
                    data.successful = 'true';
                    data.bookedCab = context.entities.selectedCab || {};
                    callback(null, data);
                });
        }
    }
};
