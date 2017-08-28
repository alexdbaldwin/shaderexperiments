import * as THREE from "three";
import { OrbitControls } from 'three-orbitcontrols-ts';
import LineDrawer from "./lineDrawer";
import DXFLoader from "./DXFLoader";
import * as parts from "./robotParts";

class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private depthMaterial: THREE.MeshDepthMaterial;
    private depthTarget: THREE.WebGLRenderTarget;
    private lineDrawer: LineDrawer;
    private textTexture: THREE.Texture;

   

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
        this.renderer = new THREE.WebGLRenderer(/*{logarithmicDepthBuffer: true }*/);
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        //this.depthMaterial = new THREE.MeshDepthMaterial();
        //this.depthTarget = new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight);
        this.controls = new OrbitControls(this.camera, document.documentElement);

        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI;
        
        
        // How far you can dolly in and out ( PerspectiveCamera only ) 
        this.controls.minDistance = 0;
        this.controls.maxDistance = Infinity;
        
        this.controls.enableZoom = true; // Set to false to disable zooming 
        this.controls.zoomSpeed = 1.0;
        
        
        this.controls.enablePan = true;

        this.scene.add(this.camera);
 
        this.camera.position.z = 5;

       


 /*        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = "30pt Arial";
        canvas.width = 1024;
        canvas.height = 1024;

        const scalex = (canvas.width / context.measureText("Hello").width);
        const scaley = (canvas.height / 23);

        const ypos = (canvas.height / (scaley * 1.25));

        context.scale(scalex, scaley);
        //context.fillText("Testing!", 0, ypos);

        context.fillStyle = "#ff0000";
        context.fillRect(0,0,canvas.width,canvas.height);
        
        context.fillStyle = "#000000";
        context.fillText("Hello",0,canvas.height/scaley);
        

        this.textTexture = new THREE.Texture(canvas,);
        this.textTexture.needsUpdate = true;
        const textMaterial = new THREE.MeshBasicMaterial({map: this.textTexture});
        textMaterial.transparent = true;
        const textGeometry = new THREE.PlaneGeometry(2,2,1,1);
        const textObject = new THREE.Mesh(textGeometry,textMaterial);
        this.scene.add(textObject);



        const cubeMaterial = new THREE.MeshBasicMaterial({color:0x00ffff});
        const cubeGeometry = new THREE.CubeGeometry(1,1,1,1,1,1);
        const cube = new THREE.Mesh(cubeGeometry,cubeMaterial);
        this.scene.add(cube);
        cube.position.set(0.0,3.0,-30);
        */

        const cubeMaterial2 = new THREE.MeshBasicMaterial({color:0x0000ff});
        cubeMaterial2.transparent = true;
        cubeMaterial2.opacity = 0.5;
        const cubeGeometry2 = new THREE.CubeGeometry(1,1,1,1,1,1);
        const cube2 = new THREE.Mesh(cubeGeometry2,cubeMaterial2);
        this.scene.add(cube2);
        cube2.position.set(1.0,1.0,-20);

        const dxf = new DXFLoader();
         const b6 = dxf.load(parts.b6);
        b6.position.set(0,0,-5);
        b6.scale.set(10,10,10);
        this.scene.add(b6);

        const b4 = dxf.load(parts.b4);
        b4.position.set(-2,0,-5);
        b4.scale.set(10,10,10);
        this.scene.add(b4); 

        const b3 = dxf.load(parts.b3);
        b3.position.set(2,0,-5);
        b3.scale.set(10,10,10);
        this.scene.add(b3);

        const b2 = dxf.load(parts.b2);
        b2.position.set(6,0,-5);
        b2.scale.set(10,10,10);
        this.scene.add(b2);

        const b1 = dxf.load(parts.b1);
        b1.position.set(-6,0,-5);
        b1.scale.set(10,10,10);
        this.scene.add(b1);



/*         this.lineDrawer = new LineDrawer(this.camera);
        this.camera.add(this.lineDrawer); */

        this.animate();



















    }

    public animate = (): void => {
        requestAnimationFrame(this.animate);

        //this.textTexture.needsUpdate = true;

        //Render depth
/*         this.scene.overrideMaterial = this.depthMaterial;
        this.lineDrawer.visible = false;
        this.renderer.render(this.scene, this.camera, this.depthTarget, true); */

        //Render normally
        this.scene.overrideMaterial = null;
        //this.lineDrawer.visible = true;
        //this.lineDrawer.setDepthTexture(this.depthTarget.texture);
        this.renderer.render( this.scene, this.camera );
        
        
    }
}
 
const game = new Game();
export default game;