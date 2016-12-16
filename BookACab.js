var botId   = "st-007da037-67f9-55c3-bf93-6272ca639359";
var botName = "Book a Cab";
var sdk     = require("./lib/sdk");
var Promise = sdk.Promise;

var cabList = [
    {
        driverName : "Ayrton Senna",
        carModel   : "Toyota Corolla",
        timeAway   : "2 minutes",
        price      : "1",
    },
    {
        driverName : "Michael Schumacher",
        carModel   : "Mercedes E-Class",
        timeAway   : "7 minutes",
        price      : "3",
    },
    {
        driverName : "Lewis Hamilton",
        carModel   : "Tata Indica",
        timeAway   : "5 minutes",
        price      : "0.5",
    },
    {
        driverName : "Sebastian Vettel",
        carModel   : "Lamborghini",
        timeAway   : "10 minutes",
        price      : "10",
    }
];

function findCabs(/*userLoc*/) {
    return Promise.resolve(cabList);
}

function cabBookingService(/*requestId, cabId, userLoc, destination, callbacks*/) {
    //Makes cab booking request
}

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
