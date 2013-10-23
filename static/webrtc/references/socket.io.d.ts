interface Socket {

    on(event:string, callback:(data:any)=>void);

    on(event:string, callback:()=>void);

    emit(event:string);

    emit(event:string, data:any);
}

declare module io {

    export function connect(url?:string) : Socket;
}