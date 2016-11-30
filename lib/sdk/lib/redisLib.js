var Promise = require('bluebird');
var debug   = require('debug')('RedisLib');

function redislib(client, options) {
    this.client = Promise.promisifyAll(client);
    this.redisCollection = 'BotKit';
}

redislib.prototype.get = function(requestId) {
    return this.client.hgetAsync(this.redisCollection, requestId)
        .then(function(data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                debug(e);
                throw e;
            }
            return data;
        });
};

redislib.prototype.add = function (requestId, data){
    data = JSON.stringify(data);
    return this.client.hsetAsync(this.redisCollection, requestId, data)
    .catch(function(e){
        debug(e);
        throw e;
    });
};

redislib.prototype.remove = function (requestId) {
    return this.client.hdelAsync(this.redisCollection, requestId)
    .catch(function(e){
        debug(e);
        throw e;
    });
};

redislib.prototype.edit = function (requestId, data) {
    return this.remove(requestId)
    .bind(this)
    .then(function(){
        this.add(data);
    })
    .catch(function(e){
        debug(e);
        this.add(data);
    });
};

module.exports = {
    "getInst": function(client, options){
        return (new redislib(client,options));
    }
};
