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
        if (code !== 78){
            console.warn('Starting a new worker');
            cluster.fork();
        }
    });

    if ((process.platform !== 'win32')) {
        process.on('SIGINT', function () {
            process.exit(0);
        });
        process.on('exit', function (code) {
            if (code === 0) {
                console.log('\bbotkit: master [PID %d] stopped', process.pid);
                console.log('\033[1Gbye');
                return;
            }
            console.log('botkit: master [PID %d] exiting with code %d', process.pid, code);
        });
    }
};

Server.prototype.startcluster = function(){
    if(cluster.isMaster){
        return this.startmaster();
    }
    this.startworker();
};

Server.prototype.startworker = function(){
    var self;
    var app;
    var server;

    self    = this;
    app     = this.application.load();
    server  = app.listen(this.config.server.port , function(){
                    var host = server.address().address;
                    var port = server.address().port;
                    console.info('app listening at http://%s:%s', host, port);
                });

    server.on('error', function (err) {
        switch (err.code) {
            case 'EADDRINUSE':
                console.error('botkit: worker %d [PID: %d] failed to listen on port %d [EADDRINUSE]',
                    cluster.worker && cluster.worker.id, process.pid, self.config.server.port);
                process.exit(78);
                break;
            case 'EACCES':
                console.error('botkit: worker %d [PID: %d] cannot access port %d [EACCES]',
                    cluster.worker && cluster.worker.id, process.pid, self.config.server.port);
                process.exit(78);
                break;
            default:
                self.shutdown();
                server.close();
                break;
        }
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

Server.prototype.shutdown = function() {
    var shutdownTimer = setTimeout(function () {
        process.exit(1);
    }, 5000);
    shutdownTimer.unref();

    return shutdownTimer;
};

module.exports = Server;
