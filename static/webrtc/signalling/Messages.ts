/// <reference path="../references.ts" />

module webrtc {

    export interface IMessage {

    }

    export interface IIdentityMessage extends IMessage {

        userid : string;
    }

    export interface IForwardedMessage extends IMessage {

        from   : string;

        to     : string;
    }

    export interface ICandidateMessage extends IForwardedMessage {

        candidate: RTCIceCandidate;
    }

    export interface IOfferMessage extends IForwardedMessage {

        offer: RTCSessionDescription;
    }

    export interface IAnswerMessage extends IForwardedMessage {

        answer: RTCSessionDescription;
    }
}