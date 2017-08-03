import * as THREE from "three";
import Updatable from "./Updatable";
import * as Settings from "./settings";

export default class Ship extends THREE.Object3D implements Updatable {
    private forward: boolean = false;
    private back: boolean = false;
    private left: boolean = false;
    private right: boolean = false;

    private acceleration: number = 0.0;
    private thrusterStrength: number = 1.0;
    private velocityDamping: number = 0.1;
    private velocity: number = 0.0;

    constructor() {
        super();

        document.addEventListener("mousedown", this.onKeyDown);
        document.addEventListener("mousedown", this.onKeyUp);
    }

    public update = (deltaTime: number): void => {

    }

    private onKeyDown = (e: KeyboardEvent): void => {
        this.keyChange(e.code, true);
    }

    private onKeyUp = (e: KeyboardEvent): void => {
        this.keyChange(e.code, false);
    }

    private keyChange = (code: string, down: boolean): void => {
        switch (code) {
            case Settings.Keys.Forward:
                this.forward = down;
                break;
            case Settings.Keys.Back:
                this.back = down;
                break;
            case Settings.Keys.Left:
                this.left = down;
                break;
            case Settings.Keys.Right:
                this.right = down;
                break;
        }
    }
}