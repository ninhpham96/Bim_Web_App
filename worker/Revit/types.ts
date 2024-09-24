import * as THREE from 'three';
export interface IGeometry {
  material: THREE.MeshBasicMaterial;
  geometries: THREE.BufferGeometry[];
}