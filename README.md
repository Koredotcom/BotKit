# BotKit

## Introduction

Kore Bot Server SDK is set of libraries which gives you more control over the bots you build on Kore Bots platform. Once you build the Dialog task using Dialog Editor, you can subscribe to all the message and webhook events. You can easily add event handlers in the SDK and get the handle over the messages and webhook events

## Kore Bot Platform and SDK Integration 

User interacts with your bot using one of the channel provided by Kore Bot platform. Below diagram shows how the user message flows through the platform, SDK and Kora engine

![Image1]
(images/image1.png)

All the messages from the user and the responses from Kora NL engines are sent to SDK as message events. SDK will receive webhook events whenever Kora NL engine enters the SDKWebHook node in the dialog flow. 

Below sequence diagram depicts the execution flow of user sending the message using one of supported channel till the time user receives the response

![Image2]
(images/image2.png)

Kora NL engine executes node one by one and transitions based on the condition provided. If NL engine enters SDKWebhook node, it makes Webhook execute call and platform sends on_webhook event to the SDK. Below sequence diagram depicts the user message flow which involves SDKWebhook execution

![Image3]
(images/image3.png)

Note: You will add SDKWebHook node to the dialog whenever there is a need for server side validation, business logic execution or backend server API calls. You can execute all the business logic and send the response in the same on_webhook event call. There may be cases where you may need to execute the business logic asynchronously. In that case, you can send AsynReponse in on_webhook event. This response will have HTTP status code 202. Whenever the response data is ready, you can call sdk.sendWebhookResponse() to send the response data to the platform. 


## SDK Events

### on_user_message

**Event Name** : on_user_message

**Description** : Whenever user sends message to Bot, it is received by respective channel adapter. User message is wrapped in this event and sent to SDK 

**Method signature** : 
```
on_user_message = function(requestId, payload, callback)
 ```
 
 **Parameters** :
 
 Parameter   | Description
 -----------  | ----------------
 requestId    | Unique Id for each event
 paylaod      |  ```{“message”: “message sent by user”, “channel” : “channel name”, “context” : context object }```
 callback     | callback function to call at the end of the event handling. This callback function is responsible to send the updated message and context back to Bot platform

### on_bot_message

**Event Name** : on_bot_message

**Description** : When Kora NL engine receives the user message, the message is processed for intent identification, entity extraction, process confirmation messages, etc. Kora populates the context with intent and entities. Kora navigates through the dialog task flow node by node and populates the nodes processed in context.history object. If any message needs to be sent to the user, it is sent to the Bot platform and then it is sent to SDK along with context object 

**Method signature** : 
```
on_bot_message = function(requestId, payload, callback)
```
 
 **Parameters** :
 
  Parameter   | Description
 -----------  | ----------------
 requestId    | Unique Id for each event
 paylaod      |  ```{“message”: “message sent by bot to the user”, “taskId” : “Dialog task Id”, “nodeId” : “current node id in the dialog flow” channel” : “channel name”, context” : context object }```
 callback     | callback function to call at the end of the event handling. This callback function is responsible to send the updated message and context back to Bot platform
 
### on_webhook

**Event Name** : on_webhook

**Description** : Whenever Kora encounters the SDKWebHook node in the dialog flow, this event is sent to the SDK with componentName and context. SDK can execute any business logic required and send the updated context back to the platform.  

**Method signature** :
```
on_webhook = function(requestId, componentName, payload, callback)
```
 
 **Parameters** :
 
  Parameter    | Description
 -----------   | ----------------
 requestId     | Unique Id for each event
 componentName | Name of the webhook component
 paylaod       |  ```{“taskId” : “Dialog task Id”, “nodeId” : “current node id in the dialog flow” “channel” : “channel name”, “context” : context object }```
 callback      | callback function to call at the end of the event handling. This callback function is responsible to send the updated message and context back to Bot platform


## Context object

 Context object is the container object which holds all the data needed for the dialog execution. Kora NL engine populates the intent identified, entities extracted, history into this object. Keys from context object is used in the dialog transition conditions. Context object can be referenced in script node, dynamic values in the entity nodes. This object is passed in the payload to the SDK. Developers can update the context based on business logic and it can influence the dialog execution

Keys (JSON path)                            | Description
-----------------                           | ---------------
intent                                      | Intent that is identified by Kora NL Engine from user message
entities                                    | Array of key value pairs. This will have extracted entity key and values
session.enterpriseContext                   | Key value pair that are created by developer . Any of the developers organization bots can read and modify. This information is common across all users for an enterprise.
session.botContext                          | This context will be available for specific bot across the users
session.userContext                         | Bot platform will provide this read only object and make all user profile information available in this object. (Not an option for bot developer setting up, but is provided as a platform variable
session.userSession                         | key value pair against a user across bots within an enterprise.
session.botUserSession                      | User specific key value pair that are created for specific bot
history                                     | Array of nodeIds visited or processed by Kora NL engine
$nodename.response.body                     | This object is populated from service node’s http response
Any other key value pair added by developer |


## Authorization
As a prerequisite, you must register your SDK app with the Kore Bot Platform in the Kore Bot Builder tool and acquire client credentials. You need to add appId (clientId) and appKey (secret key) in config.json in SDK. For more information, see [SDK App Registration](https://developer.kore.com/docs/bots/kore-web-sdk/sdk-app-registration/).

This will be used to establish mutual SSL authentication as well as to authorize the calls from SDK to Bots Platform.
