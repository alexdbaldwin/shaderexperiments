import * as THREE from "three";
import { OrbitControls } from 'three-orbitcontrols-ts';

class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
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

        const params: THREE.ShaderMaterialParameters = {};
        params.vertexShader =
        `varying vec2 vUv;

        void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`

        params.fragmentShader =
        `uniform mat4 projectionMatrix;
        uniform float aspect;
        varying vec2 vUv;
        uniform vec3 linePoints[10];
        uniform int numPoints;
        uniform float lineWidth;
        uniform float viewportWidth;
        

        float minimum_distance(vec2 v, vec2 w, vec2 p) {
            float l2 = distance(v,w);
            if (l2 == 0.0) return distance(p, v);   // v == w case
            //return distance(p,v);
            float t = max(0.0, min(1.0, dot(p - v, w - v) / (l2*l2)));
            vec2 projection = v + t * (w - v);  // Projection falls on the segment
            return distance(p, projection);
        }

        void main() {
        
        vec4 color = vec4(1,1,1,0.3);

        float lineScreenWidth = 1.0/viewportWidth * lineWidth;
        for(int i = 1; i < 10; i++){
            if(i >= numPoints)
                break;
            vec4 startClip = projectionMatrix * viewMatrix * vec4(linePoints[i],1.0);
            vec4 endClip = projectionMatrix * viewMatrix * vec4(linePoints[i-1],1.0);
            startClip /= startClip.w;
            endClip /= endClip.w;

            endClip.y *= 1.0/aspect;
            startClip.y *= 1.0/aspect;

            vec2 p = 2.0 * vUv - vec2(1.0,1.0);

            if(minimum_distance(startClip.xy,endClip.xy,p) < lineScreenWidth){
                color = vec4(1,0,1,1);
                break;
            }
        }
        
        gl_FragColor = color;
        //gl_FragColor = vec4(startClip.x,startClip.x,startClip.x,1);   
        }`

        params.uniforms = { 
            projectionMatrix: {value: this.camera.projectionMatrix},
            aspect: {value: this.camera.aspect},
            numPoints: {value: 4},
            lineWidth: {value: 15},
            linePoints: {value: [new THREE.Vector3(0,3,0), new THREE.Vector3(4,2,0), new THREE.Vector3(5,-1,-2), new THREE.Vector3(3,-2,-3), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]},
            viewportWidth: {value: window.innerWidth}
        };
        params.transparent = true;
        const shaderMaterial = new THREE.ShaderMaterial(params);
        const planeHeight = 2*this.camera.near*Math.tan(0.5*this.camera.fov*Math.PI*2/360);
        const planeGeometry = new THREE.PlaneGeometry(planeHeight * this.camera.aspect, planeHeight, 1, 1);
       
        const uvs = [];
        const h = 1/this.camera.aspect;
        uvs.push(0,(1+h)/2, 1,(1+h)/2, 0,(1-h)/2, 1,(1-h)/2);
        const planeBG = new THREE.PlaneBufferGeometry(planeHeight * this.camera.aspect, planeHeight, 1, 1);
        planeBG.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
        const plane = new THREE.Mesh(planeBG,shaderMaterial);

        

        this.camera.add(plane);
        plane.position.set(0,0,-this.camera.near);


        const cubeMaterial = new THREE.MeshBasicMaterial({color:0x00ffff});
        const cubeGeometry = new THREE.CubeGeometry(1,1,1,1,1,1);
        const cube = new THREE.Mesh(cubeGeometry,cubeMaterial);
        this.scene.add(cube);
        cube.position.set(0.0,3.0,0.0);

        const cubeMaterial2 = new THREE.MeshBasicMaterial({color:0x0000ff});
        const cubeGeometry2 = new THREE.CubeGeometry(1,1,1,1,1,1);
        const cube2 = new THREE.Mesh(cubeGeometry2,cubeMaterial2);
        this.scene.add(cube2);
        cube2.position.set(4.0,2.0,0.0);


        this.animate();
    }

    public animate = (): void => {
        requestAnimationFrame(this.animate);
        this.renderer.render( this.scene, this.camera );
    }
}
 
const game = new Game();
export default game;