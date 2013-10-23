interface ILogger {

    log(str:string);
}

class ConsoleLogger implements ILogger {

    public log(str:string) : void {
    
        console.log(str);
    }
}

class NullLogger implements ILogger {

    public log(str:string) : void {
    
        console.log(str);
    }
    
}