var botId = "st-guess-the-number-bot";
var botName = "Guess the number";
var sdk = require("./lib/sdk");

function generateRandomNumber() {
    return Math.ceil((Math.random()*100));
}

module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : function(requestId, data, callback) {
        sdk.sendBotMessage(data, callback);
    },
    on_bot_message  : function(requestId, data, callback) {
        var message;

        if (data.context.guess) {
            if (data.context.guess.isMore) {
                message = "Lesser than that";
            } else if (data.context.guess.isLess) {
                message = "More than that";
            } else if (data.context.guess.isCorrect) {
                message = "That is correct! You just took " + data.context.guessCount + " guesses!" ;
            }
        } else if (data.context.theNumber) {
            message = "I have a number between 1 & 100. Try and guess it!";
        }

        if (message) {
            data.message = message;
        }
        sdk.sendUserMessage(data, callback);
    },
    on_webhook    : function(requestId, data, componentName, callback) {
        var context  = data.context;
        var entities = context.entities || {};

        if (componentName === 'GenerateNewNumber') {
            context.theNumber = generateRandomNumber();
            context.guessCount = 0;
        } else if (componentName === 'GuessingTheNumber') {
            var guessedNumber = Number(entities.guessedNumber);
            context.guess = {};

            if (context.theNumber > guessedNumber) {
                context.guess.isLess    = "true";
            } else if (context.theNumber < guessedNumber) {
                context.guess.isMore    = "true";
            } else if (context.theNumber === guessedNumber) {
                context.guess.isCorrect = "true";
            }
            context.guessCount++;
        }

        callback(null, data);
    }
};
