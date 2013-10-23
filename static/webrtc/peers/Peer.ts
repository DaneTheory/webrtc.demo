/// <reference path="../references.ts" />
/// <reference path="Settings.ts" />
/// <reference path="Messages.ts" />

module webrtc {

    export class Peer {

        public connection  : RTCPeerConnection;

        public channel     : RTCDataChannel;

        public userid      : string;
        
        public settings    : webrtc.Settings;

        public onCandidate : (candidate:RTCIceCandidate) => void;

        public onConnect   : (sender:webrtc.Peer) => void;

        public onMessage   : (sender:webrtc.Peer, data:any) => void;

        public connected   : boolean;

        constructor(userid: string) {
            
            this.userid     = userid;

            this.settings   = new webrtc.Settings();

            this.connection = new RTCPeerConnection(this.settings.configuration, this.settings.constraints);

            this.connection.onicecandidate = (e) => {

                if(this.onCandidate) {
                
                    this.onCandidate(e.candidate)
                }
            }

            this.channel    = this.connection.createDataChannel('channel', { reliable: false })

            this.channel.onopen = () => {

                this.connected = true;

                if(this.onConnect) {
                
                    this.onConnect(this);
                }
            }

            this.channel.onmessage = (message) => {
            
                if(this.onMessage) {

                    this.onMessage(this, message)
                }
            }

            this.channel.onclose = () => {
            
                this.connected = false;
            }
        }

        //----------------------------------------------
        // signalling methods
        //----------------------------------------------

        public createOffer (callback:(offer:RTCSessionDescription) => void) : void {
            
            this.connection.createOffer((offer) => {
                
                this.connection.setLocalDescription(offer);

                callback(offer);

            }, this.errorHandler, this.settings.constraints);
        }

        public createAnswer(callback: (answer:RTCSessionDescription) => void) : void {

            this.connection.createAnswer((answer) => {
            
                 this.connection.setLocalDescription(answer);

                callback(answer);

                
            }, this.errorHandler, this.settings.constraints )
        }

        public acceptOffer(offer: RTCSessionDescription) : void {
        
            this.connection.setRemoteDescription(offer);
        }

        public acceptAnswer(answer:RTCSessionDescription) : void {
        
            this.connection.setRemoteDescription(answer);
        }

        public acceptCandidate(candidate:RTCIceCandidate) : void {

            this.connection.addIceCandidate(candidate);
        }

        //----------------------------------------------
        // io methods
        //----------------------------------------------

        public send(data:any) : void {
            
            if(this.connected) {

                this.channel.send(data)
            }
        }

        private errorHandler(error:string) : void {
        
            
        }
    }
}