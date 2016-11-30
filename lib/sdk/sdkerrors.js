module.exports = {
    "AsyncResponseNotSupported" : {
        'message'    : 'Async response not supported for event type',
        'customCode' : 'ASYNC_RESPONSE_NOT_SUPPORTED',
        'statusCode' : 400
    },
    "SendAsyncResponse" : {
        'message'    : 'async response',
        'customCode' : 'ASYNC_RESPONSE',
        'statusCode' : 202
    },
    "InvalidRequestObject" : {
        'message'    : 'request object is not an instanceof BasePaylaod',
        'customCode' : 'INVALID_REQUEST_OBJECT',
        'statusCode' : 400
    }
};
