var botId = "st-12345";
var botName = "testBot";
var sdk = require("./lib/sdk");

module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : function(requestId, data, callback) {
        if (data.message === "Hi") {
            data.message = "Hello";
            return sdk.sendUserMessage(data, callback);
        } else {
            return sdk.sendBotMessage(data, callback);
        }
    },
    on_bot_message  : function(requestId, data, callback) {
        if (data.message === 'hello') {
            data.message = 'The Bot says hello!';
        }
        return sdk.sendUserMessage(data, callback);
    }
};


