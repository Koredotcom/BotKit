var errors = require('../../app/errors');
var requestStore = require("./requestStore");

module.exports = function sendAsyncResponse(request, response) {
    if (!request.callbackUrl) {
        console.error('Async response is not supported');
        throw new errors.AsyncResponseNotSupported();
    }
    return requestStore.saveRequest(request.requestId, request)
        .then(function() {
            response = response.toJSON();
            response.statusCode = 202;
            return response;
        });
};
