/// <reference path="../references.ts" />
/// <reference path="Messages.ts" />

module signalling {

    /*
    * implementation for a signaller.
    */
    export interface ISignaller {

        onIdentity   : (message   : signalling.IIdentityMessage) => void;

        onOffer      : (message   : signalling.IOfferMessage) => void;

        onAnswer     : (message   : signalling.IAnswerMessage) => void;

        onCandidate  : (message   : signalling.ICandidateMessage) => void;

        onSync       : (data      : any) => void;

        sendIdentity   (message   : signalling.IIdentityMessage) : void;

        sendOffer      (message   : signalling.IOfferMessage) : void;

        sendAnswer     (message   : signalling.IAnswerMessage) : void;

        sendCandidate  (message   : signalling.ICandidateMessage) : void;
    }
}