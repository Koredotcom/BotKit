
/**
 * @module Key base Autherization Middleware
 */
var _ = require("lodash");
var jwt = require("jwt-simple");
var credentials = require('../../../../config').credentials;

function APIKeyMiddleware() {
	// Checking the api key with config
    function isValidAPI(header){
        if(_.has(header, 'apikey')){//DEPRECATED::SOON TO BE REMOVED
            if(header.apikey===credentials.apikey)
                return true;
        }
        if(_.has(header, 'token')){
            var appId;
            try {
                appId = jwt.decode(header.token, credentials.apikey).appId;
            } catch(e){
                console.info("invalid jwt token");
            }
            return appId === credentials.appId;
        }
        return false;
    }

    return function(req, res, next) {
		if(isValidAPI(req.headers)){
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
