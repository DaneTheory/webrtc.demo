/// <reference path="../references.ts" />
/// <reference path="ILogger.ts" />

module webrtc {

    export class TextAreaLogger implements webrtc.ILogger {

        constructor(public element:HTMLTextAreaElement) {
        
        }

        public log(str:string) : void {

            this.element.innerText += str + '\n';
        }
    }
}