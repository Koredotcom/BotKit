var botId = "st-a51421b1-39c9-5fb0-ba02-70f4455a7c5e";
var botName = "Flight search";
var sdk            = require("./lib/sdk");
var Promise        = sdk.Promise;
var request        = require("request");
var config         = require("./config");
//var mockServiceUrl = config.examples.mockServicesHost + '/cabbot';


var amdApiKey = "<%amdApiKey%>";

//Make request to service app
function findFlights(origin, destination, departureDate) {
	var serviceUrl = 'http://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey='+amdApiKey+'&number_of_results=5';
    return new Promise(function(resolve, reject) {
        request({
            url: serviceUrl+'&origin='+origin+'&destination='+destination+'&departure_date='+departureDate,
            method: 'get',
        }, function(err, res) {
            if (err) {
                return reject(err);
            }
	        resolve(JSON.parse(res.body));
        });
    });
}


//Make request to service app
function findAirports(searchTerm) {
    var airportsUrl="http://api.sandbox.amadeus.com/v1.2/airports/autocomplete?apikey="+amdApiKey;
    return new Promise(function(resolve, reject) {
        request({
            url: airportsUrl+"&term="+searchTerm,
            method: 'get',
        }, function(err, res) {
            if (err) {
                return reject(err);
            }
            resolve(JSON.parse(res.body));
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
    on_webhook      : function(requestId, data, componentName, callback) {
        var context = data.context;
	    if (componentName === 'FlightsInfo') {
		  var origin = context.entities.Source;
          var destination = context.entities.Dest;
          var departureDate = context.entities.Date;
          findFlights(origin,destination,departureDate)
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
        
    },
    on_agent_transfer : function(requestId, data, callback){
        return callback(null, data);
    }
};
