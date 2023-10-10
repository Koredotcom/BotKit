/**
 * This BotKit example demonstrates how external NLP engines can be plugged to enhance Kore.ai Bot experience
 * 
 * This example also demonstrates custom message routing directly from BotKit to the user
 * Refer to https://github.com/Koredotcom/BotKit/tree/master/docs/exampleWithExternalNLPEngine,
 * for details on how to setup the Bot and run this example
 */

 var sdk     = require("./lib/sdk");
 var config  = require("./config");
 var botId   = config.credentials.botId; //BotID from Kore.ai - Refer to settings section
 var botName = config.credentials.botName;  //botname from Kore.ai
 var externalNLPConfig = require('./externalNLPConfig.json');
 const dialogflow = require('@google-cloud/dialogflow');
 const uuid = require('uuid');
 var Promise = sdk.Promise;
 
 const languageCode = externalNLPConfig.dialogFlow.languageCode;
 const projectId = externalNLPConfig.dialogFlow.projectId;
 const sessionClient = new dialogflow.SessionsClient({
     keyFilename: externalNLPConfig.dialogFlow.serviceFileName
 });
 const sessionId = uuid.v4();
 const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
 var { makeHttpCall } = require("./makeHttpCall");
 
 //Dialog Flow sdk call for intent recognization
 function getIntentFromDialogFlow(message){
     return new Promise(function(resolve, reject) {
         const request = {
             session: sessionPath,
             queryInput: {
                 text: {
                     text: message,
                     languageCode: languageCode
                 }
             }
         };
     
         sessionClient.detectIntent(request, function(err, response) {
             if(err) {
                 reject({ error: err });
             }
             resolve(response);
         });
     });
 }
 
 
 //Luis.ai function for entity recognization
 function getEntitiesFromluis(message){
    return new Promise(function(resolve, reject) {
        // Update the below url with the Luis.ai bot configuration.
        let url = externalNLPConfig.luis.baseUrl + 'luis/prediction/v3.0/apps/'+ externalNLPConfig.luis.appId+'/slots/'+ externalNLPConfig.luis.slot+'/predict?subscription-key='+externalNLPConfig.luis.subscriptionKey+'&verbose=true&show-all-intents=true&log=true&query='+message;
        makeHttpCall(
            'get',
            url
        )
        .then(function(res) {
            resolve(res.data);
        })
        .catch(function(error) {
            reject({error:error});
        })
     });
 }
 
 //Send welcome message to the user, when they interact with the Bot for the first time
 function sendWelcomeMessage(data){
    data.message = "Hello, I can help you with searching hotels near your city of interest";
 }
 
  
  module.exports = {
 
     botId   : botId,
     botName : botName,
     
     //on_user_message handler
     on_user_message : function(requestId, data, callback) {
       var message = (data.message).trim();
       var re = new RegExp(".*cab.*"); //handle specific messages for example cab related info
       
       //Check if first time interaction, if yes, send out the welcome message
       if(data.context.session.BotUserSession && !data.context.session.BotUserSession.isFirstMessage) { 
           
           data.context.session.BotUserSession.isFirstMessage = true;
           sendWelcomeMessage(data);
           sdk.sendUserMessage(data,callback);
           
       }
 
       getIntentFromDialogFlow(message).then(function(intentResponse) {   
         if(intentResponse.queryResult.intentDetectionConfidence > 0) {      //if intent recognized from dialog flow
             
           var intent = intentResponse.queryResult.intent.displayName;
           console.log(intent);
           data.message = 'Intent identified from Dialog Flow is '+ intent;
 
         //   if (intentResponse.result.metadata && intentResponse.result.metadata.intentName) {
         //       intent = intentResponse.result.metadata.intentName
         //   }
 
           sdk.sendUserMessage(data,callback);
           
           //Lets try to get entities from another NLP service, Luis.ai
           getEntitiesFromluis(message).then(function(entitiesResponse) {
 
               data.metaInfo = {
                   'intentInfo' : {
                     //   'intent' : intent
                   }
               };
 
               if('entities' in entitiesResponse.prediction) {      //if entities recognised from luis or not
               
                 var entities = entitiesResponse.prediction.entities;
                 var date;
                 var city;
                 if(entities.datetimeV2 !== undefined && entities.datetimeV2.length > 0) {
                     date = entities.datetimeV2[0].values[0].resolution[0].value;
                 }
 
                 if(entities.City !== undefined && entities.City.length > 0) {
                     city = entities.City[0];
                 }
 
                 if(date !== undefined || city !== undefined) {
                     var temp = '';
                     var entityToKoreNL = {}; // entityToKoreNL object should contain the keys as per the Kore entity recognition documentation.
                     if(date !== undefined) {
                         temp = temp + date + ' : ';
                         entityToKoreNL['date'] = date;
                     }
 
                     if(city !== undefined) {
                         temp = temp + city;
                         entityToKoreNL['City'] = city;
                     }
 
                     data.message = 'Entities identified from luis.ai is '+ temp;
                     
                     // Uncomment the following to see a message on chat window, on what intents and entities 
                     // are identified on Api.ai and from Luis.ai
                 
                     sdk.sendUserMessage(data,callback);
                 
                     data.message = 'Search hotels'; // Here we are setting the message to match to task name on Kore.ai, this message will be ignored if intent is passed externally.
                     
                     data.metaInfo.intentInfo.entities = entityToKoreNL;
 
                     // Now lets send a message to Kore.ai Bot, with data that says, the intent is already recognized
                     // and the entities are also set into the context
                     return sdk.sendBotMessage(data,callback);
                 } else {
                     data.message = 'No Entities identified';
                     sdk.sendUserMessage(data,callback);
                     data.message = 'Search hotels';
                     return sdk.sendBotMessage(data,callback);
                 }
               } else {  //Intent recognized from Dialog Flow, but the entity not recognized from Luis.ai
                 data.message = 'Search hotels';
 
                 // Now lets send a message to Kore.ai Bot, with data that says, the intent is already recognized
                 // Kore.ai Bot should prompt for the entity in this case, as we did not set the entity value into context
               
                 return sdk.sendBotMessage(data,callback);
               }
           });
       } else if(re.test(message)){
           
           // Send out a custom message, if user says that "I want to book a cab"
           data.message = 'You can book a cab once you reach the hotel';
           return sdk.sendUserMessage(data,callback);
       
       }else{
           return sdk.sendBotMessage(data, callback);
       }
     });
     },
 
     //on_bot_message handler
     on_bot_message  : function(requestId, data, callback) {
         // In case of intent is not identified by Kore NL, 'intentMatched' flag will false. (data._originalPayload.metaInfo.intentInfo.intentMatched)  
         return sdk.sendUserMessage(data, callback);
     },
    
     //on_webhook handler
     on_webhook      : function(requestId, data, componentName, callback) {
         if (componentName === 'sendResponse') {
           var hotels = {
             "hotels":[
                   "Taj Banjara",
                   "Novotel"
             ]
           };
           data.context.hotelResults = hotels;
           callback(null,data);
         }
     }
         
 };