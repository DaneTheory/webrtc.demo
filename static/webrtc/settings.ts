/// <reference path="references.ts" />

class Settings {

    public configuration : RTCConfiguration;
    
    public constraints   : MediaConstraints

    constructor() {

        this.configuration = {

            iceServers: [{ url: "stun:23.21.150.121" },

                         { url: "stun:stun.l.google.com:19302" }]
        };

        this.constraints = {

            mandatory: {

                OfferToReceiveAudio: true,

                OfferToReceiveVideo: true
            },

            optional: [

                { DtlsSrtpKeyAgreement: true },

                { RtpDataChannels: true }
            ]
        };

    }
}