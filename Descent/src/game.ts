import * as THREE from "three";
import { OrbitControls } from 'three-orbitcontrols-ts';

class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;

    private MAX_LINE_POINTS = 10;

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
        uniform vec3 linePoints[${this.MAX_LINE_POINTS}];
        uniform int lineStarts[${this.MAX_LINE_POINTS/2}];
        uniform vec4 lineColors[${this.MAX_LINE_POINTS}];
        uniform int numLines;
        uniform int numPoints;
        uniform float lineWidth;
        uniform float viewportWidth;
        float lerp = 0.0;

        float minimum_distance(vec2 v, vec2 w, vec2 p) {
            float l2 = distance(v,w);
            if (l2 == 0.0) return distance(p, v);   // v == w case
            //return distance(p,v);
            float t = max(0.0, min(1.0, dot(p - v, w - v) / (l2*l2)));
            vec2 projection = v + t * (w - v);  // Projection falls on the segment
            lerp = distance(v, projection)/distance(v,w);
            return distance(p, projection);
        }

        void main() {
        
        vec4 color = vec4(1,1,1,0.0);

        float lineScreenWidth = 1.0/viewportWidth * lineWidth;

        for(int i = 0; i < ${this.MAX_LINE_POINTS/2}; i++){
            if(i >= numLines)
                break;
            for(int j = 0; j < ${this.MAX_LINE_POINTS}; j++){
                if(j < lineStarts[i] + 1)
                    continue;
                if(j >= numPoints)
                    break;
                else if (i < numLines - 1)
                    if(j >= lineStarts[i+1])
                        break;

                vec4 startClip = projectionMatrix * viewMatrix * vec4(linePoints[j],1.0);
                vec4 endClip = projectionMatrix * viewMatrix * vec4(linePoints[j-1],1.0);
                startClip /= startClip.w;
                endClip /= endClip.w;

                endClip.y *= 1.0/aspect;
                startClip.y *= 1.0/aspect;

                vec2 p = 2.0 * vUv - vec2(1.0,1.0);

                if(minimum_distance(startClip.xy,endClip.xy,p) < lineScreenWidth){
                    color = mix(lineColors[j],lineColors[j-1],lerp);
                    break;
                }
            }
        }
        
        
        gl_FragColor = color;
        //gl_FragColor = vec4(startClip.x,startClip.x,startClip.x,1);   
        }`


        const lines: THREE.Vector3[] = [];
        lines.push(...[new THREE.Vector3(0,3,0), new THREE.Vector3(4,2,0), new THREE.Vector3(4.5,2.5,1), new THREE.Vector3(5,-1,-2), new THREE.Vector3(3,-2,-3)]);
        const numPoints = lines.length;
        while(lines.length < this.MAX_LINE_POINTS)
            lines.push(new THREE.Vector3());

        const lineStarts: number[] = [];
        lineStarts.push(0,3);
        const numLines = lineStarts.length;
        while(lineStarts.length < this.MAX_LINE_POINTS/2)
            lineStarts.push(-1);

        const lineColors: THREE.Vector4[] = [];
        lineColors.push(new THREE.Vector4(1,1,0,1),new THREE.Vector4(1,0,0,1), new THREE.Vector4(0.8,0,0.8,1), new THREE.Vector4(0.7,1,0.2,1), new THREE.Vector4(0.2,1,1,1));
        while(lineColors.length < this.MAX_LINE_POINTS)
            lineColors.push(new THREE.Vector4(1,1,1,1));


        params.uniforms = { 
            projectionMatrix: {value: this.camera.projectionMatrix},
            aspect: {value: this.camera.aspect},
            numPoints: {value: numPoints},
            lineWidth: {value: 15},
            linePoints: {value: lines},
            lineStarts: {value: lineStarts},
            lineColors: {value: lineColors},
            numLines: {value: numLines},
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