//-------------------------------------------------------
// appex configuration
//-------------------------------------------------------

var appex = require('appex')

var app     = appex({

    program: './app.ts', 

    devmode: true, 

    logging: true, 

    context: {

        compiler : new appex.compiler.Compiler()
    }
})

//-------------------------------------------------------
// http configuration
//-------------------------------------------------------

var web = require('http').createServer(function(request, response){

    app(request, response)

}).listen(process.env.port || 5000)

//-------------------------------------------------------
// socket.io configuration
//-------------------------------------------------------

var io = require('socket.io').listen(web, {log : false})

//-------------------------------------------------------
// neptune configuration
//-------------------------------------------------------

var neptune = require('neptune')

var server = new neptune.Server(io, new neptune.ConsoleLogger())
