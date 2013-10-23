
class State {

    public usernames: string[];

    public onchange : Function;

    constructor() {

        this.usernames = []

        this.onchange  = null;
    }

    public update(usernames:string[]) : void {
    
        this.usernames = usernames;

        this.notify();
    }

    private notify() : void {
    
        if(this.onchange) {
            
            this.onchange();
        }
    }
}