
/**
 * @module Key base Autherization Middleware
 */
var apikey = require('../../../../config').credentials.apikey;

function APIKeyMiddleware() {
	// Checking the api key with config
    function isValidAPI(header){
		if(header.apikey===apikey)
			return true;
		else return false;
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
