import * as THREE from 'three';

const countMesh = 10;
export class MeshInstance {

  dispose() {
  }
  constructor(private _scene: THREE.Scene) {
    this.initMesh();
  }
  initMesh() {
    const sizeMesh = 5;
    const geometry = new THREE.BoxGeometry(sizeMesh, sizeMesh, sizeMesh);
    const instanceMesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), countMesh * countMesh);
    this._scene.add(instanceMesh);
    for (let i = 0; i < countMesh; i++) {
      for (let j = 0; j < countMesh; j++) {
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color('#' + Math.floor(Math.random() * 16777215).toString(16));
        matrix.setPosition(i * 2 * sizeMesh, 0, j * 2 * sizeMesh);
        instanceMesh.setColorAt(i * countMesh + j, color);
        instanceMesh.setMatrixAt(i * countMesh + j, matrix);
      }
    }
    instanceMesh.instanceMatrix.needsUpdate = true;
    instanceMesh.instanceColor!.needsUpdate = true;
  }
}