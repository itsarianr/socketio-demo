var express = require('express')(),
    http = require('http').Server(express),
    io = require('socket.io')(http);
    // redis = require('redis'),
    // client = redis.createClient();

express.get('/', function(req, res) {
    res.sendfile('index.html');
});

express.get('/app', function(req, res) {
    res.sendfile('app.js');
});

// client.on('error', function(err) {
//     console.log('REDIS ERROR: ' + err);
// });

io.on('connection', function(socket) {
    var username = socket.request._query.username;
    var channel = socket.request._query.channel;
    console.log(username + ' connected!');
    socket.join(channel);
    socket.on('message', function(data) {
        io.to(channel).emit('message', {
            username: data.username,
            message: data.message,
            channel: channel,
            datetime: new Date()
        });
    });
    socket.on('typing', function(data) {
        io.to(channel).emit('typing', {
            username: data.username
        });
    });
    socket.on('type-end', function(data) {
        io.to(channel).emit('type-end', {
            username: data.username
        });
    });
    socket.on('disconnect', function() {
        console.log(username + ' disconnected');
    });
    // var tweets = setInterval(function() {
    // 	socket.volatile.emit('message', 'volatile...');
    // }, 1000);
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
