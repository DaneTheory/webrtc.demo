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
    var EventEmiitter = (function () {
        function EventEmiitter() {
            this.registers = [];
        }
        EventEmiitter.prototype.on = function (event, listener) {
            event = '>' + event;

            if (!this.registers[event]) {
                this.registers[event] = [];
            }

            var register = this.registers[event];

            register.push(listener);
        };

        EventEmiitter.prototype.emit = function (event) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            event = '>' + event;

            if (this.registers[event]) {
                var register = this.registers[event];

                for (var i = 0; i < register.length; i++) {
                    var listener = register[i];

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
    var SocketIOSignaller = (function (_super) {
        __extends(SocketIOSignaller, _super);
        function SocketIOSignaller(socket, logger) {
            var _this = this;
            _super.call(this);
            this.socket = socket;
            this.logger = logger;

            this.socket.on('connect', function () {
                _this.logger.log('signaller: on connect');

                var _ns = _this.socket;

                _this.clientid = _ns.socket.sessionid;

                _this.logger.log('signaller: clientid ' + _this.clientid);

                _this.emit('connect');
            });

            this.socket.on('error', function (reason) {
                _this.logger.log('signaller: on error');

                _this.emit('error', reason);
            });

            this.socket.on('rooms', function (input) {
                _this.logger.log('signaller: on rooms');

                _this.emit('rooms', input);
            });

            this.socket.on('join', function (input) {
                _this.logger.log('signaller: on join');

                _this.emit('join', input);
            });

            this.socket.on('leave', function (input) {
                _this.logger.log('signaller: on leave');

                _this.emit('leave', input);
            });

            this.socket.on('clients', function (input) {
                _this.logger.log('signaller: on clients');

                _this.emit('clients', input);
            });

            this.socket.on('candidate', function (input) {
                _this.logger.log('signaller: on candidate');

                _this.emit('candidate', input);
            });

            this.socket.on('offer', function (input) {
                _this.logger.log('signaller: on offer');

                _this.emit('offer', input);
            });

            this.socket.on('answer', function (input) {
                _this.logger.log('signaller: on answer');

                _this.emit('answer', input);
            });
        }
        SocketIOSignaller.prototype.sendOffer = function (offer) {
            this.logger.log('signaller: sending offer');

            this.socket.emit('offer', offer);
        };

        SocketIOSignaller.prototype.sendAnswer = function (answer) {
            this.logger.log('signaller: sending answer');

            this.socket.emit('answer', answer);
        };

        SocketIOSignaller.prototype.sendCandidate = function (candidate) {
            this.logger.log('signaller: sending candidate');

            this.socket.emit('candidate', candidate);
        };

        SocketIOSignaller.prototype.rooms = function (rooms) {
            this.logger.log('signaller: sending rooms request');

            this.socket.emit('rooms', rooms);
        };

        SocketIOSignaller.prototype.clients = function (clients) {
            this.logger.log('signaller: sending clients request');

            this.socket.emit('clients', clients);
        };

        SocketIOSignaller.prototype.join = function (join) {
            this.logger.log('signaller: sending join request');

            this.socket.emit('join', join);
        };

        SocketIOSignaller.prototype.leave = function (leave) {
            this.logger.log('signaller: sending leave request');

            this.socket.emit('leave', leave);
        };
        return SocketIOSignaller;
    })(neptune.EventEmiitter);
    neptune.SocketIOSignaller = SocketIOSignaller;
})(neptune || (neptune = {}));
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
    var DataChannel = (function (_super) {
        __extends(DataChannel, _super);
        function DataChannel(datachannel, logger) {
            _super.call(this);
            this.datachannel = datachannel;
            this.logger = logger;

            this.connected = false;

            this.queue = [];

            if (this.datachannel) {
                this.bind(this.datachannel);
            }
        }
        DataChannel.prototype.emit = function (event, data) {
            this.queue.push({ event: event, data: data });
        };

        DataChannel.prototype.bind = function (datachannel) {
            var _this = this;
            this.datachannel = datachannel;

            this.datachannel.onopen = function () {
                _this.logger.log("datachannel: on open");

                _this.connected = true;
            };

            this.datachannel.onmessage = function (message) {
                _this.logger.log("datachannel: on message");

                message = JSON.parse(message.data);

                _super.prototype.emit.call(_this, message.event, message.data);
            };

            this.datachannel.onclose = function () {
                _this.logger.log("datachannel: on close");

                _this.connected = false;
            };

            this.datachannel.onerror = function (event) {
                _this.logger.log("datachannel: on error");
            };

            this.interval_handle = setInterval(function () {
                if (_this.connected) {
                    if (_this.queue.length > 0) {
                        var message = _this.queue.shift();

                        _this.datachannel.send(JSON.stringify(message));
                    }
                }
            }, 1);
        };
        return DataChannel;
    })(neptune.EventEmiitter);
    neptune.DataChannel = DataChannel;
})(neptune || (neptune = {}));
var neptune;
(function (neptune) {
    var DataConnection = (function (_super) {
        __extends(DataConnection, _super);
        function DataConnection(connectionid, clientid, channelcount, logger) {
            _super.call(this);
            this.connectionid = connectionid;
            this.clientid = clientid;
            this.channelcount = channelcount;
            this.logger = logger;

            this.type = 'data';

            this.channels = [];

            this.logger.log('dataconnection: constructor');

            this.initialize();
        }
        DataConnection.prototype.initialize = function () {
            var _this = this;
            var servers = {
                iceServers: [{ url: "stun:stun.l.google.com:19302" }]
            };

            var constraints = {
                optional: [
                    { DtlsSrtpKeyAgreement: true },
                    { RtpDataChannels: true }
                ]
            };

            this.peerconnection = new RTCPeerConnection(servers, constraints);

            this.peerconnection.onicecandidate = function (event) {
                _this.logger.log("dataconnection: on ice candidate");

                if (event.candidate) {
                    _this.emit('candidate', event.candidate);
                }
            };
        };

        DataConnection.prototype.acceptCandidate = function (candidate) {
            try  {
                if (candidate) {
                    this.peerconnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (e) {
                this.logger.log('dataconnection: error on acceptCandidate: ' + e.toString());
            }
        };

        DataConnection.prototype.createOffer = function (callback) {
            var _this = this;
            this.logger.log('dataconnection: creating offer');

            for (var i = 0; i < this.channelcount; i++) {
                var init = { negotiated: false, ordered: true };

                var datachannel = this.peerconnection.createDataChannel('channel' + i, init);

                var channel = new neptune.DataChannel(datachannel, this.logger);

                this.channels.push(channel);
            }

            var constraints = {
                mandatory: {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                }
            };

            this.peerconnection.createOffer(function (offer) {
                offer.sdp = _this.transformSdp(offer.sdp);

                _this.peerconnection.setLocalDescription(offer);

                callback(offer);
            }, function (error) {
                _this.errorHandler(error);
            }, constraints);
        };

        DataConnection.prototype.acceptOffer = function (offer, callback) {
            var _this = this;
            this.logger.log('dataconnection: accepting offer');

            for (var i = 0; i < this.channelcount; i++) {
                var channel = new neptune.DataChannel(null, this.logger);

                this.channels.push(channel);
            }

            this.peerconnection.ondatachannel = function (e) {
                var index = parseInt(e.channel.label.replace('channel', ''));

                _this.channels[index].bind(e.channel);
            };

            var constraints = {
                mandatory: {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                }
            };

            this.logger.log('dataconnection: setting remote description');

            this.peerconnection.setRemoteDescription(new RTCSessionDescription(offer));

            this.logger.log('dataconnection: creating answer');

            this.peerconnection.createAnswer(function (answer) {
                _this.logger.log('dataconnection: created answer');

                answer.sdp = _this.transformSdp(answer.sdp);

                _this.logger.log('dataconnection: setting local description');

                _this.peerconnection.setLocalDescription(answer);

                callback(answer);
            }, function (error) {
                _this.errorHandler(error);
            }, constraints);
        };

        DataConnection.prototype.acceptAnswer = function (answer) {
            this.logger.log('dataconnection: accepting answer : sdp ->' + answer.type);

            this.peerconnection.setRemoteDescription(new RTCSessionDescription(answer));
        };

        DataConnection.prototype.errorHandler = function (error) {
            this.logger.log("connection: sdp error: " + error);

            this.emit('error', error);
        };

        DataConnection.prototype.transformSdp = function (sdp) {
            var split = sdp.split("b=AS:30");

            if (split.length > 1) {
                var newSDP = split[0] + "b=AS:1638400" + split[1];
            } else {
                newSDP = sdp;
            }

            return newSDP;
        };
        return DataConnection;
    })(neptune.EventEmiitter);
    neptune.DataConnection = DataConnection;
})(neptune || (neptune = {}));
var neptune;
(function (neptune) {
    var MediaConnection = (function (_super) {
        __extends(MediaConnection, _super);
        function MediaConnection(connectionid, clientid, mediastream, logger) {
            _super.call(this);
            this.connectionid = connectionid;
            this.clientid = clientid;
            this.mediastream = mediastream;
            this.logger = logger;

            this.type = 'media';

            this.initialize();
        }
        MediaConnection.prototype.initialize = function () {
            var _this = this;
            var servers = {
                iceServers: [{ url: "stun:stun.l.google.com:19302" }]
            };

            var constraints = {
                optional: [
                    { DtlsSrtpKeyAgreement: true },
                    { RtpDataChannels: false }
                ]
            };

            this.peerconnection = new RTCPeerConnection(servers, constraints);

            this.peerconnection.onicecandidate = function (event) {
                _this.logger.log("mediaconnection: on ice candidate");

                if (event.candidate) {
                    _this.emit('candidate', event.candidate);
                }
            };

            this.peerconnection.onaddstream = function (e) {
                _this.logger.log('mediaconnection: on add stream');

                _this.direction = 'in';

                _this.mediastream = e.stream;

                _this.emit('mediastream');
            };

            this.peerconnection.onremovestream = function (e) {
                _this.logger.log('mediaconnection: on remove stream');

                _this.mediastream = null;
            };
        };

        MediaConnection.prototype.acceptCandidate = function (candidate) {
            try  {
                if (candidate) {
                    this.peerconnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (e) {
                this.logger.log('mediaconnection: error on acceptCandidate: ' + e.toString());
            }
        };

        MediaConnection.prototype.createOffer = function (callback) {
            var _this = this;
            this.logger.log('mediaconnection: creating offer');

            this.peerconnection.addStream(this.mediastream);

            this.direction = 'out';

            var constraints = {
                mandatory: {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: true
                }
            };

            this.peerconnection.createOffer(function (offer) {
                _this.peerconnection.setLocalDescription(offer);

                callback(offer);
            }, function (error) {
                _this.errorHandler(error);
            }, constraints);
        };

        MediaConnection.prototype.acceptOffer = function (offer, callback) {
            var _this = this;
            this.logger.log('mediaconnection: accepting offer : sdp ->' + offer.type);

            var constraints = {
                mandatory: {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: true
                }
            };

            this.logger.log('mediaconnection: setting remote description');

            this.peerconnection.setRemoteDescription(new RTCSessionDescription(offer));

            this.logger.log('mediaconnection: creating answer');

            this.peerconnection.createAnswer(function (answer) {
                _this.logger.log('mediaconnection: created answer');

                _this.logger.log('mediaconnection: setting local description');

                _this.peerconnection.setLocalDescription(answer);

                callback(answer);
            }, function (error) {
                _this.errorHandler(error);
            }, constraints);
        };

        MediaConnection.prototype.acceptAnswer = function (answer) {
            this.logger.log('mediaconnection: accepting answer : sdp ->' + answer.type);

            this.peerconnection.setRemoteDescription(new RTCSessionDescription(answer));
        };

        MediaConnection.prototype.errorHandler = function (error) {
            this.logger.log("connection: sdp error: " + error);

            this.emit('error', error);
        };

        MediaConnection.prototype.transformSdpAudioToStereo = function (sdp) {
            var sdpLines = sdp.split('\r\n');

            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('opus/48000') !== -1) {
                    var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);

                    break;
                }
            }

            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('a=fmtp') !== -1) {
                    var payload = this.extractSdp(sdpLines[i], /a=fmtp:(\d+)/);

                    if (payload === opusPayload) {
                        var fmtpLineIndex = i;

                        break;
                    }
                }
            }

            if (fmtpLineIndex === null) {
                return sdp;
            }

            sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat(' stereo=1');

            sdp = sdpLines.join('\r\n');

            return sdp;
        };

        MediaConnection.prototype.extractSdp = function (sdpLine, pattern) {
            var result = sdpLine.match(pattern);

            return (result && result.length == 2) ? result[1] : null;
        };
        return MediaConnection;
    })(neptune.EventEmiitter);
    neptune.MediaConnection = MediaConnection;
})(neptune || (neptune = {}));
var neptune;
(function (neptune) {
    var Client = (function (_super) {
        __extends(Client, _super);
        function Client(signaller, logger) {
            var _this = this;
            _super.call(this);
            this.signaller = signaller;
            this.logger = logger;

            this.connections = [];

            this.waiters = [];

            this.waiters_idx = 0;

            this.signaller.on('connect', function () {
                _this.clientid = _this.signaller.clientid;

                _this.emit('connect');
            });

            this.signaller.on('error', function (reason) {
                _this.emit('error', reason);
            });

            this.signaller.on('rooms', function (input) {
                _this.logger.log('client: on rooms');

                if (_this.waiters[input.tid]) {
                    _this.waiters[input.tid](input);

                    delete _this.waiters[input.tid];
                }

                _this.emit('rooms', input);
            });

            this.signaller.on('join', function (input) {
                _this.logger.log('client: on join');

                if (_this.waiters[input.tid]) {
                    _this.waiters[input.tid](input);

                    delete _this.waiters[input.tid];
                }

                _this.emit('join', input);
            });

            this.signaller.on('leave', function (input) {
                _this.logger.log('client: on leave');

                if (_this.waiters[input.tid]) {
                    _this.waiters[input.tid](input);

                    delete _this.waiters[input.tid];
                }

                _this.emit('leave', input);
            });

            this.signaller.on('clients', function (input) {
                _this.logger.log('client: on clients');

                if (_this.waiters[input.tid]) {
                    _this.waiters[input.tid](input);

                    delete _this.waiters[input.tid];
                }

                _this.emit('clients', input);
            });

            this.signaller.on('candidate', function (input) {
                _this.logger.log('client: on candidate');

                var connection = _this.connection(input.connection.connectionid);

                if (connection) {
                    connection.acceptCandidate(input.candidate);
                }
            });

            this.signaller.on('offer', function (input) {
                _this.logger.log('client: on offer');

                _this.emit('call', input.connection, function (accepted) {
                    if (accepted) {
                        var connection = null;

                        if (input.connection.type == 'data') {
                            connection = new neptune.DataConnection(input.connection.connectionid, input.from, input.connection.channelcount, _this.logger);
                        }

                        if (input.connection.type == 'media') {
                            connection = new neptune.MediaConnection(input.connection.connectionid, input.from, null, _this.logger);
                        }

                        _this.logger.log('client: accepting offer.');

                        connection.acceptOffer(input.offer, function (answer) {
                            _this.logger.log('client: offer accepted.');

                            var output = {
                                to: input.from,
                                connection: input.connection,
                                answer: answer
                            };

                            _this.logger.log('client: sending answer');

                            _this.signaller.sendAnswer(output);
                        });

                        connection.on('candidate', function (candidate) {
                            _this.logger.log('client: got candidate');

                            var output = {
                                to: input.from,
                                connection: input.connection,
                                candidate: candidate
                            };

                            _this.logger.log('client: sending candidate');

                            _this.signaller.sendCandidate(output);
                        });

                        if (connection.type == 'data') {
                            _this.emit('connection', connection);
                        }

                        if (connection.type == 'media') {
                            connection.on('mediastream', function () {
                                _this.emit('connection', connection);
                            });
                        }

                        _this.connections.push(connection);
                    }
                });
            });

            this.signaller.on('answer', function (input) {
                _this.logger.log('client: on answer');

                var connection = _this.connection(input.connection.connectionid);

                if (connection) {
                    connection.acceptAnswer(input.answer);

                    return;
                }

                _this.logger.log('client: unable to accept answer as no connection was found');
            });
        }
        Client.prototype.datacall = function (clientid, channelcount) {
            var _this = this;
            channelcount = channelcount || 1;

            var connection = new neptune.DataConnection(neptune.uuid.create(), clientid, channelcount, this.logger);

            this.logger.log('client: creating offer.');

            connection.createOffer(function (offer) {
                _this.logger.log('client: offer created.');

                var output = {
                    to: clientid,
                    connection: {
                        connectionid: connection.connectionid,
                        type: 'data',
                        channelcount: channelcount
                    },
                    offer: offer
                };

                _this.logger.log('client: sending offer.');

                _this.signaller.sendOffer(output);
            });

            connection.on('candidate', function (candidate) {
                _this.logger.log('client: got candidate');

                var output = {
                    to: connection.clientid,
                    connection: {
                        connectionid: connection.connectionid,
                        type: 'data',
                        channelcount: channelcount
                    },
                    candidate: candidate
                };

                _this.logger.log('client: sending candidate');

                _this.signaller.sendCandidate(output);
            });

            this.emit('connection', connection);

            this.connections.push(connection);
        };

        Client.prototype.mediacall = function (clientid, mediastream) {
            var _this = this;
            var connection = new neptune.MediaConnection(neptune.uuid.create(), clientid, mediastream, this.logger);

            this.logger.log('client: creating offer.');

            connection.createOffer(function (offer) {
                _this.logger.log('client: offer created.');

                var output = {
                    to: clientid,
                    connection: {
                        connectionid: connection.connectionid,
                        type: 'media'
                    },
                    offer: offer
                };

                _this.logger.log('client: sending offer.');

                _this.signaller.sendOffer(output);
            });

            connection.on('candidate', function (candidate) {
                _this.logger.log('client: got candidate');

                var output = {
                    to: connection.clientid,
                    connection: {
                        connectionid: connection.connectionid,
                        type: 'media'
                    },
                    candidate: candidate
                };

                _this.logger.log('client: sending candidate');

                _this.signaller.sendCandidate(output);
            });

            this.emit('connection', connection);

            this.connections.push(connection);
        };

        Client.prototype.rooms = function (callback) {
            this.waiters_idx += 1;

            this.waiters[this.waiters_idx] = callback;

            var output = {
                tid: this.waiters_idx
            };

            this.signaller.rooms(output);
        };

        Client.prototype.join = function (room, callback) {
            this.waiters_idx += 1;

            this.waiters[this.waiters_idx] = callback;

            var output = {
                tid: this.waiters_idx,
                room: room
            };

            this.signaller.join(output);
        };

        Client.prototype.leave = function (room, callback) {
            this.waiters_idx += 1;

            this.waiters[this.waiters_idx] = callback;

            var output = {
                tid: this.waiters_idx,
                room: room
            };

            this.signaller.leave(output);
        };

        Client.prototype.clients = function (room, callback) {
            this.waiters_idx += 1;

            this.waiters[this.waiters_idx] = callback;

            var output = {
                tid: this.waiters_idx,
                room: room
            };

            this.signaller.clients(output);
        };

        Client.prototype.connection = function (connectionid) {
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i].connectionid == connectionid) {
                    return this.connections[i];
                }
            }
            return null;
        };
        return Client;
    })(neptune.EventEmiitter);
    neptune.Client = Client;
})(neptune || (neptune = {}));
var _navigator = navigator;

_navigator.getUserMedia = (_navigator.getUserMedia || _navigator.webkitGetUserMedia || _navigator.mozGetUserMedia || _navigator.msGetUserMedia);
var neptune;
(function (neptune) {
    function mediastream(callback) {
        var accept = function (stream) {
            callback(stream);
        };

        var decline = function (err) {
            callback(null);
        };

        navigator.getUserMedia({ video: true, audio: true }, accept, decline);
    }
    neptune.mediastream = mediastream;
})(neptune || (neptune = {}));
