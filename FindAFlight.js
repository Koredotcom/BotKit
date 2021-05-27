var botId = "st-48d9b4a2-b544-5cda-8313-31fbe0e3a8b9";
var botName = "Flight Search";
var sdk            = require("./lib/sdk");
var Promise        = sdk.Promise;
var request        = require("request");

var findFlightServiceUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
var findAirportServiceUrl = 'https://test.api.amadeus.com/v1/reference-data/locations';
var getTokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
var amdAccessToken;

// Make a request to get the access token
function getAccessToken(clientId, clientSecret) {
    var url = getTokenUrl;
    return new Promise(function(resolve, reject) {
        const requestOptions = {
            url: url,
            method: 'post',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }
        };
        request(requestOptions, function(err, res) {
            if(err) {
                return reject(err);
            }
            // console.log(res)
            var temp = JSON.parse(res.body);
            var token = temp['access_token'];
            resolve(token);
        });
    });
}

//Make request to service app to get the flight between source and destination
function findFlights(origin, destination, departureDate, currency) {
    var url = findFlightServiceUrl+'?originLocationCode='+origin+'&destinationLocationCode='+destination+'&departureDate='+departureDate+'&adults=1&max=5&currencyCode='+currency;
    return new Promise(function(resolve, reject) {
        const requestOptions = {
            url: url,
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + amdAccessToken
            }
        };
        request(requestOptions, function(err, response) {
            if(err) {
                return reject(err);
            }
            resolve(JSON.parse(response.body));
        });
    });
}


//Make request to service app
async function findAirports(searchTerm) {
    var url = findAirportServiceUrl+"?keyword="+searchTerm+"&subType=AIRPORT";
    return new Promise(function(resolve, reject) {
        const requestOptions = {
            url: url,
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + amdAccessToken
            }
        };
        request(requestOptions, function(err, response) {
            if(err) {
                console.log(err);
                return reject(err);
            }
            resolve(JSON.parse(response.body));
        });
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
    on_webhook      : async function(requestId, data, componentName, callback) 
    {
        var context = data.context;
        var currency = context.session.BotUserSession.currency;
        getAccessToken(context.session.BotUserSession.clientId, context.session.BotUserSession.clientSecret).then(function(token) {
            amdAccessToken = token;
            if (componentName === 'FlightsInfo') {
                var origin = context.entities.Source;
                var destination = context.entities.Dest;
                var departureDate = context.entities.Date;
                findFlights(origin,destination,departureDate,currency)
                .then(function(flightResults) {
                    data.context.flightResults = flightResults;
                    callback(null, data);
                });
            } else if(componentName === 'GetSourceAirports'){
                var searchTerm = context.entities.SourceName;
                findAirports(searchTerm)
                .then(function(airportResults) {
                    data.context.sourceAirports = airportResults;
                    callback(null, data);
                });
            } else if(componentName === 'GetDestAirports'){
                var searchTerm = context.entities.DestName;
                findAirports(searchTerm)
                .then(function(airportResults) {
                    data.context.destAirports = airportResults;
                    callback(null, data);
                });
            }
        });
    }
};