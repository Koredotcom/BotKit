var botId = "st-12345";
var botName = "testBot";
var sdk = require("./lib/sdk");

module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : function(requestId, data, callback) {

        /**Override user message, context etc. if required.
         *
        data.message = data.message + "__From SDK";       //Override message here
        data.context.session.set('newKey', 'value1');
        */

        //Ways to respond back:
        //1:
        sdk.sendUserMessage(data)
            .then(function() {
                callback();
            })
            .catch(function(err) {
                callback(err);
            });


        //2:
        sdk.sendBotMessage(data)
            .then(function() {
                return sdk.sendBotMessage(data);
            })
            .then(function() {
                callback();
            });

        //3:
        var err;
        callback(err);
    },
    on_bot_message  : function(requestId, data, callback) {

        /**Override user message, context etc. if required.
         *
        data.message = data.message + "__From SDK";       //Override message here
        data.context.session.set('newKey', 'value1');
        */

        //1:
        sdk.sendUserMessage(data)
            .then(function() {
                callback();
            })
            .catch(function(err) {
                callback(err);
            });


        //2:
        var err;
        callback(err);
    },
    on_webhook    : function(requestId, data, callback) {
        /*1: Synchronous response:
        Modify context/message/session
        callback(null, data);
        */

        //2: Do something, then send response synchronously
        function do_something(data, callback) {
            callback(null, {key: "value"});
            //make an API call with data params.
        }
        do_something(data, function(err, response) {
            data.context.response = response;
            callback(err, data);
        });

        //3: Trigger something, then send Async response
        //function on_job_done(requestId) {
            //return sdk.getSavedData(requestId)
                //.then(function(data) {
                    //return sdk.respondToHook(data);
                //});
        //}
        //function trigger_something(data, on_job_done) {
        //}
        //trigger_something(data, on_job_done);
        //callback(null, new (sdk.AsyncResponse)());
    }
};


