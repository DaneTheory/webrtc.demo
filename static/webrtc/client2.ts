/// <reference path="references.ts" />
/// <reference path="logger.ts" />
/// <reference path="settings.ts" />
/// <reference path="state.ts" />

/// <reference path="signalling/SocketIOSignaller.ts" />
/// <reference path="signalling/ISignaller.ts" />
/// <reference path="peers/Peer.ts" />

class Client {

    public  userid       : string;

    public  signaller    : signalling.ISignaller;

    public  peers        : peers.Peer [];

    public  onServerSync : (data:any) => void;

    constructor(userid: string, signaller : signalling.ISignaller) {

        this.userid    = userid;

        this.signaller = signaller;

        this.signaller.onIdentity  = (message) => { this.onIdentity(message) }

        this.signaller.onOffer     = (message) => { this.onOffer(message) }

        this.signaller.onAnswer    = (message) => { this.onAnswer(message) }

        this.signaller.onCandidate = (message) => { this.onCandidate(message) }

        this.signaller.onSync      = (data) =>    { this.onSync(data) }
        
        this.peers     = [];
    }

    private onIdentity(message:signalling.IIdentityMessage) : void {
    
        this.signaller.sendIdentity({ userid : this.userid })        
    }

    private onOffer(message:signalling.IOfferMessage) : void {
        
        var peer = new peers.Peer(message.from)

        peer.acceptOffer(message.offer);

        peer.onCandidate = (candidate) => {
            
            if(!candidate) return;
        
            this.signaller.sendCandidate({ from: this.userid, to : message.from, candidate : candidate })   
        }

        peer.createAnswer((answer) => {
            
            this.signaller.sendAnswer({from : this.userid, to: message.from,  answer : answer })
        })

        this.peers.push(peer)
    }

    private onAnswer(message:signalling.IAnswerMessage) : void {

        for(var i = 0; i < this.peers.length; i++) {
            
            if(this.peers[i].userid == message.from) {
                
                this.peers[i].acceptAnswer(message.answer)
            }
        }    
    }

    private onCandidate(message:signalling.ICandidateMessage) : void {
        
        console.log('onCandidate')

        for(var i = 0; i < this.peers.length; i++) {
            
            if(this.peers[i].userid == message.from) {
                
                this.peers[i].acceptCandidate(message.candidate);
            }
        }
    }

    private onSync(data:any) : void {
    
        if(this.onServerSync) {
        
            this.onServerSync(data);
        }
    }

    public connect(userid : string) : void {
    
        var peer = new peers.Peer(userid);

        peer.onCandidate = (candidate) => {

            if(!candidate) return;

            this.signaller.sendCandidate({ from: this.userid, to : peer.userid, candidate : candidate })   
        }

        peer.createOffer((offer) => {
            
            this.signaller.sendOffer({ from : this.userid, to : peer.userid,  offer : offer });
        })

        this.peers.push(peer);
    }
}

