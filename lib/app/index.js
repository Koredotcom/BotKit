var express          = require('express');
var morgan           = require('morgan');
var apiKeyMiddleware = require('./middlewares/APIKeyMiddleware');
var bodyparser       = require('body-parser');
var routes           = require('./routes');
var errorHandler     = require("./serviceHandler").errorHandler;
var errors           = require("./errors");
var path             = require("path");

function Application( expressapp , config ){
    this.app    = expressapp || express();
    this.config = config;
}

//Application.prototype.initservice = function()
//};

Application.prototype.initroutes = function(){
    routes.load(this.app);
};

Application.prototype.attachaccesslogger = function(){
    var self = this;

    if(this.config.app.accesslogs && this.config.app.accesslogger){

        console.info("************************************");
        console.info("*     accesslogging is enabled     *");
        console.info("************************************");

        //capture the timestamp the service received the request (eventloop dispatch)
        this.app.use(function(req , res , next){
            req.requestsr = new Date().valueOf();
            return next();
        });


        morgan.token('content-length', function getContentLength(req) {
            return req.headers['content-length'] || "requestcontentlength";
        });

        morgan.token('requestid', function getRequestId(req) {
            return req.headers['x-requestid'] || "requestid";
        });

        //capture the timestamp the client dispatched the request
        //client to add the custom header "x-requestcs"
        morgan.token('requestcs', function getRequestcs(req) {
            return req.headers['x-requestcs'] || "requestcs";
        });

        morgan.token('requestsr', function getRequestsr(req) {
            return req.requestsr;
        });

        //captures the delay (client requestsent  - service received the request)
        morgan.token('requestdelay', function getRequestDelay(req) {
            if(req.headers["x-requestcs"] && isFinite(req.headers["x-requestcs"])){
                return (req.requestsr  - Number(req.headers["x-requestcs"]));
            }
            return "-";
        });

        //the process servicing the request
        morgan.token('pid', function getPid() {
            return process.pid;
        });

        //add extra token
        morgan.format('combined-trace', ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :content-length :res[content-length] :pid(pid) :requestcs(cs) :requestsr(sr)  :requestdelay(d) :response-time ms :requestid(rid) ":referrer" ":user-agent"');
        var  stream = {
            write: function(message /*, encoding*/){
                self.config.app.accesslogger.info(message);
            }
        };
        this.app.use(morgan("combined-trace" , { "stream": stream }));
    }
    else{
        console.info("***************WARNING***************");
        console.info("*     accesslogging is disabled     *");
        console.info("*************************************");
    }
};

Application.prototype.loadmiddlewares = function(){
    this.app.use(bodyparser());

    var apikeyMW = apiKeyMiddleware({});
    this.app.use('/sdk/', apikeyMW);
};

Application.prototype.handleError = function(err, req, res, next){
    if (err instanceof SyntaxError) {
        err = new errors.ValidationError('Invalid JSON');
    }
    console.log("Error: ", err && err.stack);
    return errorHandler(err, req, res, next);
};

Application.prototype.load = function(){
    this.loadmiddlewares();
    this.initroutes();
    this.app.use('/', this.handleError);
    this.app.use(express.static(path.join(__dirname , '../../views')));
    return this.app;
 };

module.exports = Application;
