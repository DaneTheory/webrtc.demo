/// <reference path="references.ts" />

module demo {

    export class Player {
        
        public clientid : string;
        public x        : number;
        public y        : number;
        public z        : number;
        public angle    : number;
        public fire     : number;
        public scale    : number;
        public cube     : THREE.Object3D;
    }

    export class Bullet {
        public x        : number;
        public y        : number;
        public z        : number;
        public angle    : number; 
        public cube     : THREE.Object3D; 
        public ticks    : number;             
    }

    export class App
    {
        public element  : any;
        public renderer : THREE.WebGLRenderer;
        public camera   : THREE.PerspectiveCamera;
        public scene    : THREE.Scene;
        public players  : demo.Player[];
        public bullets  : demo.Bullet[];
        public plane    : THREE.Object3D;

        constructor ( element: HTMLElement, width: number, height: number ) {

            this.element = element;

            this.setupElement (width, height);
            this.setupRenderer (width, height);
            this.setupCamera (width, height);

            this.setupScene ();
            this.setupPlane ();
            this.players = [];
            this.bullets = [];
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
            this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
            this.camera.position = new THREE.Vector3(0, 20, -20);
            this.camera.up = new THREE.Vector3(0, 1, 0);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        }

        private setupScene(): void {
            this.scene = new THREE.Scene();
        }

        private setupPlane() : void {
        
            var materials = [
                //new THREE.MeshBasicMaterial( { color: 0xffa500, side: THREE.DoubleSide } ),
                new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide } )
            ];
            this.plane = THREE.SceneUtils.createMultiMaterialObject( new THREE.PlaneGeometry( 256, 256, 64, 64 ), materials );
            this.plane.rotation.x = 90 * Math.PI / 180.0;
            this.scene.add(this.plane)
        }

        public createPlayer(clientid:string): demo.Player {
            
            var materials = [
                new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } ),
                new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide } )
            ];

            var player      = new Player();
            player.clientid   = clientid;
            player.x        = 0;
            player.y        = 1.5;
            player.z        = 0;
            player.angle    = 0;
            player.fire     = 0;
            player.scale    = 1;
            player.cube = THREE.SceneUtils.createMultiMaterialObject( new THREE.CubeGeometry( 3, 3, 3, 1, 1, 1 ), materials );

            this.scene.add(player.cube);
            this.players.push(player);
            return player;
        }
        public removePlayer(clientid:string) : void {
            
            for(var i = 0; i < this.players.length; i++) {
                if(this.players[i].clientid == clientid) {
                    var player = this.players[i]
                    this.players.splice(i, 1)
                    this.scene.remove(player.cube);
                }
            }
        }
        public updatePlayer(clientid:string, x:number, y:number, z:number, angle:number) : void {
            
            var player = this.getPlayer(clientid);
            
            if(player) {
                player.x     = x;
                player.y     = y;
                player.z     = z;
                player.angle = angle;
                var cube = player.cube;
                cube.position.x = player.x;
                cube.position.y = player.y;
                cube.position.z = player.z;
                cube.rotation.y = (player.angle * (Math.PI / 180.0));
                cube.scale.x    = player.scale;
                cube.scale.y    = player.scale;
                cube.scale.z    = player.scale;
                cube.updateMatrix();
            }
        }

        public lookAtPlayer(clientid:string) : void {
            var player = this.getPlayer(clientid);
            if(player) {
                this.camera.lookAt(player.cube.position)
            }
        }

        public getPlayer(clientid:string) : demo.Player {
            for(var i = 0; i < this.players.length; i++) {
                if(this.players[i].clientid == clientid) {        
                    return this.players[i];
                }
            }
            return null;
        }

        private createBullet(x: number, y:number, z:number, angle:number) : void {
            var bullet   = new demo.Bullet();
            bullet.x     = x;
            bullet.y     = y;
            bullet.z     = z;
            bullet.angle = angle;
            bullet.ticks = 0;
            bullet.cube = new THREE.Mesh( new THREE.CubeGeometry( 0.5, 0.5, 0.5, 1 , 1, 1 ), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            bullet.cube.position.x = bullet.x;
            bullet.cube.position.y = bullet.y;
            bullet.cube.position.z = bullet.z;
            this.scene.add(bullet.cube);
            this.bullets.push(bullet);
        }

        public update() : void {
            for(var i = 0; i < this.bullets.length; i++) {
                var bullet = this.bullets[i]
                var x = Math.sin(this.bullets[i].angle * Math.PI / 180) * 2.5;
                var y = Math.cos(this.bullets[i].angle * Math.PI / 180) * 2.5;
                bullet.x     += x; 
                bullet.z     += y;   
                bullet.ticks += 1;
                bullet.cube.position.x = this.bullets[i].x;
                bullet.cube.position.z = this.bullets[i].z;
                if(bullet.ticks > 100) {
                    this.bullets.splice(i, 1)
                    this.scene.remove(bullet.cube);
                }
            }
        }

        public render(): void {
            this.renderer.render(this.scene, this.camera);
        }
    }
}