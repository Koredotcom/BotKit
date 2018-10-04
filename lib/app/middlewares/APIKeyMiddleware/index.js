
/**
 * @module Key base Autherization Middleware
 */
var _ = require("lodash");
var jwt = require("jwt-simple");
var config = require('../../../../config');
var apiPrefix = config.app.apiPrefix;
var credentials = config.credentials;

function APIKeyMiddleware() {
	// Checking the api key with config
    function isValidAPI(header,url){
        if(apiPrefix && apiPrefix.length > 0)
            url = url.slice(apiPrefix.length);

        var botId = url.split("/")[3];
        var cred = credentials[botId]?credentials[botId]:credentials;

        if(_.has(header, 'apikey')){//DEPRECATED::SOON TO BE REMOVED
            if(header.apikey===cred.apikey)
                return true;
        }
        if(_.has(header, 'token')){
            var appId;
            try {
                appId = jwt.decode(header.token, cred.apikey).appId;
            } catch(e){
                console.info("invalid jwt token");
            }
            return appId === cred.appId;
        }
        return false;
    }

    return function(req, res, next) {
		if(isValidAPI(req.headers, req.url)){
			return next();
        }
        var error = {
            msg: "Invalid apikey",
            code: 4002
        };
        var errors = [error];
        var resp = {};
        resp.errors = errors;
        res.status(401);
        res.setHeader('response-error-description', JSON.stringify(resp));
        return res.json(resp);
    };
}

module.exports = APIKeyMiddleware;
