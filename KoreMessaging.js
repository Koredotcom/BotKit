var botName        = "KoraAssistantNew";
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
var utility        = require('./utility.js');
var inviteesEmailIds = [];

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
    console.log("url",url,JSON.stringify(payLoad,4,null),type,headers)
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
            console.log("response data === ",JSON.stringify(resBody),'-----',typeof(resBody) );
            data.context['userInfo']= resBody;
            data.context.successful = true;
            if(resBody && resBody.errors){
                data.context.successful = false;
            }

            sdk.respondToHook(data);
        });
}

function prepareName(al, meetingData, allU){
    var nameList = "",emailIds = [];
    var len = al.length;
    for(var i=0; i<len; i++){
        if(al[i]  != meetingData.owner.id){
            var alU = al[i].indexOf('@') >-1 ? al[i].replace(/\./g,"-") : al[i];
            var nObj = allU[alU];
            inviteesEmailIds.push(nObj.emailId)
            var nm =nObj && nObj.name.split(" ")[0];
            if(i<(len-1))
                nameList += nm+ ", "
            else{
                nameList += nm;
            }
        }
    }
    return nameList;
}

function prepareTemplateData(meetingData, context, timeZone){
    var meetingData = meetingData;
    var msg = "", buttons = [], count = 0;
    if(meetingData){
        meetingData.slots && meetingData.slots.forEach(function(slot){
            var button =  {
                "content_type":"postback",
                "title":"",
                "payload":""
            }
            var format = "ddd, MMM D, h:mm A";
            if(slot.al){
                count ++ ;
                msg += String(count) + ". " ;
                msg += utility.getDateTimeByZone(new Date(slot.start),timeZone,format) + " - "
                msg +=  utility.getDateTimeByZone(new Date(slot.end), timeZone, "h:mm A") + "\n";
                msg +=  prepareName(slot.al, meetingData, meetingData.allU);

                if(slot.al.length==0 ||(slot.al.length==1 && slot.al[0]==meetingData.owner.id)){
                    msg += " You are attending. \n"
                }else{
                    msg += " and You are attending. \n"
                }
                button.title ="Schedule for Slot "+ count;
                button.payload = slot.start + "_" +slot.end;
                buttons.push(button);
            }
        })
        if(meetingData.dU.length>0){
            msg +="People who declined: \n";
            msg += prepareName(meetingData.dU, meetingData, meetingData.allU) +"\n";
        }
        if(meetingData.pU.length>0){
            msg +=  "People who did not respond: \n";
            msg += prepareName(meetingData.pU, meetingData, meetingData.allU);
        }
        buttons.push({"content_type":"postback","title":"Cancel Meeting","payload":"CANCEL"});
        buttons.push({"content_type":"postback","title":"Skip","payload":"SKIP"});
        context['emailIds'] = inviteesEmailIds;
        inviteesEmailIds = [];
        message = {
            "type":"template",
            "payload":{
                "text":msg,
                "template_type":"quick_replies",
                "quick_replies":buttons
            }
        }
        context['templateData'] = message;

    }
    return context;

}

function onSuccessCall(requestId,callbackData, resBody) {
    sdk.getSavedData(requestId)
        .then(function(data) {
            console.log("response data === ",JSON.stringify(resBody),'-----',typeof(resBody) );
            data.context['userInfo']= resBody;
            data.context.successful = true;
            if(resBody && resBody.errors){
                data.context.successful = false;
            }else{
                var contextMeta = data.context.session.BotUserSession.lastMessage.messagePayload.meta;
                var timeZone = (data.context.session.UserContext.customData && data.context.session.UserContext.customData.KATZ)
                    || (contextMeta && contextMeta.timezone) ||  "Asia/Kolkata";
                data.context =prepareTemplateData(resBody, data.context,timeZone) ;
            }
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

function serviceRequestCall(requestId, storeId, url,userDeatils, type, headers) {
    serviceRequestData(requestId, storeId, url, userDeatils,type, headers, {
        on_success : onSuccessCall,
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
        console.log("request data",JSON.stringify(data))
        var url = config.koraUrl + config.apiVersion;
        var callOut = true, type = "GET", reqBody = {}, payload = {};
        var context = data.context;
        var customData  = (context.session.BotUserSession.lastMessage.messagePayload.message &&
            context.session.BotUserSession.lastMessage.messagePayload.message.customData)
        var token = "bearer " +customData.kmToken
        var headers = {
            "Authorization"   : token,
            "Content-Type"    : "application/json"
        }
        console.log("context.session.BotUserSession.lastMessage.messagePayload.message.customData--------",customData);
        var mappedkuid  = customData.kmUId ||"u-81747194-d1ff-520d-bf13-1b4e833cc4f7";
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
                    var  keyWord = sw.removeStopwords(inputString.split(" "));
                    var regex = /(?:^|\W)#(\w+)(?!\w)/g, match, hashTags = [],tempHash = [];
                    while (match = regex.exec(inputString)) {
                        hashTags.push(match[1]);
                        tempHash.push("#"+match[1]);
                    }
                    keyWord = _.difference(keyWord,tempHash)
                    payload = {
                        type : "knowledge",
                        keywords : keyWord,
                        mappedkuid : mappedkuid,
                        streamId : context.botid,
                        hashTags : hashTags,
                        userInput    : inputString
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
                    var inputString = context.userInputs.originalInput.sentence;
                    var inputArr = inputString.split(" ");
                    var  keyWord = sw.removeStopwords(inputArr);
                    var regex = /(?:^|\W)#(\w+)(?!\w)/g, match, hashTags = [],tempHash = [];
                    while (match = regex.exec(inputString)) {
                        hashTags.push(match[1]);
                        tempHash.push("#"+match[1]);
                    }
                    var index = inputArr.indexOf("tag");
                    if(index>-1){
                        console.log(inputArr ,index)
                        if(index===inputArr.length-1){
                            hashTags.push(inputArr[index-1])
                        }else if((sw.removeStopwords([inputArr[index-1]])).length>0){
                            hashTags.push(inputArr[index-1])
                        }else{
                            hashTags.push(inputArr[index+1])
                        }
                    }

                    var key_entity =entities.KeywordExtraction  && entities.KeywordExtraction.split(" ");
                    payload = {
                        type         : "knowledge",
                        keywords     : key_entity,
                        mappedkuid   : mappedkuid,
                        streamId     : context.botid,
                        action       : action,
                        hashTags     : hashTags,
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
                    if(entities.SourceEntity){
                        payload.source =entities.SourceEntity;
                    }

                    if(sentence.indexOf("shared to me")>-1|| sentence.indexOf("shared with me")>-1){
                        console.log("shared to me");
                        payload.action = "sharedBy";
                    }else if(sentence.indexOf("i shared")>-1|| sentence.indexOf("shared with")>-1 || sentence.indexOf("shared to")>-1||sentence.indexOf("my shared")>-1 || sentence.indexOf("shared by me")>-1){
                        console.log("shared to",sentence);
                        payload.action = "sharedTo";
                    }
                    if(entities && entities.NewCompositeEntity) {
                        payload.timeRange = {};
                        var datecomposite = entities.NewCompositeEntity;
                        var de = datecomposite.dateperiodentityformeeting;
                        if (de && de.toDate) {
                            payload.timeRange['fromDate'] = new Date(de.fromDate).getTime();
                            payload['timeRange']['toDate'] = new Date(de.toDate).getTime();
                        }else if (datecomposite.datetimeformeeting) {
                            payload.timeRange['fromDate'] = new Date(datecomposite.datetimeformeeting).getTime();
                            payload['timeRange']['toDate'] = new Date().getTime();

                        }else if (datecomposite.dateonlyentity) {
                            var toDate = new Date().getTime();
                            var fromDate = new Date(datecomposite.dateonlyentity).getTime();
                            var temp = toDate;
                            if (fromDate > toDate) {
                                toDate = fromDate;
                                fromDate = temp;
                            }
                            payload.timeRange['fromDate'] = fromDate;
                            payload['timeRange']['toDate'] = toDate;

                        }else if (datecomposite.duration) {
                            payload.timeRange['fromDate'] = new Date(datecomposite.duration).getTime();
                            payload['timeRange']['toDate'] = new Date().getTime();

                        }else {
                            payload['timeRange']['toDate'] = new Date().getTime();
                            payload['timeRange']['fromDate'] = new Date(de.fromDate).getTime();
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
                    var sentence  = context.userInputs.originalInput.sentence.toLowerCase();
                    url += apiConfig.seviceUrl[componentName].url;
                    url = util.format(url, mappedkuid);
                    var name  =context.entities.EmailEntity || context.entities.EmailPersonEntity;
                    var keyword =(context.entities.KeywordExtraction && context.entities.KeywordExtraction)||"";
                    if(context.entities.EmailCompositeEntity){
                        context.entities.EmailCompositeEntity.forEach(function(key){
                            name = key['EmailPersonEntity'] || key['EmailEntity'];
                            keyword = key['KeywordExtraction'];
                        })
                    }
                    var fromDate = context.entities.DateEntity;
                    var dateCompositeEnt = context.entities.DateCompEntity;
                    var action = "sentBy";
                    if(sentence.indexOf("sent to me")>-1){
                        action =  "sentBy"
                    }else if(sentence.indexOf("sent to")>-1 || sentence.indexOf("sent by me")>-1 ||sentence.indexOf("i sent")>-1){
                        action =  "sentTo"
                    }
                    var dateMin = '', dateMax= '';
                    var timeZone = (context.session.UserContext.customData && context.session.UserContext.customData.KATZ) ||
                        (context.session.BotUserSession.lastMessage.messagePayload.meta && context.session.BotUserSession.lastMessage.messagePayload.meta.timezone) ||  "Asia/Kolkata";

                    if(dateCompositeEnt){
                        var datePeriod = dateCompositeEnt.Date_Period;
                        if(datePeriod) {
                            dateMin = datePeriod.fromDate;
                            dateMax = incrementDate(datePeriod.toDate);
                        } else if(dateCompositeEnt.DateEntity) {
                            dateMin = dateCompositeEnt.DateEntity;
                            dateMax = incrementDate(dateMin);
                        }
                        dateMax = utility.getDateTimeByZone(dateMax,timeZone,'YYYY-MM-DD');
                    }

                    var after = [];

                    if(dateMin){
                        after = ["after:"+dateMin+" before:"+dateMax] ;
                    }
                    var from,to;
                    if(action === "sentBy"){
                        from = (name && Array.isArray(name)?name:[name]);
                    }else{
                        from = [context.session.UserContext.emailId];
                        to = (name && Array.isArray(name)?name:[name]);
                    }
                    payload = {
                        mappedkuid : mappedkuid,
                        streamId : context.botid,
                        "person" :[
                            {
                                "from" : (from || []),
                                "to"  : (to || [])
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

                    var personsInfo = context.session.BotUserSession.personResolveResponse;
                    var excludeCurrentUser = context.session.BotUserSession.excludeCurrentUser;
                    var title = (context.entities.KeywordExtraction && context.entities.KeywordExtraction) || "";
                    var dateMin, dateMax, dateTime;
                    var contextMeta = context.session.BotUserSession.lastMessage.messagePayload.meta;
                    var timeZone = (context.session.UserContext.customData && context.session.UserContext.customData.KATZ)
                        || (contextMeta && contextMeta.timezone) || "Asia/Kolkata";
                    var dateEntity = context.entities.NewCompositeEntity;
                    var orgEmailId = context.session && context.session.UserContext && context.session.UserContext.emailId;
                    var dateEntityForFree = context.entities.Date_Time_Enity;
                    if(dateEntity){
                        var datePeriod = dateEntity.dateperiodentityformeeting;
                        if(datePeriod) {
                            dateMin = datePeriod.fromDate;
                            dateMax = datePeriod.toDate;
                        } else if(dateEntity.dateonlyentity) {
                            dateMin = dateEntity.dateonlyentity;
                        }else{
                            dateMin = dateEntity.datetimeformeeting;
                        }
                        dateTime = dateEntity.datetimeformeeting;

                    }else if(dateEntityForFree){
                        dateMin = dateEntityForFree;
                    }

                    if(dateMin && !dateMax) {
                        dateMax = dateMin;
                    }

                    console.log('dateMin : ', dateMin, 'dateMax : ', dateMax, ' - ', new Date(dateMin), '', new Date(dateMax));

                    var userIds = [];
                    userIds.push(mappedkuid);
                    personsInfo.forEach(function(e){
                        userIds.push(e.id);//EARLIER e.id
                    });

                    var nDays = daysdifference(new Date(dateMax),new Date(dateMin));

                    type = apiConfig.seviceUrl[componentName].type;
                    payload = {
                        "userIds"       : userIds,
                        "title"         : title,
                        "when"          : { starttime: dateMin, endtime: dateMax },
                        "duration"      : (context.entities.duration && context.entities.duration.amount) || 30
                    }
                }else if(componentName === 'ResolveKoraUser'){
                    url += apiConfig.seviceUrl[componentName].url;
                    url = util.format(url, mappedkuid);
                    var allemails = [];
                    var personsInfo = context.session.BotUserSession.personResolveResponse;
                    if(personsInfo){
                        personsInfo.forEach(function(e){
                            allemails.push(e.emailId);
                        });
                    }
                    payload =  {"emails": allemails};
                    type = apiConfig.seviceUrl[componentName].type;
                }else if(componentName === 'PersonResolveHook'){
                    url += apiConfig.seviceUrl[componentName].url;
                    url = util.format(url, mappedkuid);
                    payload =  {"names": context.session.BotUserSession.persons};
                    type = apiConfig.seviceUrl[componentName].type;
                }else if(componentName === 'CreateEvent'){
                    url += apiConfig.seviceUrl[componentName].url;
                    url = util.format(url, mappedkuid);
                    var slotdata = context.slotdata[0];
                    var title =  context.entities.KeywordExtraction || context.entities.NeedTitle || context.title;
                    var allemails = [];
                    var personsInfo = context.session.BotUserSession.personResolveResponse;
                    if(personsInfo){
                        personsInfo.forEach(function(e){
                            allemails.push(e.emailId);
                        });
                    }else{
                        allemails.push(_.uniq(context.emailIds));
                    }
                    if(context.extUserEmailIds){
                        allemails = allemails.concat(context.extUserEmailIds);
                    }
                    var description = context.meetingDesc;
                    if(!meetingType){
                        meetingType =(context.userInfo && context.userInfo.preview && context.userInfo.preview.mdesc)||"WebEx";
                    }
                    payload = {
                        "endTime"     : Number(slotdata.end),
                        "startTime"   : Number(slotdata.start),
                        "attendees"   : allemails,
                        "title"       : title,
                        "mId"         : context.mId,
                        "description" : description

                    }
                    type = apiConfig.seviceUrl[componentName].type;

                }else if(componentName == 'MeetingLookupHook'){
                    url += apiConfig.seviceUrl[componentName].url;
                    url = util.format(url, mappedkuid);
                    var keyword  = (context.entities.KeywordExtraction && context.entities.KeywordExtraction) || "";
                    var dateCompositeEnt = context.entities.NewCompositeEntity;
                    var dateMin = "",dateTime,dateMax="";
                    var timeZone = (context.session.UserContext.customData && context.session.UserContext.customData.KATZ) ||
                                   (context.session.BotUserSession.lastMessage.messagePayload.meta && context.session.BotUserSession.lastMessage.messagePayload.meta.timezone) ||  "Asia/Kolkata"; 

                    if(dateCompositeEnt){
                        var datePeriod = dateCompositeEnt.dateperiodentityformeeting;
                        if(datePeriod) {
                            dateMin = datePeriod.fromDate;
                            dateMax = datePeriod.toDate;
                        } else if(dateCompositeEnt.dateonlyentity) {
                            dateMin = dateCompositeEnt.dateonlyentity;
                        }else{
                            dateMin = dateCompositeEnt.datetimeformeeting;
                        }
                        dateTime = dateCompositeEnt.datetimeformeeting;

                    }

                    if(dateMin) {
                        dateMin = new Date(dateMin);
                    } else {
                        dateMin = new Date();
                    }
                    var singleEvent = ((context.entities && context.entities.NextImmediateList) || dateTime ) ? true:false;

                    if(dateMin && !dateMax) {
                        dateMax = dateMin;
                    }
                    var personsInfo = context.session.BotUserSession.personResolveResponse || [];
                    var emails   =  [];
                    personsInfo.forEach(function(e){
                        emails.push(e.emailId);
                    });

                    emails = emails.join('&');

                    payload = {
                        "emails"          : emails,
                        "starttime"       : utility.getDateTimeByZone(new Date(dateMin),timeZone,'YYYY-MM-DD'),
                        "endtime"         : utility.getDateTimeByZone(new Date(dateMax),timeZone,'YYYY-MM-DD'),
                        "keyword"         : keyword,
                        "singleEvent"     : singleEvent,
                        "dateTimeSingle"  : dateTime ? true:false,
                        "timeZone"        : timeZone  
                    }
                    type = apiConfig.seviceUrl[componentName].type;
                    console.log('Meeting Lookup :::::::::::::::::::::::::::::', JSON.stringify(payload));

                }else if(componentName === 'GetDriveData'){
                    var action = context.entities.ActionEntity;
                    var sentence  = context.userInputs.originalInput.sentence.toLowerCase();
                    url += apiConfig.seviceUrl[componentName].url;
                    url = util.format(url, mappedkuid);
                    var name  = context.entities.PersonEntity;
                    var keyword = context.entities.KeyWordEntity;
                    var docType = context.entities.DocumentType;
                    var dateEntity = context.entities.DateCompositEntity;
                    if(context.entities.DCompositeEntity){
                        context.entities.DCompositeEntity.forEach(function(key){
                            name = key['PersonEntity'];
                            keyword = key['KeyWordEntity'];
                            docType = key['DocumentType'];

                        })
                    }
                    var fromDate,toDate;
                    if(dateEntity){
                        if(dateEntity.Date_Period){
                            fromDate = dateEntity.Date_Period.fromDate;
                            toDate   = dateEntity.Date_Period.toDate;
                        }else if(dateEntity.Date_Time){
                            fromDate = dateEntity.Date_Time;
                            toDate = dateEntity.Date_Time;
                        }else if(dateEntity.DateEntity){
                            fromDate = dateEntity.DateEntity;
                            toDate = dateEntity.DateEntity;
                        }
                        fromDate = new Date(fromDate).toISOString();
                        var date = new Date(toDate);
                        toDate = new Date(date.setDate(date.getDate()+1)).toISOString();
                    }
                    if(sentence.indexOf("shared to me")>-1 || sentence.indexOf("shared with me")>-1 ){
                        action = "SharedBy";
                    }else if(sentence.indexOf("i shared")>-1|| sentence.indexOf("shared with")>-1
                        ||sentence.indexOf("shared to")>-1||sentence.indexOf("my shared")>-1
                        || sentence.indexOf("shared by me")>-1){
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

                }else if(componentName === 'CreateMeetingRequestObj'){
                    url += apiConfig.seviceUrl[componentName].url;
                    url = util.format(url, mappedkuid);
                    var selectedSlot = context.slotdata;
                    var optionalSlot = context.optionalSlots;
                    var title =  context.entities.KeywordExtraction || context.entities.NeedTitle;
                    var userIds = [];
                    var users = context.session.BotUserSession.personResolveResponse;
                    var extUsers = context.session.BotUserSession.extUsers;
                    if(extUsers){
                        userIds = userIds.concat(extUsers);
                        extUsers.forEach(function(extUser){
                            var obj = {id : extUser,emailId:extUser ,name : extUser.split("@")[0] };
                            users.push(obj);
                        });
                    }
                    var contextMeta = context.session.BotUserSession.lastMessage.messagePayload.meta;
                    var timeZone = (context.session.UserContext.customData && context.session.UserContext.customData.KATZ)
                        || (contextMeta && contextMeta.timezone) ||  "Asia/Kolkata";
                    var invitees  = [];
                    var count = 1;
                    var allU = {};
                    users.forEach(function(user){
                        userIds.push(user.id);
                        var key = user.id.replace(/\./g,"-");
                        allU[key] = {
                            id : user.id,
                            emailId : user.emailId,
                            name : user.name,
                            color : user.color
                        }
                        if(count<5){
                            invitees.push({
                                name  : user.name,
                                id    : user.id,
                                color : user.color
                            })
                        }
                        count ++ ;
                    });
                    var meetingType = context.entities.MeetingType;
                    var mdesc = context.meetingDesc;
                    var preview = {
                        invitees : invitees,
                        showMore : count > 4 ? true : false,
                        count    : count > 4 ? count-3 : 0,
                        meetingType : meetingType,
                        mdesc       : mdesc
                    }
                    payload = {
                        "attendees"      : userIds,
                        "title"          : title,
                        "preferredSlots" : context.slotdata,
                        "slots"          : context.optionalSlots,
                        "location"       : context.entities.locationExtraction,
                        "preview"        : preview,
                        "usersMap"       : allU,
                        "timezone"       : timeZone,
                        "offset"         : utility.getMinutes(utility.getDateTimeByZone(new Date,timeZone,'Z'))
                    }
                    type = apiConfig.seviceUrl[componentName].type;

                }else if(componentName === 'GetMeetingData'){
                    url += apiConfig.seviceUrl[componentName].url;
                    var mId  = context.mId ||"5b8784cc81ee670c15aa090a";
                    url = util.format(url, mappedkuid,mId);
                    type = apiConfig.seviceUrl[componentName].type;
                    if(context.istemplate ==true){
                        callOut = false;
                        serviceRequestCall(requestId, storeId, url, payload, type,headers);
                        callback(null, new sdk.AsyncResponse());
                    }

                }else if(componentName === 'UpdateMeetingRequest'){
                    url += apiConfig.seviceUrl[componentName].url;
                    var mId  = context.mId;
                    url = util.format(url, mappedkuid,mId);
                    var params = context.session.BotUserSession.lastMessage.messagePayload.message.params;
                    if(params ){
                        params  = (typeof params ==='string' ? JSON.parse(params) : params);
                        payload.preferredSlots = params.slots || []
                    }
                    type = apiConfig.seviceUrl[componentName].type;

                }else if(componentName === 'CancelMeetingRequest'){
                    url += apiConfig.seviceUrl[componentName].url;
                    var mId  = context.mId;
                    url = util.format(url, mappedkuid,mId);
                    type = apiConfig.seviceUrl[componentName].type;

                }else if(componentName === 'GetMeetingType'){
                    url += apiConfig.seviceUrl[componentName].url;
                    var mId  = context.mId;
                    url = util.format(url, mappedkuid);
                    type = apiConfig.seviceUrl[componentName].type;
                }else if(componentName === 'Send_Email_Webhook'){
                    url += apiConfig.seviceUrl[componentName].url;
                    var mId = context.mId;
                    url = util.format(url, mappedkuid);
                    type = apiConfig.seviceUrl[componentName].type;
                    payload = {
                        "subject" : context.entities.Mail_Subject,
                        "content" : context.entities.Email_Content,
                        "emailIds" :context.session.BotUserSession.emailIds
                    };
                }
                if(callOut){
                    serviceRequest(requestId, storeId, url, payload, type,headers);
                    callback(null, new sdk.AsyncResponse());
                }
            });
    }
};

function getNext15Mins(_dt){
    if(_dt){
        var dt = new Date(_dt);
        return dt.getTime()+900000;
    }else{
        return '';
    }
}

function daysdifference(date1, date2) {

    var ONEDAY = 1000 * 60 * 60 * 24;

    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    var difference_ms = Math.abs(date1_ms - date2_ms);

    return Math.round(difference_ms/ONEDAY);
}

function setHMSTime(d,h,m,s)
{
    d.setHours(h);
    d.setMinutes(m);
    d.setSeconds(s);
    return d;
}
