/// <reference path="../references.ts" />
/// <reference path="ILogger.ts" />

module webrtc {

    export class NullLogger implements webrtc.ILogger {

        constructor() {
        
        }

        public log(str:string) : void {

            
        }
    }    

}