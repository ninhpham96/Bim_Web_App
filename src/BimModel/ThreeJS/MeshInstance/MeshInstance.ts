import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface IGeometryMaterial {
  [colorId: string]: {
    buffers: THREE.BufferGeometry[];
    material: THREE.Material;
  };
}

export class MeshInstance {
  private readonly countMesh = 100;
  dispose() {
  }
  constructor(private _scene: THREE.Scene) {
    // this.initMesh();
    this.initOneMeshOneModel();
  }
  initMesh() {
    const sizeMesh = 5;
    const geometry = new THREE.BoxGeometry(sizeMesh, sizeMesh, sizeMesh);
    const instanceMesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), this.countMesh * this.countMesh);
    this._scene.add(instanceMesh);
    for (let i = 0; i < this.countMesh; i++) {
      for (let j = 0; j < this.countMesh; j++) {
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color('#' + Math.floor(Math.random() * 16777215).toString(16));
        matrix.setPosition(i * 2 * sizeMesh, 0, j * 2 * sizeMesh);
        instanceMesh.setColorAt(i * this.countMesh + j, color);
        instanceMesh.setMatrixAt(i * this.countMesh + j, matrix);
      }
    }
    instanceMesh.instanceMatrix.needsUpdate = true;
    instanceMesh.instanceColor!.needsUpdate = true;
  }
  initOneMeshOneModel() {
    const sizeMesh = 5;
    const geometryMaterials: IGeometryMaterial = {};
    const geometry = new THREE.BoxGeometry(sizeMesh, sizeMesh, sizeMesh);
    for (let i = 0; i < this.countMesh; i++) {
      const colorId = '#' + Math.floor(Math.random() * 16777215).toString(16);
      const color = new THREE.Color(colorId);
      const material = new THREE.MeshBasicMaterial({ color });
      if (!geometryMaterials[colorId])
        geometryMaterials[colorId] = { buffers: [], material };
      for (let j = 0; j < this.countMesh; j++) {
        const matrix = new THREE.Matrix4();
        matrix.setPosition(i * 2 * sizeMesh, 0, j * 2 * sizeMesh);
        geometryMaterials[colorId].buffers.push(geometry.clone().applyMatrix4(matrix));
      }
    }
    geometry.dispose();
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    for (const colorId in geometryMaterials) {
      const { buffers, material } = geometryMaterials[colorId];
      if (buffers.length === 0) continue;
      const combineGeometry = mergeGeometries(buffers);
      if (!combineGeometry) continue;
      geometries.push(combineGeometry);
      materials.push(material);
      buffers.forEach(buffer => buffer.dispose());
    }
    const combine = mergeGeometries(geometries, true);
    geometries.forEach(geometry => geometry.dispose());
    if (!combine) return;
    const mesh = new THREE.Mesh(combine, materials);
    this._scene.add(mesh);
  }
}
