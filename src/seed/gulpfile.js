var gulp = require('gulp-param')(require('gulp'), process.argv);
var runSequence = require('run-sequence');

var servers = ['api', 'webapps'];
servers.forEach(function (server) {
    gulp.task('start:'+server, function () {
        require('./servers/'+server);
    });
});
gulp.task('servers:start', function () {
    runSequence(servers.map(function (serverName) {
        return 'start:'+serverName;
    }));
})