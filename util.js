var async = require('async')

//---------------------------------------------------------
// gets all userids
//---------------------------------------------------------

module.exports.userids = function (io, callback) {

    var clients = io.sockets.clients();

    async.map(clients, function (client, callback) {

        client.get('userid', function (err, userid) {

            callback(null, userid);
        })

    }, function (err, userids) {

        callback(userids)
    })
}

//---------------------------------------------------------
// gets a socket by the userid
//---------------------------------------------------------

module.exports.get_socket = function(io, userid, callback) {

    var clients = io.sockets.clients();

    async.filter(clients, function(client, callback) {

        client.get('userid', function(err, _userid) {

            if (_userid == userid) {

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

