var sdk = require("../sdk");
var serviceHandler = require("./serviceHandler").serviceHandler;
var apiPrefix = require("../../config").app.apiPrefix;
var authoriseAgent = require('../../LiveChatOauth2').authoriseAgent;
var oAuthoriseAgent = new authoriseAgent(); //Todo: I doubt how do we maintian single obj instance in two files for callback. Need to check for concurent users
var liveChat = require('../../LiveChat');

function loadroutes(app) {
    app.post(apiPrefix + '/sdk/bots/:botId/components/:componentId/:eventName', function (req, res) {
        var reqBody = req.body;
        var botId = req.params.botId;
        var componentId = req.params.componentId;
        var eventName = req.params.eventName;

        serviceHandler(req, res, sdk.runComponentHandler(botId, componentId, eventName, reqBody));
    });
    app.post(apiPrefix + '/sdk/bots/:botId/:eventName', function (req, res) {
        var reqBody = req.body;
        var botId = req.params.botId;
        var eventName = req.params.eventName;

        serviceHandler(req, res, sdk.runComponentHandler(botId, 'default', eventName, reqBody));
    });
    //Used for Live chat agent transfer
    app.get(apiPrefix + '/gethistory', liveChat.gethistory);
    app.get(apiPrefix + '/authCode/callback', oAuthoriseAgent.callBack);
    //Todo: Validate the end point with the generated token in live chat webhook configurator
    app.post(apiPrefix + '/incoming_event', liveChat.showEventsFromAgent);
    app.post(apiPrefix + '/chat_user_removed', liveChat.showEventsFromAgent);
}

module.exports = {
    load: loadroutes
};
