/// <reference path="../references.ts" />
/// <reference path="Messages.ts" />

module webrtc {

    /*
    * implementation for a signaller.
    */
    export interface ISignaller {

        onIdentity   : (message   : webrtc.IIdentityMessage) => void;

        onOffer      : (message   : webrtc.IOfferMessage) => void;

        onAnswer     : (message   : webrtc.IAnswerMessage) => void;

        onCandidate  : (message   : webrtc.ICandidateMessage) => void;

        onSync       : (data      : any) => void;

        sendIdentity   (message   : webrtc.IIdentityMessage) : void;

        sendOffer      (message   : webrtc.IOfferMessage) : void;

        sendAnswer     (message   : webrtc.IAnswerMessage) : void;

        sendCandidate  (message   : webrtc.ICandidateMessage) : void;
    }
}