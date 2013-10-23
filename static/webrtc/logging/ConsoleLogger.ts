/// <reference path="../references.ts" />
/// <reference path="ILogger.ts" />

module webrtc {

    export class ConsoleLogger implements webrtc.ILogger {

        constructor() {
        
        }

        public log(str:string) : void {

            console.log(str);
        }
    }    

}