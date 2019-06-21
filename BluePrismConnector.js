var config      = require("./config");
var botId       = "st-007da037-67f9-55c3-bf93-6272ca639359"; //change this to link your bot
var botName     = "BotName";
var soap        = require('strong-soap').soap;
var sdk         = require("./lib/sdk");

/*
 * This is the function to invoke a BluePrism Process (using SOAP client service)
 * In order to invoke the desired process successfully, that process must be exposed as a WebService from the BluePrism Studio.
 * 
 * For more Information on "How to expose process luePrism Process as a WebService" visit the following link,
 * https://usermanual.wiki/Pdf/Blue20Prism20User20Guide2020Web20Services.795353567/html
 * 
 * Please Provide the credentials of the BluePrism Studio Account in Config.json
 */
function executeBlueprismRequest(requestId, blueprismRequest, callbacks) {

    var url = blueprismRequest.url;
    var endPoint = blueprismRequest.url;
    if(!url.endsWith('?wsdl')){
        url = url+"?wsdl";
    }

    if(endPoint.endsWith('?wsdl')){
        endPoint = endPoint.split('?')[0];
    }


    return new Promise(function(resolve, reject) {
        soap.createClient(url, function(err, client) {
            if (err || !client) {
                callbacks.on_failure(requestId, err);
            }
            else{
                client.setEndpoint(endPoint);
                client.setSecurity(new soap.BasicAuthSecurity(config.bluePrism.username, config.bluePrism.password));
                client[blueprismRequest.operation](blueprismRequest.attributes || {}, function(err, result, rawResponse, soapHeader, rawRequest) {
                    if(err){
                        callbacks.on_failure(requestId, err);
                    }
                    callbacks.on_success(requestId, rawResponse);
                })
            }
        });
    });
}

/*
 * Responds to the webhook asynchronously with the success flag.
 */
function onSuccess(requestId, result) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            console.log(result);
            data.context.blueprismResponse = result;
            data.context.successful = true;

            sdk.respondToHook(data);
        });
}

/*
 * Responds to the webhook asynchronously with the Failure flag.
 */
function onFailure(requestId, err) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            data.context.successful = false;
             data.context.blueprismResponse = err;
            sdk.respondToHook(data);
        });
}

//call executeBlueprismRequest with the requestId. This service is expected to respond asynchronously.
//'requestId' must be passed along all asynchronous flows, to allow the BotKit to respond
// back to the hook once the async process is completed.
function callBluePrism(requestId, blueprismRequest) {
    executeBlueprismRequest(requestId, blueprismRequest, {
        on_success : onSuccess,
        on_failure : onFailure
    });
}



module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : function(requestId, data, callback) {
        if (data.message === "Hi") {
            data.message = "Hello";
            //Sends back 'Hello' to user.
            return sdk.sendUserMessage(data, callback);
        } else if(!data.agent_transfer){
            //Forward the message to bot
            return sdk.sendBotMessage(data, callback);
        } else {
            data.message = "Agent Message";
            return sdk.sendUserMessage(data, callback);
        }
    },
    on_bot_message  : function(requestId, data, callback) {
        if (data.message === 'hello') {
            data.message = 'The Bot says hello!';
        }
        //Sends back the message to user

        return sdk.sendUserMessage(data, callback);
    },
    on_agent_transfer : function(requestId, data, callback){
        return callback(null, data);
    },
    on_event : function (requestId, data, callback) {
        console.log("on_event -->  Event : ", data.event);
        return callback(null, data);
    },
    on_alert : function (requestId, data, callback) {
        console.log("on_alert -->  : ", data, data.message);
        return sdk.sendAlertMessage(data, callback);
    },
    on_webhook      : function(requestId, data, componentName, callback) {
      /*The request to execute the BlluePrism Process from the Bot is received here.....
       * the request data from the Bot is stored in "bluePrismRequest" which need to be sent
       * through out the process of invoking Process.
      */
        var context = data.context;
        console.log(context.bluePrismRequest);
        sdk.saveData(requestId, data)
            .then(function() {
                callBluePrism(requestId, context.bluePrismRequest);
                callback(null, new sdk.AsyncResponse());
            });

    }

};
