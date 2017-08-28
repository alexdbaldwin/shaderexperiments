import * as THREE from "three";




export default class DFXLoader {

    private lines: string[] = [];
    private vertices: number[] = [];
    private colors: number[] = [];
    private indices: number[] = [];
    private index = 0;
    private object: THREE.Object3D;
    constructor() {

    }

    public load = (dxf: string): THREE.Object3D => {
        this.lines = dxf.split('\n');
        this.object = new THREE.Object3D();
        this.vertices = [];
        this.indices = [];
        this.colors = [];
        this.index = 0;
        this.read();
        return this.object;
    }

    private read = () => {
        let eof = false;
        while (!eof) {


            switch (this.nextLine()) {
                case "0":
                    switch (this.nextLine()) {
                        case "SECTION":
                            break;
                        case "ENDSEC":
                            this.makeMesh();
                            break;
                        case "3DFACE":
                            this.read3DFace();
                            break;
                        case "EOF":
                            eof = true;
                            break;
                    }
                    break;
                case "2":
                    switch (this.nextLine()) {
                        case "ENTITIES":
                            this.vertices = [];
                            this.indices = [];
                            this.colors = [];
                            this.index = 0;
                            break;
                    }
                    break;
            }
        }

    }

    private makeMesh = () => {
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));
        geometry.addAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));
        geometry.addAttribute("index", new THREE.Uint16BufferAttribute(this.indices, 1));

        geometry.computeVertexNormals();

        const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
        this.object.add(new THREE.Mesh(geometry, material));
    }

    private read3DFace = () => {
        let layer = "default";
        let color = new THREE.Color();
        let p0 = new THREE.Vector3();
        let p1 = new THREE.Vector3();
        let p2 = new THREE.Vector3();
        let p3 = new THREE.Vector3();

        while (this.peekLine() != "0") {
            switch (this.nextLine()) {
                case "8": //Layer
                    layer = this.nextLine();
                    break;
                case "62": //Color
                    color = this.getACIColor(parseInt(this.nextLine()));
                    break;
                case "10": //p0.x
                    p0.setX(parseFloat(this.nextLine()));
                    break;
                case "20": //p0.y
                    p0.setY(parseFloat(this.nextLine()));
                    break;
                case "30": //p0.z
                    p0.setZ(parseFloat(this.nextLine()));
                    break;
                case "11": //p1.x
                    p1.setX(parseFloat(this.nextLine()));
                    break;
                case "21": //p1.y
                    p1.setY(parseFloat(this.nextLine()));
                    break;
                case "31": //p1.z
                    p1.setZ(parseFloat(this.nextLine()));
                    break;
                case "12": //p2.x
                    p2.setX(parseFloat(this.nextLine()));
                    break;
                case "22": //p2.y
                    p2.setY(parseFloat(this.nextLine()));
                    break;
                case "32": //p2.z
                    p2.setZ(parseFloat(this.nextLine()));
                    break;
                case "13": //p3.x
                    p3.setX(parseFloat(this.nextLine()));
                    break;
                case "23": //p3.y
                    p3.setY(parseFloat(this.nextLine()));
                    break;
                case "33": //p3.z
                    p3.setZ(parseFloat(this.nextLine()));
                    break;
            }
        }

        const i = this.index;
        this.vertices.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
        this.colors.push(color.r, color.g, color.b, color.r, color.g, color.b, color.r, color.g, color.b, color.r, color.g, color.b);
        this.indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
        this.index += 4;
    }

    private nextLine = (): string => {
        return this.lines.splice(0, 1)[0];
    }

    private peekLine = (): string => {
        return this.lines[0];
    }

    private getACIColor = (index: number): THREE.Color => {
        switch (index) {
            case 30:
                return new THREE.Color("#FF7F00");
            case 250:
                return new THREE.Color("#333333");
            case 251:
                return new THREE.Color("#505050");
            case 253:
                return new THREE.Color("#828282");
            default:
                return new THREE.Color("#FFFFFF");
        }

    }

}