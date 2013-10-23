/// <reference path="references.ts" />

module demo
{
    export class Player {
        
        public userid   : string;

        public x        : number;

        public y        : number;

        public z        : number;

        public angle    : number;
        
        public cube     : THREE.Object3D;
    }

    export class App
    {
        public element  : any;

        public renderer : THREE.WebGLRenderer;
        
        public camera   : THREE.PerspectiveCamera;
        
        public scene    : THREE.Scene;
        
        public players  : demo.Player[];
        
        public plane    : THREE.Object3D;

        constructor ( element: HTMLElement, width: number, height: number ) {

            this.element = element;

            this.setupElement (width, height);
            
            this.setupRenderer (width, height);
            
            this.setupCamera (width, height);

            this.setupScene ();

            this.setupPlane ();

            this.players = [];
        }

        private setupElement(width:number, height:number): void {

            this.element.style.width = width.toString() + 'px';
            
            this.element.style.height = height.toString() + 'px';
        }

        private setupRenderer (width: number, height: number): void {

            this.renderer = new THREE.WebGLRenderer({ });
            
            this.renderer.setSize(width, height);
            
            this.element.appendChild( this.renderer.domElement );
        }

        private setupCamera (width: number, height: number): void {

            this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 12000);
            
            this.camera.position = new THREE.Vector3(0, 20, -20);
            
            this.camera.up = new THREE.Vector3(0, 1, 0);
            
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        }

        private setupScene(): void {

            this.scene = new THREE.Scene();
        }

        private setupPlane() : void {
        
            var materials = [
                
                new THREE.MeshBasicMaterial( { color: 0xffa500, side: THREE.DoubleSide } ),

                new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide } )
            ];
            
            this.plane = THREE.SceneUtils.createMultiMaterialObject( new THREE.PlaneGeometry( 200, 200, 64, 64 ), materials );

            this.plane.rotation.x = 90 * Math.PI / 180.0;

            this.scene.add(this.plane)
                        
        }

        private createPlayer(userid:string): demo.Player {

            var player      = new Player();

            player.userid   = userid;

            player.x        = 0;

            player.y        = 1.5;

            player.z        = 0;

            player.angle    = 0;

            var materials = [
                
                new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } ),

                new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide } )
            ];
            
            player.cube = THREE.SceneUtils.createMultiMaterialObject( new THREE.CubeGeometry( 3, 3, 3, 4, 4, 4 ), materials );

            this.scene.add(player.cube);

            this.players.push(player)

            return player;
        }

        public updatePlayer(userid:string, x:number, y:number, z:number, angle:number) : void {
        
            for(var i = 0; i < this.players.length; i++) {

                if(this.players[i].userid == userid) {
                    
                    this.players[i].x = x;

                    this.players[i].y = y;

                    this.players[i].z = z;

                    this.players[i].angle = angle;
                    
                    var cube = this.players[i].cube;

                    cube.position.x = this.players[i].x;

                    cube.position.y = this.players[i].y;

                    cube.position.z = this.players[i].z;

                    cube.rotation.y = (this.players[i].angle * (Math.PI / 180.0)); 
                                   
                }
            }
        }

        public lookAtPlayer(userid:string) : void {

            for(var i = 0; i < this.players.length; i++) {

                if(this.players[i].userid == userid) {        

                    this.camera.lookAt(this.players[i].cube.position) 
                }
            } 
        }

        public getPlayer(userid:string) : demo.Player {
        
            for(var i = 0; i < this.players.length; i++) {

                if(this.players[i].userid == userid) {        

                    return this.players[i];
                }
            }

            return null;
        }

        public render(): void {

            this.renderer.render(this.scene, this.camera);
        }
    }
}