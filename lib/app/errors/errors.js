module.exports = {
    "NotFound" : {
        'message': 'Not Found',
        'customCode': 'NOT_FOUND',
        'statusCode': 404
    },
    "Internal" : {
        'message': 'Internal Server Error',
        'customCode': 'INTERNAL_SERVER_ERROR',
        'statusCode': 500
    },
    'InvalidArguments': {
        'message': 'InvalidArguments',
        'customCode': 'INVALID_ARGUMENTS',
        'statusCode': 400
    },
    'InsufficientArguments': {
        'message': 'InsufficientArguments',
        'customCode': 'INSUFFICIENT_ARGUMENTS',
        'statusCode': 400
    },
    'ValidationError': {
        'message': 'Validation errors/ Invalid arguments',
        'customCode': 'VALIDATION_ERROR',
        'statusCode': 412
    },
    'Timeout': {
        'message': 'Request Timed Out',
        'customCode': 'REQUEST_TIMEOUT',
        'statusCode': 408
    },
    "HandlerNotFound" : {
        'message': 'Handler Not Found',
        'customCode': 'HANDLER_NOT_FOUND',
        'statusCode': 404
    }
};
