/**
 * This BotKit example demonstrates how external NLP engines can be plugged to enhance Kore.ai Bot experience
 * 
 * This example also demonstrates custom message routing directly from BotKit to the user
 * Refer to https://github.com/Koredotcom/BotKit/tree/master/docs/exampleWithExternalNLPEngine,
 * for details on how to setup the Bot and run this example
 */

var botId   = "st-******************"; //BotID from Kore.ai - Refer to settings section
var botName = "**********";  //botname from Kore.ai
var sdk     = require("./lib/sdk");
var config  = require("./config");
var request = require('request-promise');
var Promise = sdk.Promise;


//Api.ai funtion call for intent recognization
function getIntentFromApiai(message){
   return new Promise(function(resolve, reject) {
        request({
	    // Update the below url with the api.ai bot configuration.
            url: 'https://api.api.ai/api/query?v=20150910&query='+message+'&lang=en&sessionId=72119261-b1c2-4996-84dd-d874d7754adc',
            method: 'GET',
            headers: {
                    // authorization bearer token from Api.ai
                    'Authorization': 'Bearer ****************'
            }
        }, function(error, res) {
            if (error || !res.body) {
                reject({error:error});
            }else{
       resolve(JSON.parse(res.body));
     }
        });
    });
}


//Luis.ai function for entity recognization
function getEntitiesFromluis(message){
   return new Promise(function(resolve, reject) {
        request({
	    // Update the below url with the Luis.ai bot configuration.
            url: 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/12730170-ef21-4047-9900-03de0bfdf14a?subscription-key=c063935b88e84bad98e40d6fee3f03bd&verbose=true&timezoneOffset=0&q='+message,
            method: 'GET',
            headers: {
                //Authorization bearer token from Luis.ai
                'Authorization': 'Bearer *******************'
            }
        }, function(error, res) {
            if (error || !res.body) {
                reject({error:error});
            }else{
       resolve(JSON.parse(res.body));
     }
        });
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
      if(data.context.session.BotUserSession 
          && !data.context.session.BotUserSession.isFirstMessage) { 
          
          data.context.session.BotUserSession.isFirstMessage = true;
          sendWelcomeMessage(data);
          sdk.sendUserMessage(data,callback);
          
      }

      getIntentFromApiai(message).then(function(intentResponse){   
    
        if(intentResponse.result.score > 0){      //if intent recognized from api.ai
      
          var intent = intentResponse.result.action;
          data.message = 'Intent identified from api.ai is '+ intent;

          if (intentResponse.result.metadata && intentResponse.result.metadata.intentName) {
              intent = intentResponse.result.metadata.intentName
          }

          //sdk.sendUserMessage(data,callback);
          
          //Lets try to get entities from another NLP service, Luis.ai
          getEntitiesFromluis(message).then(function(entitiesResponse){

              data.metaInfo = {
                  'intentInfo' : {
                      'intent' : intent
                  }
              };

              if(entitiesResponse.entities.length > 0){      //if entities recognised from luis or not
              
                var entities = entitiesResponse.entities;
                data.message = 'Entities identified from luis.ai is '+ entities[0].entity;
              
                // Uncomment the following to see a message on chat window, on what intents and entities 
                // are identified on Api.ai and from Luis.ai
              
                // sdk.sendUserMessage(data,callback);
              
                data.message = 'Search hotels'; // Here we are setting the message to match to task name on Kore.ai, this message will be ignored if intent is passed externally.
                var entities = entitiesResponse.entities;
                if(entities[0].type === 'builtin.geography.city') {
                    var entityToKoreNL = { // entityToKoreNL object should contain the keys as per the Kore entity recognition documentation.
                        'City': entities[0].entity
                    };
                    data.metaInfo.intentInfo.entities = entityToKoreNL;
                }

                // Now lets send a message to Kore.ai Bot, with data that says, the intent is already recognized
                // and the entities are also set into the context
              
                return sdk.sendBotMessage(data,callback);
            
              }else{  //Intent recognized from Api.ai, but the entity not recognized from Luis.ai
              
                data.message = 'Search hotels';

                // Now lets send a message to Kore.ai Bot, with data that says, the intent is already recognized
                // Kore.ai Bot should prompt for the entity in this case, as we did not set the entity value into context
              
                return sdk.sendBotMessage(data,callback);
              }
          });
      }else if(re.test(message)){
          
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
