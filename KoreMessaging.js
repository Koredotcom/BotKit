var sdk            = require("./lib/sdk");
var Promise        = sdk.Promise;
var request        = require("request");
var config         = require("./config");
var _              = require('lodash');
var util           = require('util');
var mockServiceUrl = config.examples.mockServicesHost;
var apiConfig      = require('./configs/api.json');
var sw             = require('stopword');
var botId          = config.streamId;
var botName        = config.botName;

/*
 * This example showcases the async capability of webhook nodes
 *
 * 'placeOrderToStore' method is called in the PlaceOrder webhook.
 * This service responds asyncronously
 *
 * var url = botsHookConfig.baseUrl + botsHookConfig.apiVersion + "/users/%s/builder/streams/" + streamId + '/ignoreuser';
 url = util.format(url, _userId);
 */
function serviceRequestData(requestId, storeId, url , payLoad, type, headers,  callbacks) {
    var userId = payLoad.mappedkuid;
    var name = payLoad.user;
    var getprofileUrl = url;
    console.log("url",url,payLoad,type,headers)
    /* var body = {
     "entityType":"user",
     "entityName":name
     }*/
    return new Promise(function(resolve, reject) {
        request({
            url        : getprofileUrl ,
            method     : type,
            body       : payLoad,
            json       : true,
            headers    : headers
        }, function(err, res) {
            if (err ||(res.statusCode !==200 && !res.body)) {
                return reject(err);
            }
            if (res.body && res.statusCode) {
                callbacks.on_success(requestId,payLoad, res.body);
                return;
            } else if (res.statusCode===200) {
                callbacks.on_success(requestId,payLoad, []);
                return;
            }else {
                callbacks.on_failure(requestId);
            }
            resolve(res);
        });
    });
}



function onSuccessServiceCall(requestId,callbackData, resBody) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            console.log("response data === ",JSON.stringify(resBody));
            data.context['userInfo']= resBody;
            data.context.successful = true;
            sdk.respondToHook(data);
        });
}

function onFailureServiceCall(requestId) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            data.context.successful = false;
            sdk.respondToHook(data);
        });
}
function serviceRequest(requestId, storeId, url,userDeatils, type, headers) {
    serviceRequestData(requestId, storeId, url, userDeatils,type, headers, {
        on_success : onSuccessServiceCall,
        on_failure : onFailureServiceCall
    });
}

module.exports = {
    botId   : botId,
    botName : botName,


    on_user_message : function(requestId, data, callback) {
        sdk.sendBotMessage(data, callback);
    },
    on_bot_message  : function(requestId, data, callback) {
        sdk.sendUserMessage(data, callback);
    },
    on_webhook      : function(requestId, data, componentName, callback) {
        console.log("componentName===",componentName);
        console.log("request data",JSON.stringify(data.context))
        var url = config.koraUrl + config.apiVersion;
        var type = "GET";
        var reqBody = {};
        var payload = {};
            var context = data.context;
            var customData  = (context.session.BotUserSession.lastMessage.messagePayload.message &&
            context.session.BotUserSession.lastMessage.messagePayload.message.customData);
            var token = "bearer " +customData.kmToken
            var headers = {
                "Authorization"   : token,
                "Content-Type"    : "application/json"
            }
            var mappedkuid  = customData.kmUId;
            var order = context.order;
            var storeId = context.storeId;
            sdk.saveData(requestId, data)
                .then(function() {
                    if(componentName === 'GETMEMBERDATA'){
                        url += apiConfig.seviceUrl.componentName.url;
                        type = apiConfig.seviceUrl.componentName.type;

                    }else if(componentName === 'GetUserInfo'){
                        url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        payload = {
                            entityType:"user",
                            type : context.entities.UserInput,
                            user : context.entities.PersonName,
                            mappedkuid :mappedkuid,
                            entityName: context.entities.PersonName
                        }
                        type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName === 'GETUSERDETAILS'){
                        url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        payload = {
                            entityType:"user",
                            type : context.entities.UserQuery,
                            user : context.entities.UserName,
                            mappedkuid:mappedkuid,
                            entityName:context.entities.UserName

                        }
                        reqBody.type = "user";
                        reqBody.type = mappedkuid;
                        type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName === 'Save_Knowledge_data'){
                        url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        if(context.formPayload  && context.formPayload.type === 'form_knowledge_data'){
                            payload = {
                                type : "knowledge",
                                title : context.formPayload.title,
                                description : context.formPayload.description,
                                components   :  context.formPayload.components,
                                hashTag : context.formPayload.hashtags,
                                mappedkuid : mappedkuid,
                                streamId : context.botid
                            }
                        }else{
                            var paramsData = context.session.BotUserSession.lastMessage.messagePayload.message.params;
                            if(paramsData){
                                payload = typeof paramsData === 'string' ? JSON.parse(paramsData) : paramsData
                            }else{
                                payload = {
                                    title : context.entities.Article_Text,
                                    description :context.entities.Article_Data
                                }
                            }
                            payload.type = 'knowledge'
                            payload.mappedkuid = mappedkuid;
                            payload.streamId = context.botid;
                        }
                    type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName === 'SearchKnowledgeData'){
                        url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        var entities =context.entities;
                        var inputString = context.userInputs.originalInput.sentence;
                        var inputArr = inputString.split(" ");
                        var  keyWord = sw.removeStopwords(inputArr);
                        var regex = /(?:^|\W)#(\w+)(?!\w)/g, match, hashTags = [],tempHash = [];
                        while (match = regex.exec(inputString)) {
                            hashTags.push(match[1]);
                            tempHash.push("#"+match[1]);
                        }
                        keyWord = _.difference(keyWord,tempHash);
                        payload = {
                            type        : "knowledge",
                            keywords    : keyWord,
                            mappedkuid  : mappedkuid,
                            streamId    : context.botid,
                            hashTags    : hashTags,
                            userInput   : inputString

                        }
                        if(entities && entities.PersonEntity)
                            payload.from =entities.PersonEntity;

                        if(entities && entities.DateEntity)  {
                            payload.fromaDate = new Date(entities.DateEntity);
                            payload.toDate    = new Date();
                        }
                        if(entities && entities.TimeEntity)
                            payload.time = entities.TimeEntity;
                        type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName === 'GetKnowledge'){
                        var action = context.entities.ActionEntity;
                        var sentence  = context.userInputs.originalInput.sentence.toLowerCase();
                        url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        var entities =context.entities;
                        var key_entity =entities.KeywordExtraction  && entities.KeywordExtraction.split(" ");
                        var inputString = context.userInputs.originalInput.sentence;
                        var inputArr = inputString.split(" ");
                        var  keyWord = sw.removeStopwords(inputArr);
                        var regex = /(?:^|\W)#(\w+)(?!\w)/g, match, hashTags = [];
                        while (match = regex.exec(inputString)) {
                            hashTags.push(match[1]);
                        }
                        var index = inputArr.indexOf("tag");
                        if(index>-1){
                            if(index===inputArr.length-1){
                                hashTags.push(inputArr[index-1])
                            }
                           else if((sw.removeStopwords([inputArr[index-1]])).length>0){
                                hashTags.push(inputArr[index-1])
                            }else{
                                hashTags.push(inputArr[index+1])
                            }
                        }
                        payload = {
                            type         : "knowledge",
                            keywords     : key_entity,
                            mappedkuid   : mappedkuid,
                            streamId     : context.botid,
                            hashTags     : hashTags,
                            action       : action,
                            userInput    : inputString
                        }
                        if(entities && entities.AttachmentEntity){
                            payload.componentMeta= [];
                            payload.componentMeta.push({type: entities.AttachmentEntity});
                        }

                        if(entities && entities.PersonEntity){
                            payload.personEntity = {
                                names : entities.PersonEntity,
                            }
                        }
                        if(entities && entities.EmailEntity){
                            payload.personEntity = {
                                emailIds : entities.EmailEntity,
                            }
                        }
                        if(sentence.indexOf("shared to me")>-1){
                            payload.action = "sharedBy";
                        }else if(sentence.indexOf("i shared")>-1|| sentence.indexOf("shared with")>-1 || sentence.indexOf("shared to")>-1||sentence.indexOf("my shared")>-1){
                            payload.action = "sharedTo";
                        }
                        if(entities && entities.NewCompositeEntity){
                            payload.timeRange= {};
                            var de = entities.NewCompositeEntity.dateperiodentityformeeting;
                            if(de && de.toDate){
                                payload.timeRange['fromDate'] = new Date(de.fromDate).getTime();
                                payload['timeRange']['toDate']    = new Date(de.toDate).getTime();
                            }else {
                                payload['timeRange']['toDate'] = new Date().getTime();
                                payload['timeRange']['fromDate']    = new Date(de.fromDate).getTime();
                            }
                        }
                        if(entities && entities.TimeEntity)
                            payload.time = entities.TimeEntity;
                        type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName === 'Save_Bookmark_data'){
                        url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        context.session.BotContext['bookmarkData']
                        payload = {
                            type : "bookmark",
                            url : context.session.BotContext.bookmarkData,
                            title : context.session.BotContext.bookmarkTitle,
                            description : context.session.BotContext.bookmarkDesc,
                            hashtags : context.session.BotContext.bookmarkhash,
                            mappedkuid : mappedkuid,
                            author:context.session.BotContext.bookmarkAuthor,
                            streamId : context.botid,
                            imageUrl :context.session.BotContext.image_url || "http://www.downloadclipart.net/medium/13132-purple-male-love-bird-clip-art.png"
                        }
                        type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName === 'GetBookmarksData'){
                       url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        context.session.BotContext['bookmarkData']
                        payload = {
                            mappedkuid : mappedkuid,
                            streamId : context.botid
                        }
                        type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName === 'GetEmailInfo'){
                        url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        var name  =context.entities.EmailEntity || context.entities.PersonEntity;
                        var keyword =(context.entities.KeywordExtraction && context.entities.KeywordExtraction)||"";
                        var fromDate = context.entities.DateEntity ;
                        var after = [];
                        if(fromDate){
                            after = ["after:"+fromDate] ;
                        }
                        payload = {
                            mappedkuid : mappedkuid,
                            streamId : context.botid,
                            "person" :[
                                 {
                                    "from" :[name],
                                    "to"  : []
                                }
                            ],
                            "labels" : [],
                            "keyword" :keyword,
                            "time": after,
                            "in" : []
                        }
                        type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName === 'Reminderhook'){
                            url += apiConfig.seviceUrl[componentName].url;
                            url = util.format(url, mappedkuid);
                            var name;
                            var keyword;
                            var crid = "";
                            if(context.notificationparams){
                                payload = context.notificationparams;
                                name  = payload.from || "";
                                keyword = payload.KeywordExtraction|| "";
                                crid = payload.crid || "";
                            }else{
                                name  = context.entities.PersonEntity;
                                keyword =(context.entities.KeywordExtraction)|| "";
                            }
                            payload = {
                                from : name,
                                keyword :keyword,
                                mappedkuid : mappedkuid,
                                streamId : context.botid,
                                ttl:context.rTTL,
                                crid:crid
                            }
                            type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName ==='Notify_Colleague'){
                        url += apiConfig.seviceUrl[componentName].url;
                        url = util.format(url, mappedkuid);
                        context.session.BotContext['bookmarkData']
                        var params = (context.session.BotUserSession.lastMessage.messagePayload.message &&
                        context.session.BotUserSession.lastMessage.messagePayload.message.params);
                        if(params && typeof params ==='string')
                            params = JSON.parse(params);
                        var inputData = context.userInputs.originalInput && context.userInputs.originalInput.sentence;
                        var userIds = [];
                        var emailIds = [];
                        params.forEach(function(u){
                            userIds.push(u.id);
                            emailIds.push(u.emailId);
                        })
                        payload = {
                            question:inputData,
                            colleagueIds:userIds,
                            emailIds:emailIds,
                            mappedkuid : mappedkuid,
                            streamId : context.botid

                        }
                        type = apiConfig.seviceUrl[componentName].type;

                    }else if(componentName ==='ShareArticle'){
                        url += apiConfig.seviceUrl[componentName].url;
                        kId= context.knowledgeId || (context.userInfo && context.userInfo.id);
                        url = util.format(url, mappedkuid,kId);
                        var params = (context.session.BotUserSession.lastMessage.messagePayload.message &&
                        context.session.BotUserSession.lastMessage.messagePayload.message.params);
                        if(params && typeof params ==='string')
                            params = JSON.parse(params);
                        var users = [];
                        params.forEach(function(u){
                            users.push({id: u.id, "type": "person", "privilege": 0});
                        })
                        knowledgeIds = context.knowledgeId || (context.userInfo && context.userInfo.id);
                        payload = {
                            users      : users,
                        }
                        type = apiConfig.seviceUrl[componentName].type;

                        }else if(componentName === 'MeetingSlot'){
                            url += apiConfig.seviceUrl[componentName].url;
                            url = util.format(url, mappedkuid);
                            var params = (context.session.BotUserSession.lastMessage.messagePayload.message &&
                                         context.session.BotUserSession.lastMessage.messagePayload.message.params);
                            if(params && typeof params ==='string')
                                params = JSON.parse(params);

                            var userIds = [];
                            params.invitees.forEach(function(e){
                                userIds.push(e.id);
                            })
                            type = apiConfig.seviceUrl[componentName].type;
                            payload = {
                                userIds      : userIds,//context.userIds
                                "title" 	: params.title,
                                "slot"  	: params.slot,
                                "type"  	: params.type,
                                "when"  	: params.when,
                                "duration"	: params.duration
                            }

                        }else if(componentName === 'PersonResolveHook'){
                            url += apiConfig.seviceUrl[componentName].url;
                            payload =  JSON.parse(context.requestData);
                            type = apiConfig.seviceUrl[componentName].type;

			             }else if(componentName === 'CreateEvent') {
                            url += apiConfig.seviceUrl[componentName].url
                            url = util.format(url, mappedkuid);
                            var slotdata = context.slotdata;
                            var title = context.meetingdata.title;
                            var emails = context.emailIds;
                            var allemails = [];
                            if (emails) {
                                emails.forEach(function (email) {
                                    var emailObj = {};
                                    emailObj['email'] = email;
                                    allemails.push(emailObj);
                                });
                                type = apiConfig.seviceUrl[componentName].type
                                payload = {
                                    "endTime": slotdata.endTime,
                                    "startTime": slotdata.startTime,
                                    "attendees": allemails,
                                    "title": title
                                }
                            }

                        }else if(componentName === 'GetDriveData'){
                            var action = context.entities.ActionEntity;
                            var sentence  = context.userInputs.originalInput.sentence.toLowerCase();
                            url += apiConfig.seviceUrl[componentName].url;
                            url = util.format(url, mappedkuid);
                            var name  = context.entities.PersonEntity;
                            var keyword = context.entities.KeyWordEntity;
                            var docType = context.entities.DocumentType;
                            var dateEntity = context.entities.DateCompositEntity;
                            var fromDate,toDate;
                            if(dateEntity){
                                if(dateEntity.Date_Period){
                                    fromDate = dateEntity.Date_Period.fromDate;
                                    toDate   = dateEntity.Date_Period.toDate;
                                }else if(dateEntity.Date_Time){
                                    fromDate = dateEntity.Date_Time;
                                    toDate = dateEntity.Date_Time;
                                }
                                else if(dateEntity.DateEntity){
                                    fromDate = dateEntity.DateEntity;
                                    toDate = dateEntity.DateEntity;
                                }
                                fromDate = new Date(fromDate).toISOString();
                                var date = new Date(toDate);
                                toDate = new Date(date.setDate(date.getDate()+1)).toISOString();
                            }
                            if(sentence.indexOf("shared to me")>-1){
                                action = "SharedBy";
                            }else if(sentence.indexOf("i shared")>-1|| sentence.indexOf("shared with")>-1 || sentence.indexOf("shared to")>-1||sentence.indexOf("my shared")>-1 || sentence.indexOf("shared by me")>-1){
                                action = "SharedTo";
                            }

                            payload = {
                                person  : name,
                                keyword : keyword,
                                docType : docType,
                                mappedkuid : mappedkuid,
                                streamId : context.botid,
                                fromDate  : fromDate,
                                toDate : toDate,
                                action  :action
                            }
                            type = apiConfig.seviceUrl[componentName].type;

                        }else if(componentName === 'ContactData'){
                            url += apiConfig.seviceUrl[componentName].url;
                            url = util.format(url, mappedkuid);
                            payload = {
                                "email":context.emailIds || []
                            }
                            type = apiConfig.seviceUrl[componentName].type;
                        }
                    serviceRequest(requestId, storeId, url, payload, type, headers);
                    callback(null, new sdk.AsyncResponse());
              });

    }
};
