/// <reference path="../references.ts" />
/// <reference path="../logging/ILogger.ts" />
/// <reference path="../signalling/ISignaller.ts" />
/// <reference path="../peers/Peer.ts" />

module webrtc {

    export class Client {

        public  userid       : string;

        public  signaller    : webrtc.ISignaller;

        public  logger       : webrtc.ILogger;

        public  peers        : webrtc.Peer [];

        public  onServerSync : (data:any) => void;

        public onConnect     : (sender:webrtc.Peer) => void;

        public onMessage     : (sender:webrtc.Peer, data:any) => void;

        constructor(userid: string, signaller : webrtc.ISignaller, logger: webrtc.ILogger) {

            this.userid    = userid;

            this.signaller = signaller;

            this.signaller.onIdentity  = (message) => { this.onIdentity(message) }

            this.signaller.onOffer     = (message) => { this.onOffer(message) }

            this.signaller.onAnswer    = (message) => { this.onAnswer(message) }

            this.signaller.onCandidate = (message) => { this.onCandidate(message) }

            this.signaller.onSync      = (data) =>    { this.onSync(data) }

            this.logger    = logger;
        
            this.peers     = [];
        }

        //----------------------------------------------
        // signalling methods
        //----------------------------------------------

        private onIdentity(message:webrtc.IIdentityMessage) : void {
            
            this.logger.log('client.onIdentity');

            this.signaller.sendIdentity({ userid : this.userid })        
        }

        private onOffer(message:webrtc.IOfferMessage) : void {
            
            this.logger.log('client.onOffer');

            var peer = new webrtc.Peer(message.from)

            peer.acceptOffer(message.offer);

            peer.onCandidate = (candidate) => {
                
                this.logger.log('client peer onCandidate');

                if(!candidate) return;

                this.signaller.sendCandidate({ from: this.userid, to : message.from, candidate : candidate })   
            }

            peer.createAnswer((answer) => {
            
                this.logger.log('client peer createAnswer');

                this.signaller.sendAnswer({from : this.userid, to: message.from,  answer : answer })
            })

            peer.onConnect = (sender) => {
                
                this.logger.log('client peer onConnect');

                if(this.onConnect) {

                    this.onConnect(sender);
                }
            }

            peer.onMessage = (sender, data) => {
                
                this.logger.log('client peer onMessage');

                if(this.onMessage) {
            
                    this.onMessage(sender, data);
                }
            }

            this.peers.push(peer)
        }

        private onAnswer(message:webrtc.IAnswerMessage) : void {

            this.logger.log('client.onAnswer');

            for(var i = 0; i < this.peers.length; i++) {
            
                if(this.peers[i].userid == message.from) {
                
                    this.peers[i].acceptAnswer(message.answer)
                }
            }    
        }

        private onCandidate(message:webrtc.ICandidateMessage) : void {

            this.logger.log('client.onCandidate');

            for(var i = 0; i < this.peers.length; i++) {
            
                if(this.peers[i].userid == message.from) {
                
                    this.peers[i].acceptCandidate(message.candidate);
                }
            }
        }

        //----------------------------------------------
        // server state synchronization
        //----------------------------------------------

        private onSync(data:any) : void {
            
            this.logger.log('client.onSync');

            if(this.onServerSync) {
        
                this.onServerSync(data);
            }
        }

        //----------------------------------------------
        // connection methods
        //----------------------------------------------

        public connect(userid : string) : void {
            
            this.logger.log('client.connect');

            var peer = new webrtc.Peer(userid);

            peer.onCandidate = (candidate) => {

                this.logger.log('client peer onCandidate ');

                if(!candidate) return;

                this.signaller.sendCandidate({ from: this.userid, to : peer.userid, candidate : candidate })   
            }

            peer.createOffer((offer) => {
                
                this.logger.log('client peer createOffer');

                this.signaller.sendOffer({ from : this.userid, to : peer.userid,  offer : offer });
            })

            peer.onConnect = (sender) => {
        
                this.logger.log('client peer onConnect');

                if(this.onConnect) {

                    this.onConnect(sender);
                }
            }

            peer.onMessage = (sender, data) => {
            
                this.logger.log('client peer onMessage');

                if(this.onMessage) {
            
                    this.onMessage(sender, data);
                }
            }

            this.peers.push(peer);
        }

        //----------------------------------------------
        // io methods
        //----------------------------------------------

        public send(userid:string, data:any) : void {

            this.logger.log('client.send');

            for(var i = 0; i < this.peers.length; i++) {
            
                if(this.peers[i].userid == userid) {
                
                    this.peers[i].send(data)
                }
            }
        }

        public broadcast(data:any) : void {

            this.logger.log('client.broadcast');

            for(var i = 0; i < this.peers.length; i++) {
            
                 this.peers[i].send(data)
            }    
        }
    }
}



