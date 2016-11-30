var cluster     = require('cluster');

function Server(serverconfig , application){
    this.config = serverconfig;
    this.application = application;
}

Server.prototype.startmaster = function(){
    var nworkers = this.config.server.nworkers || require('os').cpus().length;

    console.info('Master cluster setting up ' + nworkers + ' workers...');

    for(var i = 0; i < nworkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.info('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.warn('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.warn('Starting a new worker');
        cluster.fork();
    });
};

Server.prototype.startcluster = function(){
    if(cluster.isMaster){
        return this.startmaster();
    }
    this.startworker();
};

Server.prototype.startworker = function(){
    var app = this.application.load();
    var server = app.listen(this.config.server.port , function(){
                    var host = server.address().address;
                    var port = server.address().port;
                    console.info('app listening at http://%s:%s', host, port);
                });
};

Server.prototype.start = function(){
    if(this.config.server.cluster !==true){
        return this.startworker();
    }
    else{
        return this.startcluster();
    }
};

module.exports = Server;
