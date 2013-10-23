/// <reference path="references.ts" />
/// <reference path="logger.ts" />
/// <reference path="settings.ts" />
/// <reference path="state.ts" />


class Session {

    private connection : RTCPeerConnection;

    private channel    : RTCDataChannel;

    private settings   : Settings;

    public state       : State;

    constructor(public socket   : Socket, public logger   : ILogger, public username : string) {

        this.logger.log('session: constructor')

        this.settings = new Settings();

        this.state = new State();

        this.connection = new RTCPeerConnection(this.settings.configuration,this.settings.constraints);

        this.connection.ondatachannel = (event: any) => {

            this.logger.log('connection.ondatachannel')

            this.channel = event.channel;

            this.bind_channel()
        }

        this.socket.on('identity',  ()     => { this.on_identity() });

        this.socket.on('candidate', (data) => { this.on_candidate(data) });

        this.socket.on('offer',     (data) => { this.on_offer(data) });

        this.socket.on('answer',    (data) => { this.on_answer(data) });

        this.socket.on('usernames', (data) => { this.on_usernames(data) });
    }

    //------------------------------------------
    // Events
    //------------------------------------------

    private on_identity(): void {

        this.logger.log('on_identity');

        this.socket.emit('identity',this.username);
    }

    private on_candidate(data: any): void {

        this.logger.log('on_candidate');

        var candidate = new RTCIceCandidate(JSON.parse(data.candidate))

        this.connection.addIceCandidate(candidate);
    }

    private on_offer(data: any): void {

        this.logger.log('on_offer')

        var offer = new RTCSessionDescription(JSON.parse(data.offer));

        this.connection.setRemoteDescription(offer);

        this.connection.createAnswer((answer) => {

            this.connection.onicecandidate = (e) => {

                this.logger.log('this.connection.onicecandidate')

                if(!e.candidate) { return; }

                this.socket.emit('candidate', {

                    to        : data.from,

                    from      : this.username,

                    candidate : JSON.stringify(e.candidate)
                })
            };

            this.connection.setLocalDescription(answer);

            this.socket.emit('answer', {

                to        : data.from,

                from      : this.username,

                answer    : JSON.stringify(answer)
            })

        }, this.onerror, this.settings.constraints)
    }

    private on_answer(data: any): void {

        this.logger.log('on_answer')

        var answer = new RTCSessionDescription(JSON.parse(data.answer))

        this.connection.setRemoteDescription(answer);
    }

    private on_usernames(usernames: string[]): void {

        this.state.update(usernames);
    }

    //------------------------------------------
    // Methods
    //------------------------------------------

    public call(username: string): void {

        this.logger.log('call')

        this.channel = this.connection.createDataChannel('channel', { reliable: false })

        this.bind_channel();

        this.connection.createOffer((offer) => {

            this.connection.onicecandidate = (e) => {

                if(!e.candidate) { return; }

                this.socket.emit('candidate', {

                    to        : username,

                    from      : this.username,

                    candidate : JSON.stringify(e.candidate)
                })
            };

            this.connection.setLocalDescription(offer);

            this.socket.emit('offer', {

                to    : username,

                from  : this.username,

                offer : JSON.stringify(offer),
            });


        }, this.onerror, this.settings.constraints);
    }

    private bind_channel() : void {

        this.channel.onopen=() => {

            this.logger.log("channel.onopen");
        }

        this.channel.onmessage = (e) => {

            this.logger.log("channel.onmessage");
        }
    }

    private onerror(error: string): void {

        this.logger.log(error)
    }
}

