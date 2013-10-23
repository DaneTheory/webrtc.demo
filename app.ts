/// <reference path="node_modules/appex/appex.d.ts" />

export interface ICompilerContext extends appex.web.IContext {

    compiler : appex.compiler.Compiler
}

export module static.webrtc {

    attribute('static.webrtc.client', {urls: ['/static/webrtc/client.js']})
    export function client(context: ICompilerContext) {
        
        context.compiler.compile('./static/webrtc/client.ts', (result) => {
               
            if(result.diagnostics.length > 0) {
                  
                context.response.json(500, result.diagnostics)

                return;
            }

            context.response.headers['Content-Type'] = 'text/javascript';

            context.response.send(result.javascript)
        })
    }    
}

export module static {

    export function wildcard(context:appex.web.IContext, path:string) {
    
        context.response.serve('./static/', path);
    }
}

export function index(context:appex.web.IContext) {

    context.response.html(context.template.render('./views/index.html')) 
}

export function test(context:appex.web.IContext) {

    context.response.html(context.template.render('./views/test.html')) 
}

export function wildcard(context:appex.web.IContext, path:string) {

    context.response.send(404, path +  ' not found.')
}