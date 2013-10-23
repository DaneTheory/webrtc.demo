/// <reference path="../references.ts" />
/// <reference path="Messages.ts" />
/// <reference path="ISignaller.ts" />

module webrtc {

    /*
    * socket.io signaller implementation.
    */
    export class SocketIOSignaller implements webrtc.ISignaller {

        public onIdentity  : (identity  : webrtc.IIdentityMessage) => void;

        public onOffer     : (offer     : webrtc.IOfferMessage) => void;

        public onAnswer    : (answer    : webrtc.IAnswerMessage) => void;

        public onCandidate : (candidate : webrtc.ICandidateMessage) => void;

        public onSync      : (data : any) => void;

        constructor(public socket: Socket) {

            //------------------------------------
            // events
            //------------------------------------
            this.socket.on('identity', (identity: webrtc.IIdentityMessage) => {

                if(this.onIdentity) {

                    this.onIdentity(identity);
                }
            })

            this.socket.on('offer', (message: webrtc.IOfferMessage) => {

                if(this.onOffer) {

                    message.offer = new RTCSessionDescription(JSON.parse(<any>message.offer));

                    this.onOffer(message);
                }
            })

            this.socket.on('answer', (message: webrtc.IAnswerMessage) => {

                if(this.onAnswer) {

                    message.answer = new RTCSessionDescription(JSON.parse(<any>message.answer));

                    this.onAnswer(message);
                }
            })

            this.socket.on('candidate', (message: webrtc.ICandidateMessage) => {

                if(this.onCandidate) {

                    message.candidate = new RTCIceCandidate(JSON.parse(<any>message.candidate));

                    this.onCandidate(message);
                }
            })

            this.socket.on('sync',(data: any) => {

                if(this.onSync) {

                    this.onSync(data);
                }
            })
        }

        //------------------------------------
        // methods
        //------------------------------------
        public sendIdentity(message: webrtc.IIdentityMessage): void {
            
            this.socket.emit('identity', message)
        }

        public sendOffer(message: webrtc.IOfferMessage): void {

            message.offer = JSON.stringify(message.offer);

            this.socket.emit('offer', message)
        }

        public sendAnswer(message: webrtc.IAnswerMessage): void {

            message.answer = JSON.stringify(message.answer);

            this.socket.emit('answer', message)
        }

        public sendCandidate(message: webrtc.ICandidateMessage): void {

            message.candidate = JSON.stringify(message.candidate);

            this.socket.emit('candidate', message)
        }
    }
}