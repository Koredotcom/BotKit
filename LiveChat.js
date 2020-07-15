var config = require("./config");
var botId = Object.keys(config.credentials)
var botName = config.botName;

var sdk = require("./lib/sdk");
var _ = require('lodash');
var oAuth2 = require('./LiveChatOauth2');
var customerAPIs = require('./LiveChatAPI').customerClass;

var mChatIdvsVisitorId = {},
    mVisitorIdvsChatDetails = {};

function getVisitorId(data) {
    var visitorId = _.get(data, 'channel.channelInfos.from');
    if (!visitorId) visitorId = _.get(data, 'channel.from');
    return visitorId;
}

function connectToAgent(data) {
    var oAgentClass = new oAuth2.authoriseAgent();
    var getAgentToken = oAgentClass.getToken();
    var visitorId = getVisitorId(data);
    var context = data.context;
    var _dataObj = {
        "name": _.get(context, 'session.UserContext.firstName', "Patron"),
        "email": _.get(context, 'session.UserContext.emailId', "patron@kore.com")
    }
    var customerId = getAgentToken
        .then((agentToken) => customerAPIs.createCustomer(agentToken, _dataObj));

    mVisitorIdvsChatDetails[visitorId] = {
        "data": data
    };
    //This will be displayed only if chat created/established
    //In case of any exception, error message will be updated in catch block
    var linkUrl = config.app.url + config.app.apiPrefix + "/history/index.html?visitorId=" + visitorId;
    var historyTags = (context.historicTags && context.historicTags[0] && context.historicTags[0].tags) ? context.historicTags[0].tags.join("\n") : "";
    var lastMessage = _.get(data, 'context.session.BotUserSession.lastMessage.messagePayload.message.body', "");
    var agentWelcomeMessage = "Hi, I need ur help.\nChat history : " + linkUrl + "\nHistory tags : " + historyTags + "\nLast message : " + lastMessage;
    var customerWelcomeMessage = "Hi I'm Live chat agent(Kore). How can I help you?";

    return Promise.all([getAgentToken, customerId])
        .then((arrOfAgentTokenAndId) => initiateChat(arrOfAgentTokenAndId[0], arrOfAgentTokenAndId[1], visitorId, agentWelcomeMessage))
        .then(() => {
            data.message = customerWelcomeMessage;
            sdk.sendUserMessage(data)
        })
        .catch((err) => {
            data.message = "*** " + err.message;
            //No issues even if execute it Asynchronously
            if (err.message.indexOf("Groups offline") > -1)
                data.message = "I regret to inform that all agents are offline currently. Please get back to me after some time."
            sdk.sendUserMessage(data);
            clearChatTraces(data);
            console.error("Error in connecting to agent :", err.message)
        })
}

function initiateChat(agentToken, customerId, visitorId, welcomeMessage) {
    console.log("Customer id : ", customerId, "\nVisitor id : ", visitorId);
    var oCustomerToken = oAuth2.authoriseCustomer(agentToken, customerId);

    return oCustomerToken.then((customerToken) => customerAPIs.startChat(customerToken))
        .then((chatId) => {
            //Todo: maintain only one obj instance and 1 accesstokens till it expires....
            mVisitorIdvsChatDetails[visitorId]["customerToken"] = oCustomerToken.value();
            mVisitorIdvsChatDetails[visitorId]["agentToken"] = agentToken;
            mVisitorIdvsChatDetails[visitorId]["chatId"] = chatId;
            mChatIdvsVisitorId[chatId] = visitorId;
            mVisitorIdvsChatDetails[visitorId]["messageEventId"] = new Set(); //can store only unique values. Used to avoid double messages coming from agent
            return customerAPIs.sendMessageToAgent(chatId, oCustomerToken.value(), welcomeMessage)
        })
        .catch((err) => {
            console.error("Error in initiating Chat :", err.message);
            return Promise.reject(err);
        })
}

function sendToAgent(data) {
    var visitorId = getVisitorId(data);
    var customerToken = (mVisitorIdvsChatDetails[visitorId] && mVisitorIdvsChatDetails[visitorId]["customerToken"])
    if (customerToken) {
        var chatId = mVisitorIdvsChatDetails[visitorId]["chatId"];
        console.log("To agent : ", visitorId, chatId, data.message);
        if (data.message == "clear" || data.message == "quit" || data.message == "###")
            return customerAPIs.sendMessageToAgeavailalent(chatId, customerToken, "Customer is exiting the conversation")
                .then(customerAPIs.deActivateChat(chatId, customerToken))
                .tap(clearChatTraces(data))
        else
            return customerAPIs.sendMessageToAgent(chatId, customerToken, data.message)
    } else {
        console.log("Agent not found.So clearing the session for ", visitorId);
        data.message = "As Agent is not available, clearing the agent session";
        return sdk.sendUserMessage(data)
            .tap(clearChatTraces(data))
    }
}

function clearChatTraces(data) {
    var visitorId = getVisitorId(data);
    sdk.clearAgentSession(data);
    var eventIdsSet = (mVisitorIdvsChatDetails[visitorId] && mVisitorIdvsChatDetails[visitorId]["messageEventId"]);
    if (eventIdsSet) eventIdsSet.clear();
    mVisitorIdvsChatDetails[visitorId] = undefined;
    var chatId = Object.keys(mChatIdvsVisitorId).find(visitorId => mChatIdvsVisitorId[visitorId] === visitorId);
    mChatIdvsVisitorId[chatId] = undefined;
}

module.exports = {
    botId: botId,
    botName: botName,

    on_user_message: function (requestId, data, callback) {
        if (!data.agent_transfer) {
            if (data.message === "skipBotMessage") // condition for skipping a bot message
                return sdk.skipBotMessage(data, callback);
            else
                return sdk.sendBotMessage(data, callback); //Forward the message to bot
        } else //Agent mode
            return sendToAgent(data)
    },
    on_bot_message: function (requestId, data, callback) {
        if (data.message === "skipUserMessage") // condition for skipping a user message
            sdk.skipUserMessage(data, callback);
        else
            return sdk.sendUserMessage(data, callback); //Sends back the message to user
    },
    on_agent_transfer: function (requestId, data, callback) {
        data.message = "An Agent will be assigned to you shortly!!!";
        return sdk.sendUserMessage(data).then(() => connectToAgent(data));
    },
    on_event: function (requestId, data, callback) {
        console.log("on_event -->  Event : ", data.event);
        return callback(null, data);
    },
    on_alert: function (requestId, data, callback) {
        console.log("on_alert -->  : ", data, data.message);
        return sdk.sendAlertMessage(data, callback);
    },
    showEventsFromAgent: function (req, res) {
        var oEvent = req.body;
        var chatId = _.get(oEvent, 'payload.chat_id');
        var visitorId = mChatIdvsVisitorId[chatId];
        var data = (mVisitorIdvsChatDetails[visitorId] && mVisitorIdvsChatDetails[visitorId]["data"]);
        var eventId = _.get(oEvent, 'payload.event.id', "---");
        var eventIdsSet = (mVisitorIdvsChatDetails[visitorId] && mVisitorIdvsChatDetails[visitorId]["messageEventId"]);
        
        if (eventIdsSet && eventIdsSet.has(eventId))
            return res.send("Bad event received");
        
            var action = _.get(oEvent, 'action');
        var text = _.get(oEvent, 'payload.event.text', "Something from agent");
        
        if (data) {
            mVisitorIdvsChatDetails[visitorId]["messageEventId"].add(eventId);
            if (action === 'chat_user_removed') {
                data.message = "Agent has closed the session";
                clearChatTraces(data);
            } else if (action === 'incoming_event')
                data.message = text
            console.log("From agent : ", visitorId, chatId, action, data.message);
            return sdk.sendUserMessage(data);
        } else {
            console.log("Map objects cleared : ", visitorId, chatId, action, text);
            res.send("Data object not found");
        }
    },
    gethistory: function gethistory(req, res) {
        var visitorId = req.query.userId;
        var data = (mVisitorIdvsChatDetails[visitorId] && mVisitorIdvsChatDetails[visitorId]["data"]);
        if (data) {
            data.limit = 100;
            return sdk.getMessages(data, function (err, resp) {
                if (err) {
                    res.status(400);
                    return res.json(err);
                }
                var messages = resp.messages;
                res.status(200);
                return res.json(messages);
            });
        } else {
            var error = {
                msg: "Invalid user",
                code: 401
            };
            res.status(401);
            return res.json(error);
        }
    }
};
