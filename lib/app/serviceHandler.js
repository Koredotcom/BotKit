/**
 * handles rest and service calls
 * and resolve response by service results
 * @module serviceHandler
 *
 */

var errors = require('./errors');

/**
 * constructs response using successfull result of service
 * @param {*} serviceResult
 * @returns {Object} object with 'result' and success 'status'
 */
function constructResponse(serviceResult) {
    var result = {
        'body': (serviceResult && serviceResult.body) || serviceResult || null,
        'headers': (serviceResult && serviceResult.headers) || {},
        'status': serviceResult.statusCode || 200
    };
    return result;
}

function safelySetHeaders(res, headers) {
    if (res.headersSent) return;

    res.header(headers);
}

/**
 * resolves an exception to appropriate response
 * @param {SDKError} e
 * @returns {Object} with 'body' and 'status' keys
 */
function constructErrorResponse(e) {
    if (!(e instanceof Error)) {
        console.warn('WARNING: Expecting Error, but got %s',
                JSON.stringify(e) || (e.toString && e.toString() || 'invalid argument'));
    }

    console.error("ERROR", e, e.stack);

    if ((errors[e.name] === undefined) || (e.name === 'SDKFatalError') || !e.statusCode) {
        //something went really wrong?
        //log it and create sanitized `Internal Server Error`
        e = new errors.Internal();
    }
    var errResponse = e.toResponse();
    return errResponse;
}

/**
 * error handler - given an Error, respond appropriately
 * @param {Error} err - Error object
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function errorHandler(err, req, res) {
    var errResponse = constructErrorResponse(err);
    safelySetHeaders(res, errResponse.headers);
    res.status(errResponse.status)
       .send(errResponse.body);
}

/**
 * helper for rest api
 * resolves Promise returning services to json responses
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} req
 * @param {Promise} serviceP
 * @returns {Promise} promise to resolve service result to response
 */
function serviceHandler (req, res, serviceP) {

    return serviceP
        .then(constructResponse)
        .catch(constructErrorResponse)
        .then(function (result) {
            safelySetHeaders(res, result.headers);
            res.status(result.status).send(result.body);
        });
        //TODO: .catch and die?

}

exports.serviceHandler         = serviceHandler;
exports.errorHandler           = errorHandler;
