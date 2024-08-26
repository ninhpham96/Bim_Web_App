import * as THREE from 'three';
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export class Label2D {
  constructor(private _scene: THREE.Scene) {
    this.init();
  }
  init() {
    const div = document.createElement('div');
    div.className =
      "h-[32px] w-[32px] rounded-full border-[2px] border-green-400 bg-blue-400";
    const label = new CSS2DObject(div);
    this._scene.add(label);
  }
}