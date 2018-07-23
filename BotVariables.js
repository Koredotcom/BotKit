var botId = "st-12345";
var botName = "testBot";

var sdk = require("./lib/sdk");
var botVariables = {};
var langArr = require('./config.json').languages;
var _ = require('lodash');
var dataStore = require('./dataStore.js').getInst();
var first = true;

/*
 * This is the most basic example of BotKit.
 *
 * It showcases how the BotKit can intercept the message being sent to the bot or the user.
 *
 * We can either update the message, or chose to call one of 'sendBotMessage' or 'sendUserMessage'
 */

module.exports = {
    botId: botId,
    botName: botName,

    on_user_message: function(requestId, data, callback) {
        fetchAllBotVariables(data);
        if (data.message === "Hi") {
            data.message = "Hello";
            //Sends back 'Hello' to user.
            return sdk.sendUserMessage(data, callback);
        } else if (!data.agent_transfer) {
            //Forward the message to bot
            return sdk.sendBotMessage(data, callback);
        } else {
            data.message = "Agent Message";
            return sdk.sendUserMessage(data, callback);
        }
    },
    on_bot_message: function(requestId, data, callback) {
        fetchAllBotVariables(data);
        if (data.message === 'hello') {
            data.message = 'The Bot says hello!';
        }
        //Sends back the message to user

        return sdk.sendUserMessage(data, callback);
    },
    on_agent_transfer: function(requestId, data, callback) {
        fetchAllBotVariables(data);
        return callback(null, data);
    },
    on_event: function(requestId, data, callback) {
        fetchAllBotVariables(data);
        return callback(null, data);
    },
    on_alert: function(requestId, data, callback) {
        fetchAllBotVariables(data);
        return sdk.sendAlertMessage(data, callback);
    },
    on_variable_update: function(requestId, data, callback) {
        var event = data.eventType;
        if (first || event == "bot_import" || event == "variable_import" || event == "sdk_subscription" || event == "language_enabled") {
            // fetch BotVariables List based on language specific when there is event subscription/bulkimport
            sdk.fetchBotVariable(data, langArr, function(err, response) {
                dataStore.saveAllVariables(response, langArr);
                first = false;
            });
        } else {
            var lang = data.language;
            //update Exixting BotVariables in Storage
            updateBotVariableInDataStore(botVariables, data, event, lang);
        }
        console.log(dataStore);

    }

};

function updateBotVariableInDataStore(botVariables, data, event, lang) {
    var variable = data.variable;
    if (event === "variable_create") {
        //update storage with newly created variable
        for (var i = 0; i < langArr.length; i++) {
            dataStore.addVariable(variable, i);
        }
    } else if (event == "variable_update") {
        //update storage with updated variable
        var index = langArr.indexOf(lang);
        if (index > -1) {
            dataStore.updateVariable(variable, langArr, index);
        }
    } else if (event == "variable_delete") {
        //delete variable from storage
        dataStore.deleteVariable(variable, langArr);
    }
}

function fetchAllBotVariables(data) {
    if (first) {
        sdk.fetchBotVariable(data, langArr, function(err, response) {
            first = false;
            dataStore.saveAllVariables(response, langArr);
        });
    }
}