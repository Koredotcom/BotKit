var config      = require("../../../config");
var redisClient = require("../../RedisClient").createClient(config.redis);
var redisLib    = require("./redisLib").getInst(redisClient);
var BasePayload = require("../ObjectTypes/BasePayload");
var ObjectTypes = require("../ObjectTypes");
var errors      = require("../../app/errors");

module.exports = {
    saveRequest : function(requestId, request, callback) {
        if (!(request instanceof BasePayload)) {
            throw new errors.InvalidRequestObject();
        }
        var payload = request.toJSON();
        if (requestId !== payload.requestId) {
            throw new errors.BadRequest('incorrect requestId');
        }
        return redisLib.add(payload.requestId, payload)
            .nodeify(callback);
    },
    getRequestData : function(requestId, callback) {
        return redisLib.get(requestId)
            .then(function(reqData) {
                var ObjectType = ObjectTypes[reqData.__payloadClass];
                return new ObjectType(requestId, reqData.botId, reqData.componentId, reqData);
            })
            .nodeify(callback);
    },
    removeRequest : function(request, callback) {
        if (!(request instanceof BasePayload)) {
            throw new errors.InvalidRequestObject();
        }
        return redisLib.remove(request.requestId)
            .nodeify(callback);
    },
    updateRequest : function(request, callback) {
        if (!(request instanceof BasePayload)) {
            throw new errors.InvalidRequestObject();
        }
        var payload = request.toJSON();
        return redisLib.edit(payload.requestId, payload)
            .nodeify(callback);
    }
};
