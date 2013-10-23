var async = require('async')

//---------------------------------------------------------
// gets all usernames
//---------------------------------------------------------

module.exports.usernames = function (io, callback) {

    var clients = io.sockets.clients();

    async.map(clients, function (client, callback) {

        client.get('username', function (err, username) {

            callback(null, username);
        })

    }, function (err, usernames) {

        callback(usernames)
    })
}

//---------------------------------------------------------
// gets a socket by the username
//---------------------------------------------------------

module.exports.get_socket = function(io, username, callback) {

    var clients = io.sockets.clients();

    async.filter(clients, function(client, callback) {

        client.get('username', function(err, _username) {

            if (_username == username) {

                callback(true)

                return;
            }

            callback(false)
        })

    }, function(clients) {
        
        if (clients.length > 0) {

            callback(clients[0])

            return;
        }

        callback(null);
    });
}

