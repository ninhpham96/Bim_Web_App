import * as THREE from 'three';
import { LineMaterial, LineGeometry, Line2 } from 'three/examples/jsm/Addons.js';

export class MyLine2 {
  constructor(private _scene: THREE.Scene, private _lineMaterial: LineMaterial) {
    this.initLine2();
  }
  initLine2() {
    const p1 = new THREE.Vector3(-20, 0, 0);
    const p2 = new THREE.Vector3(20, 0, 0);
    const lineGeometry = new LineGeometry().setPositions([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]);

    const colors = [];
    const color = new THREE.Color();
    color.setHSL(0.5, 1.0, 0.5, THREE.SRGBColorSpace);
    colors.push(color.r, color.g, color.b);
    colors.push(color.r, color.g, color.b);
    lineGeometry.setColors(colors);
    const line2 = new Line2(lineGeometry, this._lineMaterial);
    this._scene.add(line2);
  }
}