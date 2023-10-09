var botId    = "st-0954eedb-889c-5491-9f92-f5671760c942";
var botName  = "LiveChat";
var sdk      = require("./lib/sdk");
var Promise  = require('bluebird');
var template = require('url-template');
var { makeHttpCall } = require("./makeHttpCall");
const qs = require('qs');


var initUrl = "https://api.livechatinc.com/visitors/{visitorId}/chat/start";
function initChat(visitorId, data){
    var url = template.parse(initUrl).expand({visitorId: visitorId});
    let formData = qs.stringify(data);
    let headers = {
        'content-type': 'application/x-www-form-urlencoded',  // Set automatically
        'X-API-Version': 2,
        'Accept': 'application/json'
    };
    return makeHttpCall(
        'post',
        url,
        formData,
        headers
    )
    .then(function(res){
        return res.data;
    })
    .catch(function(err){
        return Promise.reject(err);
    });
}

var sendMsgUrl = "https://api.livechatinc.com/visitors/{visitorId}/chat/send_message";
function sendMsg(visitorId, data){
    var url = template.parse(sendMsgUrl).expand({visitorId: visitorId});
    let formData = qs.stringify(data);
    let headers = {
        'content-type': 'application/x-www-form-urlencoded',  // Set automatically
        'X-API-Version': 2
    };
    var options = {
        method: 'POST',
        uri: url,
        form: data,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',  // Set automatically
            'X-API-Version': 2
        }
    };
    return makeHttpCall(
        'post',
        url,
        formData,
        headers
    )
    .then(function(res){
        return res.data;
    })
    .catch(function(err){
        return Promise.reject(err);
    });
}

var getMsgUrl = "https://api.livechatinc.com/visitors/{visitorId}/chat/get_pending_messages?licence_id={licence_id}&secured_session_id={secured_session_id}&last_message_id={last_message_id}";
function getPendingMessages(visitorId, ssid,last_message_id,  licence_id){
    var url = template.parse(getMsgUrl).expand({visitorId: visitorId, secured_session_id: ssid, licence_id: licence_id, last_message_id: last_message_id});
    let headers = {
        'content-type': 'application/x-www-form-urlencoded',  // Set automatically
        'X-API-Version': 2
    };
    return makeHttpCall(
        'get',
        url,
        null,
        headers
    ).
    then(function(res){
        return res.data;
    })
    .catch(function(err){
        return Promise.reject(err);
    });
}
module.exports.initChat = initChat;
module.exports.sendMsg = sendMsg;
module.exports.getPendingMessages = getPendingMessages;
