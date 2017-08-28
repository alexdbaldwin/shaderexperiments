import * as THREE from "three";

export default class LineDrawer extends THREE.Object3D {

    private MAX_LINE_POINTS = 10;
    private plane: THREE.Mesh;

    constructor(camera: THREE.PerspectiveCamera){
        super();

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
        uniform sampler2D depthTexture;

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

        float depthAtPoint(vec2) {
            return 1.0;
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

                    float depthStart = (startClip.z + 1.0)/2.0;
                    float depthEnd = (startClip.z + 1.0)/2.0;

                    endClip.y *= 1.0/aspect;
                    startClip.y *= 1.0/aspect;

                    vec2 p = 2.0 * vUv - vec2(1.0,1.0);

                    vec2 vUv_ = vec2(vUv.x, (vUv.y - (1.0-(1.0/aspect))/2.0)/(1.0/aspect));

                    if(minimum_distance(startClip.xy,endClip.xy,p) < lineScreenWidth){

                        vec4 depthColor = texture2D(depthTexture, vUv_);
                        if((depthColor.a > 0.0 && depthColor.r > mix(depthStart,depthEnd,lerp)) || depthColor.a == 0.0){
                            color = mix(lineColors[j],lineColors[j-1],lerp);
                        }
                            
                        break;
                    }
                }
            }
        
            //vec2 vUv_ = vec2(vUv.x, (vUv.y - (1.0-(1.0/aspect))/2.0)/(1.0/aspect));

            //gl_FragColor = texture2D(depthTexture, vUv_).rgba;
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
            projectionMatrix: {value: camera.projectionMatrix},
            aspect: {value: camera.aspect},
            numPoints: {value: numPoints},
            lineWidth: {value: 15},
            linePoints: {value: lines},
            lineStarts: {value: lineStarts},
            lineColors: {value: lineColors},
            numLines: {value: numLines},
            viewportWidth: {value: window.innerWidth},
            depthTexture: {value: new THREE.Texture()}
        };
        params.transparent = true;
        const shaderMaterial = new THREE.ShaderMaterial(params);
        const planeHeight = 2*camera.near*Math.tan(0.5*camera.fov*Math.PI*2/360);
        const planeGeometry = new THREE.PlaneGeometry(planeHeight * camera.aspect, planeHeight, 1, 1);
       
        const uvs = [];
        const h = 1/camera.aspect;
        uvs.push(0,(1+h)/2, 1,(1+h)/2, 0,(1-h)/2, 1,(1-h)/2);
        const planeBG = new THREE.PlaneBufferGeometry(planeHeight * camera.aspect, planeHeight, 1, 1);
        planeBG.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
        this.plane = new THREE.Mesh(planeBG,shaderMaterial);

        this.add(this.plane);
        this.plane.position.set(0,0,-camera.near);
    }

    public setDepthTexture = (texture: THREE.Texture): void => {
        (this.plane.material as THREE.ShaderMaterial).uniforms.depthTexture.value = texture;
        (this.plane.material as THREE.ShaderMaterial).needsUpdate = true;
    }
}