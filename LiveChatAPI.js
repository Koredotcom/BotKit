var rp = require('request-promise');

var liveChat = require('./config.json').LiveChat;
var baseUrl = 'https://' + liveChat.domain + '.com/' + liveChat.api_version;
var agentUrl = baseUrl + '/agent/action/';
var customerUrl = baseUrl + '/customer/action/';

// Live chat Agent transfer 3.2
/*_______________________________*/
// Live chat v3.x agent transfer integration can be achevied via 2 methods :
//      a) RTM=> websocket based
//      b) XHR request (Rest APIs)  based
// This sdk code demonstrates method 2: Rest API based integration.
// Semantics:
//1) Create a server side app in 'developers.livechat\Apps' & client id & client secret. Associate necessary scopes.
//2) By oAuth2 (Authorisation code)  get agent access token using agent APIs for the app created
//3) With this agent access token, create a customer access token using customer APIs
//4) Customer access token will be used for all subsequent interactions
//5) Chat will be initiated by start_chat api
//6) Messages from customer(kore user) will be sent to Live chat agent using Customer -send_event api
//7) A webhook is configured in 'developers.livechat\Tools\webhook configurator' which to actually listen to 'incoming_event'(filtered for 'author_type': 'agent') & 'chat_user_removed' .
//8) 'incoming_event' webhook is used to get messages from Live chat agent to the kore user
//9) Similarly, 'chat_user_removed' is used for notfying chat end events

var customerClass = {
    startChat: function (customerAccessToken) {
        var options = {
            'method': 'POST',
            'url': customerUrl + 'start_chat?license_id=' + liveChat.license_id,
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + customerAccessToken
            },
            body: JSON.stringify({})
        };
        return rp(options).then(function (chatDetails) {
            console.log("chatDetails : ", chatDetails);
            var parResp = JSON.parse(chatDetails);
            return parResp.chat_id;
        }).catch(function (err) {
            console.error("Error in starting chat");
            return Promise.reject(err);
        });
    },

    deActivateChat: function (chat_id, customerAccessToken, isAgent = false) {
        //if not agent customer is closing the chat
        var options = {
            'method': 'POST',
            'url': (isAgent) ? agentUrl : customerUrl + 'deactivate_chat?license_id=' + liveChat.license_id,
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + customerAccessToken
            },
            body: JSON.stringify({
                "chat_id": chat_id
            })
        };
        return rp(options).then(function (response) {
            console.log("Deactivating : ", chat_id);
        }).catch(function (err) {
            console.error("Error in deactivating chat");
            return Promise.reject(err);
        });
    },
    createCustomer: function (agentAccessToken, oBody) {
        var options = {
            'method': 'POST',
            'url': agentUrl + '/create_customer',
            'headers': {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + agentAccessToken
            },
            body: JSON.stringify({
                "name": oBody.name,
                "email": oBody.email,
                "avatar": "https://example.com/avatar.png"
            })
        };
        return rp(options).then(function (response) {
            var parResp = JSON.parse(response);
            return parResp.customer_id;
        }).catch(function (err) {
            console.error("Error in creating customer");
            return Promise.reject(err);
        })
    },
    sendMessageToAgent: function (chat_id, customerAccessToken, text, eventType = "message") {
        //Todo: support for other event types
        var options = {
            'method': 'POST',
            'url': customerUrl + '/send_event?license_id=' + liveChat.license_id,
            'headers': {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + customerAccessToken
            },
            body: JSON.stringify({
                "chat_id": chat_id,
                "event": {
                    "type": eventType,
                    "text": text,
                    "recipients": "all"
                }
            })
        };
        return rp(options).then(function (response) {
            var parResp = JSON.parse(response);
            console.log("sendMessageToAgent : ", parResp);
            return parResp.customer_id;
        }).catch(function (err) {
            console.error("Error in sending message to agent");
            return Promise.reject(err);
        })
    }
}

module.exports.customerClass = customerClass;