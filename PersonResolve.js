var Promise = require('bluebird');
var rp         =   require("request-promise");
var header = {
    "Authorization"   : '',
    "Content-Type" : 'application/json'
};

var messagesAllListAPI        = 'https://qa.kore.ai/api/1.1/search/users?';

var urlToCall   = messagesAllListAPI;
var action        = 'POST';
var headers;

var requestObject = {
    uri     : urlToCall,
    method  : action,
    headers : headers
};


function getPersons(_header,person){
    var perPay = [];
    if(  person.length>0){
        var len = person.length;//process.argv.length;
        for(var p=0;p<len;p++){
            var name = person[p];//process.argv[p];
            perPay.push({
                "by":{"fName":name,"lName":name,"koreId":name,"emailId":name},"matchAny":true
            })
        }
    }
    requestObject.headers = _header;
    var msg_response = {};
    var finalres = [];
    var msgresponse = Promise.map(perPay, function (per) {
        var each = {};
        requestObject.body = JSON.stringify(per);
        return rp(requestObject)
            .then(function(body) {
                var res = JSON.parse(body);
                var _name = per.by.fName;
                var eachArr = [];
                    res.results.forEach(function(element){
                        var eachElement = {};
                        eachElement.id   = element.id;
                        eachElement.name = element.firstName +' '+ element.lastName;
                        eachElement.emailId = element.emailId;
                        eachArr.push(eachElement);
                    })
                    each[_name] = eachArr;
                    return each;
            })
    })
    return Promise.all(msgresponse)
        .then(function(result){
            return result;
         });
}

var resPerson = function resolvePerson(token,params) {
    var person;
    var paramObj = JSON.parse(params);
    if(paramObj && paramObj.name){
        person = paramObj.name;
    }else{
        Promise.resolve("Invalid Input");
    }
    header.Authorization = token;

    return  getPersons(header,person)
        .then(function(result){
           return result;
        });
};

module.exports = {
    resPerson:resPerson
};
