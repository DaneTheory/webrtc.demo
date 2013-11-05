var neptune;
(function (neptune) {
    var uuid = (function () {
        function uuid() {
        }
        uuid.create = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);

                return v.toString(16);
            });
        };
        return uuid;
    })();
    neptune.uuid = uuid;
})(neptune || (neptune = {}));


var neptune;
(function (neptune) {
    var EventEmiitter = (function () {
        function EventEmiitter() {
            this.listeners = [];
        }
        EventEmiitter.prototype.on = function (event, listener) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }

            this.listeners[event].push(listener);
        };

        EventEmiitter.prototype.emit = function (event) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (this.listeners[event]) {
                for (var i = 0; i < this.listeners[event].length; i++) {
                    var listener = this.listeners[event][i];

                    listener.apply(this, args);
                }
            }
        };
        return EventEmiitter;
    })();
    neptune.EventEmiitter = EventEmiitter;
})(neptune || (neptune = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var neptune;
(function (neptune) {
    var Settings = (function () {
        function Settings() {
            this.initializeConfiguration();

            this.initializeConstraints();
        }
        Settings.prototype.initializeConfiguration = function () {
            this.configuration = {
                iceServers: [
                    { url: "stun:23.21.150.121" },
                    { url: "stun:stun.l.google.com:19302" }
                ]
            };
        };

        Settings.prototype.initializeConstraints = function () {
            this.constraints = {
                mandatory: {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                },
                optional: [
                    { DtlsSrtpKeyAgreement: true },
                    { RtpDataChannels: true }
                ]
            };
        };
        return Settings;
    })();
    neptune.Settings = Settings;

    var Channel = (function (_super) {
        __extends(Channel, _super);
        function Channel(channelid, clientid, settings, logger) {
            var _this = this;
            _super.call(this);
            this.channelid = channelid;
            this.clientid = clientid;
            this.settings = settings;
            this.logger = logger;

            this.connected = false;

            this.send_queue = [];

            this.recv_queue = [];

            this.connection = new RTCPeerConnection(this.settings.configuration, this.settings.constraints);

            this.connection.onicecandidate = function (event) {
                _this.logger.log("connection: onicecandidate");

                if (event.candidate) {
                    _this.emit('candidate', event.candidate);

                    _this.connection.onicecandidate = function () {
                    };
                }
            };

            this.channel = this.connection.createDataChannel("default", { reliable: false });

            this.channel.onopen = function () {
                _this.logger.log("connection: onopen");

                _this.connected = true;

                _this.emit('open');
            };

            this.channel.onmessage = function (message) {
                _this.logger.log("connection: onmessage");

                _this.recv_queue.push(message.data);
            };

            this.channel.onclose = function () {
                _this.logger.log("connection: onclose");

                _this.connected = false;

                _this.emit('close');
            };

            this.channel.onerror = function (event) {
                _this.logger.log("connection: onerror");

                _this.emit('error');
            };

            setInterval(function () {
                if (_this.send_queue.length > 0) {
                    var message = _this.send_queue.shift();

                    _this.channel.send(message);
                }
            }, 1);

            setInterval(function () {
                if (_this.recv_queue.length > 0) {
                    var message = _this.recv_queue.shift();

                    _this.emit('message', message);
                }
            }, 1);
        }
        Channel.prototype.send = function (message) {
            this.send_queue.push(message);
        };

        Channel.prototype.close = function () {
            this.connected = false;

            this.channel.close();
        };

        Channel.prototype.acceptCandidate = function (candidate) {
            this.logger.log('connection: acceptCandidate');

            try  {
                if (candidate) {
                    this.connection.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (e) {
                this.logger.log('connection: error on acceptCandidate: ' + e.toString());
            }
        };

        Channel.prototype.createOffer = function (callback) {
            var _this = this;
            this.logger.log("connection: createOffer");

            this.connection.createOffer(function (offer) {
                offer.sdp = _this.transformOutgoingSdp(offer.sdp);

                _this.connection.setLocalDescription(offer);

                callback(offer);
            }, function (error) {
                _this.errorHandler(error);
            }, {});
        };

        Channel.prototype.acceptOffer = function (offer, callback) {
            var _this = this;
            this.logger.log("connection: createAnswer");

            this.connection.setRemoteDescription(new RTCSessionDescription(offer));

            this.connection.createAnswer(function (answer) {
                answer.sdp = _this.transformOutgoingSdp(answer.sdp);

                _this.connection.setLocalDescription(answer);

                callback(answer);
            }, function (error) {
                _this.errorHandler(error);
            }, {});
        };

        Channel.prototype.acceptAnswer = function (answer) {
            this.connection.setRemoteDescription(new RTCSessionDescription(answer));
        };

        Channel.prototype.errorHandler = function (error) {
            this.logger.log("connection: errorHandler: " + error);
        };

        Channel.prototype.transformOutgoingSdp = function (sdp) {
            var split = sdp.split("b=AS:30");

            if (split.length > 1) {
                var newSDP = split[0] + "b=AS:1638400" + split[1];
            } else {
                newSDP = sdp;
            }

            return newSDP;
        };
        return Channel;
    })(neptune.EventEmiitter);
    neptune.Channel = Channel;
})(neptune || (neptune = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var neptune;
(function (neptune) {
    var Client = (function (_super) {
        __extends(Client, _super);
        function Client(socket, logger) {
            var _this = this;
            _super.call(this);
            this.socket = socket;
            this.logger = logger;

            this.channels = [];

            this.waiters = [];

            this.socket.on('connect', function () {
                var _ns = _this.socket;

                _this.clientid = _ns.socket.sessionid;

                _this.emit('connect');
            });

            this.socket.on('error', function (reason) {
                _this.emit('error', reason);
            });

            this.socket.on('rooms', function (input) {
                _this.logger.log('neptune: on rooms');

                if (input.messageid) {
                    if (_this.waiters[input.messageid]) {
                        _this.waiters[input.messageid](input);

                        delete _this.waiters[input.messageid];
                    }
                }

                _this.emit('rooms', input);
            });

            this.socket.on('join', function (input) {
                if (input.messageid) {
                    if (_this.waiters[input.messageid]) {
                        _this.waiters[input.messageid](input);

                        delete _this.waiters[input.messageid];
                    }
                }
            });

            this.socket.on('leave', function (input) {
                if (input.messageid) {
                    if (_this.waiters[input.messageid]) {
                        _this.waiters[input.messageid](input);

                        delete _this.waiters[input.messageid];
                    }
                }
            });

            this.socket.on('roomstate', function (input) {
                _this.logger.log('neptune: on roomstate');

                if (input.messageid) {
                    if (_this.waiters[input.messageid]) {
                        _this.waiters[input.messageid](input);

                        delete _this.waiters[input.messageid];
                    }
                }

                _this.emit('roomstate', input);
            });

            this.socket.on('candidate', function (input) {
                _this.logger.log('client: on candidate');

                for (var i = 0; i < _this.channels.length; i++) {
                    var channel = _this.channels[i];

                    if (channel.channelid == input.channelid) {
                        channel.acceptCandidate(input.candidate);
                    }
                }
            });

            this.socket.on('offer', function (input) {
                _this.logger.log('client: on offer');

                _this.emit('call', input.info, function (accepted) {
                    if (accepted) {
                        _this.logger.log('client: offer accepted');

                        var channel = new neptune.Channel(input.channelid, input.from, new neptune.Settings(), _this.logger);

                        channel.on('candidate', function (candidate) {
                            var output = {
                                to: input.from,
                                channelid: input.channelid,
                                candidate: candidate
                            };

                            _this.socket.emit('candidate', output);
                        });

                        channel.on('open', function () {
                            _this.emit('channel', channel);
                        });

                        channel.acceptOffer(input.offer, function (answer) {
                            var output = {
                                messageid: input.messageid,
                                to: input.from,
                                channelid: input.channelid,
                                info: input.info,
                                answer: answer
                            };

                            _this.socket.emit('answer', output);
                        });

                        _this.channels.push(channel);
                    } else {
                        _this.logger.log('client: offer declined');
                    }
                });
            });

            this.socket.on('answer', function (input) {
                _this.logger.log('client: on answer');

                for (var i = 0; i < _this.channels.length; i++) {
                    var channel = _this.channels[i];

                    if (channel.channelid == channel.channelid) {
                        channel.acceptAnswer(input.answer);

                        if (input.messageid) {
                            if (_this.waiters[input.messageid]) {
                                _this.waiters[input.messageid](channel);

                                delete _this.waiters[input.messageid];
                            }
                        }
                    }
                }
            });
        }
        Client.prototype.call = function (clientid, info, callback) {
            var _this = this;
            var channel = new neptune.Channel(neptune.uuid.create(), clientid, new neptune.Settings(), this.logger);

            channel.on('candidate', function (candidate) {
                var output = {
                    to: clientid,
                    channelid: channel.channelid,
                    candidate: candidate
                };

                _this.socket.emit('candidate', output);
            });

            channel.on('open', function () {
                _this.emit('channel', channel);
            });

            channel.createOffer(function (offer) {
                var output = {
                    messageid: neptune.uuid.create(),
                    to: clientid,
                    channelid: channel.channelid,
                    info: info,
                    offer: offer
                };

                _this.waiters[output.messageid] = callback;

                _this.socket.emit('offer', output);
            });

            this.channels.push(channel);
        };

        Client.prototype.rooms = function (callback) {
            var output = {
                messageid: neptune.uuid.create()
            };

            this.waiters[output.messageid] = callback;

            this.socket.emit('rooms', output);
        };

        Client.prototype.roomstate = function (room, callback) {
            var output = {
                messageid: neptune.uuid.create(),
                room: room
            };

            this.waiters[output.messageid] = callback;

            this.socket.emit('roomstate', output);
        };

        Client.prototype.join = function (room, callback) {
            var output = {
                messageid: neptune.uuid.create(),
                room: room
            };

            this.waiters[output.messageid] = callback;

            this.socket.emit('join', output);
        };

        Client.prototype.leave = function (room, callback) {
            var output = {
                messageid: neptune.uuid.create(),
                room: room
            };

            this.waiters[output.messageid] = callback;

            this.socket.emit('leave', output);
        };
        return Client;
    })(neptune.EventEmiitter);
    neptune.Client = Client;
})(neptune || (neptune = {}));

var neptune;
(function (neptune) {
    var ConsoleLogger = (function () {
        function ConsoleLogger() {
        }
        ConsoleLogger.prototype.log = function (str) {
            console.log(str);
        };
        return ConsoleLogger;
    })();
    neptune.ConsoleLogger = ConsoleLogger;
})(neptune || (neptune = {}));

var neptune;
(function (neptune) {
    var NullLogger = (function () {
        function NullLogger() {
        }
        NullLogger.prototype.log = function (str) {
        };
        return NullLogger;
    })();
    neptune.NullLogger = NullLogger;
})(neptune || (neptune = {}));


var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;
var _navigator = navigator;

function trace(text) {
    if (text[text.length - 1] == '\n') {
        text = text.substring(0, text.length - 1);
    }

    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

if (_navigator.mozGetUserMedia) {
    console.log("This appears to be Firefox");

    webrtcDetectedBrowser = "firefox";

    webrtcDetectedVersion = parseInt(_navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);

    RTCPeerConnection = mozRTCPeerConnection;

    RTCSessionDescription = mozRTCSessionDescription;

    RTCIceCandidate = mozRTCIceCandidate;

    getUserMedia = _navigator.mozGetUserMedia.bind(_navigator);

    createIceServer = function (url, username, password) {
        var iceServer = null;

        var url_parts = url.split(':');

        if (url_parts[0].indexOf('stun') === 0) {
            iceServer = { 'url': url };
        } else if (url_parts[0].indexOf('turn') === 0 && (url.indexOf('transport=udp') !== -1 || url.indexOf('?transport') === -1)) {
            var turn_url_parts = url.split("?");

            iceServer = {
                'url': turn_url_parts[0],
                'credential': password,
                'username': username
            };
        }
        return iceServer;
    };

    attachMediaStream = function (element, stream) {
        console.log("Attaching media stream");
        element.mozSrcObject = stream;
        element.play();
    };

    reattachMediaStream = function (to, from) {
        console.log("Reattaching media stream");

        to.mozSrcObject = from.mozSrcObject;

        to.play();
    };

    MediaStream.prototype.getVideoTracks = function () {
        var result = [];

        return result;
    };

    MediaStream.prototype.getAudioTracks = function () {
        var result = [];

        return result;
    };
} else if (_navigator.webkitGetUserMedia) {
    console.log("This appears to be Chrome");

    webrtcDetectedBrowser = "chrome";

    webrtcDetectedVersion = parseInt(_navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

    createIceServer = function (url, username, password) {
        var iceServer = null;

        var url_parts = url.split(':');

        if (url_parts[0].indexOf('stun') === 0) {
            iceServer = { 'url': url };
        } else if (url_parts[0].indexOf('turn') === 0) {
            if (webrtcDetectedVersion < 28) {
                var url_turn_parts = url.split("turn:");

                iceServer = {
                    'url': 'turn:' + username + '@' + url_turn_parts[1],
                    'credential': password
                };
            } else {
                iceServer = {
                    'url': url,
                    'credential': password,
                    'username': username
                };
            }
        }
        return iceServer;
    };

    RTCPeerConnection = webkitRTCPeerConnection;

    getUserMedia = _navigator.webkitGetUserMedia.bind(_navigator);

    attachMediaStream = function (element, stream) {
        if (typeof element.srcObject !== 'undefined') {
            element.srcObject = stream;
        } else if (typeof element.mozSrcObject !== 'undefined') {
            element.mozSrcObject = stream;
        } else if (typeof element.src !== 'undefined') {
            element.src = URL.createObjectURL(stream);
        } else {
            console.log('Error attaching stream to element.');
        }
    };

    reattachMediaStream = function (to, from) {
        to.src = from.src;
    };

    if (!webkitMediaStream.prototype.getVideoTracks) {
        webkitMediaStream.prototype.getVideoTracks = function () {
            return this.videoTracks;
        };
        webkitMediaStream.prototype.getAudioTracks = function () {
            return this.audioTracks;
        };
    }

    if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
        webkitRTCPeerConnection.prototype.getLocalStreams = function () {
            return this.localStreams;
        };
        webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
            return this.remoteStreams;
        };
    }
} else {
    console.log("Browser does not appear to be WebRTC-capable");
}


