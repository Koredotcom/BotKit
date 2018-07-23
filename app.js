var Application = require("./lib/app");
var Server      = require("./lib/server");
var sdk         = require("./lib/sdk");
var config      = require("./config");

var app    = new Application(null, config);
var server = new Server(config, app);

server.start();

sdk.registerBot(require('./FindAFlight.js'));
sdk.registerBot(require('./SimpleConversationalBot.js'));
sdk.registerBot(require('./SimpleConversationalBotWithMultipleBotId.js'));
sdk.registerBot(require('./GuessTheNumber.js'));
sdk.registerBot(require('./BookACab.js'));
sdk.registerBot(require('./OrderAPizza.js'));
sdk.registerBot(require('./BotVariables.js'));
