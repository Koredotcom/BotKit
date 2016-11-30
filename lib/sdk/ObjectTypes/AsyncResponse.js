function AsyncResponse(message){
    this.message = message;
    this.toJSON = function() {
        return {
            customCode : "ASYNC_RESPONSE",
            message    : message || 'AsyncResponse',
            statusCode : 202
        };
    };
}

module.exports = AsyncResponse;
