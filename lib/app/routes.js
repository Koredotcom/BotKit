var sdk            = require("../sdk");
var serviceHandler = require("./serviceHandler").serviceHandler;
var apiPrefix      = require("../../config").app.apiPrefix;

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
    
    app.post(apiPrefix + '/sdk/blueprismConnector/:requestId', function(req, res) {
        var reqBody     = req.body;
        var requestId = req.params.requestId;

        sdk.getSavedData(requestId).then(function (data) {
            console.log("Received hit to call back service : ", requestId);
            if (data) {
                data.context.ResponseFromBluePrism = reqBody;
                sdk.respondToHook(data);
                res.send({status:"OK"});
            }
        }).catch(function (err) {
            console.error("no user id found: ", err.message);
            res.send("No user id found " + err.message);
        });

    });
}

module.exports = {
    load : loadroutes
};
