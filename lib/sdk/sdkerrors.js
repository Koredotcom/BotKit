module.exports = {
    "RedisNotAvailable": {
        'message': 'Redis not available',
        'customCode': 'REDIS_NOT_AVAILABLE',
        'statusCode': 400
    },
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
