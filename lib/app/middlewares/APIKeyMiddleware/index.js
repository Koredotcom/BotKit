
/**
 * @module Key base Autherization Middleware
 */
var _ = require("lodash");
var jwt = require("jwt-simple");
var config = require('../../../../config');
var apiPrefix = config.app.apiPrefix;
var credentials = config.credentials;
var jwtProps = config.jwt;

function APIKeyMiddleware() {
    var botIdregex = /(?<botId>st-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-5[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})/;
	// Checking the api key with config
    function isValidAPI(header,url){
        if(apiPrefix && apiPrefix.length > 0)
            url = url.slice(apiPrefix.length);

        var botId = url.match(botIdregex).groups.botId;
        var cred = credentials[botId]?credentials[botId]:credentials;
        var jwtAlg = (jwtProps[botId] ? jwtProps[botId].jwtAlgorithm : jwtProps.jwtAlgorithm) || "HS256" ; //Adding HS256 as default algorithm if config is not set.

        if(_.has(header, 'apikey')){//DEPRECATED::SOON TO BE REMOVED
            if(header.apikey===cred.apikey)
                return true;
        }
        if(_.has(header, 'token')){
            var appId;
            try {
                appId = jwt.decode(header.token, cred.apikey, false, jwtAlg).appId;
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
