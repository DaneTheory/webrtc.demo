// ---------------------------------------------------
//
// modules
//
// ---------------------------------------------------

var http = require('http')

var appex = require('appex')

var util = require('./util.js')

var socket = {

    io: require('socket.io')
};

var logging = false;

// ---------------------------------------------------
// appex
// ---------------------------------------------------

var app = appex({ program: './app.ts', devmode: true, logging: logging, context: { compiler: new appex.compiler.Compiler() } });

var server = http.createServer(app); 

// ---------------------------------------------------
// socket.io
// ---------------------------------------------------

var io = socket.io.listen(server, { log: logging });

io.sockets.on('connection', function (socket) { 
    
    socket.emit('identity')

    socket.on('identity', function(username) {

        socket.set('username', username)
    })

    socket.on('candidate', function(data) {

        console.log('candidate: "' + data.from + '" -> "' + data.to + '"')

        util.get_socket(io, data.to, function(other) {
            
            other.emit('candidate', data)
        })
    });

    socket.on('offer', function (data) {

        console.log('offer: "' + data.from + '" -> "' + data.to + '"')

        util.get_socket(io, data.to, function(other) {
            
            other.emit('offer', data)
        })
    })

    socket.on('answer', function (data) {

        console.log('answer: "' + data.from + '" -> "' + data.to + '"')

        util.get_socket(io, data.to, function(other) {

            if(other) {

                other.emit('answer', data)
            }
        })
    })
})

// ---------------------------------------------------
// intervals
// ---------------------------------------------------

setInterval(function() {

    util.usernames(io, function(usernames) {

        io.sockets.emit('usernames', usernames)
    })

}, 1000);

// ---------------------------------------------------
// listen
// ---------------------------------------------------

server.listen(process.env.port || 5000)
