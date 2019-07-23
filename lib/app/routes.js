var sdk            = require("../sdk");
var serviceHandler = require("./serviceHandler").serviceHandler;
var apiPrefix      = require("../../config").app.apiPrefix;
var livechat       = require("../../LiveChat.js");

function loadroutes(app) {
    app.post(apiPrefix + '/sdk/bots/:botId/components/:componentId/:eventName', function(req, res) {
        var reqBody     = req.body;
        var botId       = req.params.botId;
        var componentId = req.params.componentId;
        var eventName   = req.params.eventName;

        serviceHandler(req, res, sdk.runComponentHandler(botId, componentId, eventName, reqBody));
    });
    app.post(apiPrefix + '/sdk/bots/:botId/:eventName', function(req, res) {
        var reqBody     = req.body;
        var botId       = req.params.botId;
        var eventName   = req.params.eventName;

        serviceHandler(req, res, sdk.runComponentHandler(botId, 'default', eventName, reqBody));
    });

    app.get( apiPrefix + '/gethistory', livechat.gethistory);
}

module.exports = {
    load : loadroutes
};
