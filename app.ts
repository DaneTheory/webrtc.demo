/// <reference path="node_modules/appex/appex.d.ts" />

export interface ICompilerContext extends appex.web.IContext {

    compiler : appex.compiler.Compiler
}

export module static {
    
    attribute('static.demo', {urls: ['/static/scripts/demo/demo.js']})
    export function demo(context:ICompilerContext) : void {
    
        context.compiler.compile('./static/scripts/demo/index.ts', (result) => {

            if(result.diagnostics.length == 0) {

                context.response.headers['Content-Type'] = 'text/javascript'

                context.response.send(result.javascript)

                return
            }

            context.response.json(result.diagnostics)

        })
    }

    export function wildcard(context:appex.web.IContext, path:string) {
    
        context.response.serve('./static/', path)
    }
}

export function wildcard(context:appex.web.IContext, path:string) {

    var template = context.template.render('./views/index.html', {path: path})

    context.response.html(template)
}