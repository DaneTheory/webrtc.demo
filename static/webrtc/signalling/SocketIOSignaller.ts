/// <reference path="../references.ts" />
/// <reference path="Messages.ts" />
/// <reference path="ISignaller.ts" />

module signalling {

    /*
    * socket.io signaller implementation.
    */
    export class SocketIOSignaller implements signalling.ISignaller {

        public onIdentity  : (identity: signalling.IIdentityMessage) => void;

        public onOffer     : (offer: signalling.IOfferMessage) => void;

        public onAnswer    : (answer: signalling.IAnswerMessage) => void;

        public onCandidate : (candidate: signalling.ICandidateMessage) => void;

        public onSync      : (data: any) => void;

        constructor(public socket: Socket) {

            //------------------------------------
            // events
            //------------------------------------
            this.socket.on('identity',(identity: signalling.IIdentityMessage) => {

                if(this.onIdentity) {

                    this.onIdentity(identity);
                }
            })

            this.socket.on('offer',(message: signalling.IOfferMessage) => {

                if(this.onOffer) {

                    message.offer = new RTCSessionDescription(JSON.parse(<any>message.offer));

                    this.onOffer(message);
                }
            })

            this.socket.on('answer',(message: signalling.IAnswerMessage) => {

                if(this.onAnswer) {

                    message.answer = new RTCSessionDescription(JSON.parse(<any>message.answer));

                    this.onAnswer(message);
                }
            })

            this.socket.on('candidate',(message: signalling.ICandidateMessage) => {

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
        public sendIdentity(message: signalling.IIdentityMessage): void {
            
            this.socket.emit('identity', message)
        }

        public sendOffer(message: signalling.IOfferMessage): void {

            message.offer = JSON.stringify(message.offer);

            this.socket.emit('offer', message)
        }

        public sendAnswer(message: signalling.IAnswerMessage): void {

            message.answer = JSON.stringify(message.answer);

            this.socket.emit('answer', message)
        }

        public sendCandidate(message: signalling.ICandidateMessage): void {

            message.candidate = JSON.stringify(message.candidate);

            this.socket.emit('candidate', message)
        }
    }
}