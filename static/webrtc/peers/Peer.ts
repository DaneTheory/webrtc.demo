/// <reference path="../references.ts" />
/// <reference path="Settings.ts" />
/// <reference path="Messages.ts" />

module peers {

    export class Peer {

        public userid      : string;

        public connection  : RTCPeerConnection;

        public settings    : peers.Settings;

        public channel     : RTCDataChannel;

        public onCandidate : (candidate:RTCIceCandidate) => void;

        constructor(userid: string) {
            
            this.userid     = userid;

            this.settings   = new peers.Settings();

            this.connection = new RTCPeerConnection(this.settings.configuration, this.settings.constraints);

            this.connection.onicecandidate = (e) => {

                if(this.onCandidate) {
                
                    this.onCandidate(e.candidate)
                }
            }

            this.channel    = this.connection.createDataChannel('channel', { reliable: false })

            this.channel.onopen = function() {

                console.log("CHANNEL OPEN!")
            }
        }

        public createOffer (callback:(offer:RTCSessionDescription) => void) : void {
            
            this.connection.createOffer((offer) => {
                
                this.connection.setLocalDescription(offer);

                callback(offer);
            });
        }

        public createAnswer(callback: (answer:RTCSessionDescription) => void) : void {

            this.connection.createAnswer((answer) => {
            
                 this.connection.setLocalDescription(answer);

                callback(answer);
            })
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
    }
}