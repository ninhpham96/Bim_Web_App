import * as flatBuffers from 'flatbuffers';
import pako from 'pako';
import * as FB from './compress-revit'
import * as THREE from 'three';
import { IGeometry } from './types';
import { mergeBufferGeometries } from 'three-stdlib';

export interface IMetadata {
  type?: string;
  version?: number;
  generator?: string;
  projectName?: string;
}

export class Decompress {
  private uniqueGeometries: { [uuid: string]: THREE.BufferGeometry } = {};
  private uniqueMaterials: { [uuid: string]: THREE.MeshBasicMaterial } = {};
  private metadata!: IMetadata;

  constructor(private scene: THREE.Scene) {
  }
  async readFile(buffer: Uint8Array) {
    const newBuffer = pako.inflate(buffer);
    const builder = new flatBuffers.ByteBuffer(newBuffer);
    const compressBuffer = FB.CompressBuffer.getRootAsCompressBuffer(builder);
    this.decompressGeometries(compressBuffer);
    this.decompressMaterials(compressBuffer);
    const decompressMetadata = compressBuffer.metadata();
    if (decompressMetadata) {
      this.metadata = {
        type: decompressMetadata.type() || '',
        version: decompressMetadata.version(),
        generator: decompressMetadata.generator() || '',
        projectName: decompressMetadata.projectName() || ''
      }
    }
    this.decompressChildren(compressBuffer);
  }
  private decompressGeometries(compressBuffer: FB.CompressBuffer) {
    for (let i = 0; i < compressBuffer.geometriesLength(); i++) {
      const geometry = compressBuffer.geometries(i);
      if (!geometry) continue;
      const uuid = geometry.uuui();
      const position = geometry.position();
      const uv = geometry.uv();
      if (!uuid || !position || !uv) continue;
      const index: number[] = [];
      const decompressGeometries = new THREE.BufferGeometry();
      const decompressPosition = this.decompressPosition(position, index);
      const decompressUV = this.decompressUV(uv);
      if (!decompressPosition || !decompressUV) continue;
      decompressGeometries.setAttribute('position', decompressPosition);
      decompressGeometries.setAttribute('uv', decompressUV);
      decompressGeometries.setIndex(index);
      decompressGeometries.computeVertexNormals();
      if (!this.uniqueGeometries[uuid])
        this.uniqueGeometries[uuid] = decompressGeometries;
    }
    console.log('🚀 ~ Decompress ~ decompressGeometries ~ uniqueGeometries:', this.uniqueGeometries)
  }
  private decompressPosition(position: FB.IPositionBuffer, index: number[])
    : THREE.BufferAttribute | null {
    const itemSize = position.itemSize();
    const array = position.arrayArray()!;
    if (!itemSize || !array || array.length === 0) return null;
    for (let i = 0; i < array.length; i++) {
      index.push(i);
    }
    return new THREE.BufferAttribute(array, itemSize);
  }
  private decompressUV(uv: FB.IUVBuffer)
    : THREE.BufferAttribute | null {
    const itemSize = uv.itemSize();
    const array = uv.arrayArray();
    if (!itemSize || !array || array.length === 0) return null;
    return new THREE.BufferAttribute(array, itemSize);
  }
  private decompressMaterials(compressBuffer: FB.CompressBuffer) {
    for (let i = 0; i < compressBuffer.materialsLength(); i++) {
      const material = compressBuffer.materials(i);
      if (!material) continue;
      const uuid = material.uuui();
      const color = material.color();
      if (!uuid || !color) continue;
      const transparent = material.transparency();
      const opacity = material.opacity();
      const newMaterial = new THREE.MeshBasicMaterial({ color: parseInt(color, 16), opacity, transparent });
      if (!this.uniqueMaterials[uuid])
        this.uniqueMaterials[uuid] = newMaterial;
    }
  }
  private decompressChildren(compressBuffer: FB.CompressBuffer) {
    const geometriesOfMaterials: { [uuid: string]: IGeometry } = {};
    for (let i = 0; i < compressBuffer.childrenLength(); i++) {
      const child = compressBuffer.children(i);
      if (!child) continue;
      const userData = child.userData();
      const subChildren = child.subChildrenLength();
      if (!userData || subChildren === 0) continue;
      for (let j = 0; j < subChildren; j++) {
        const subChild = child.subChildren(j);
        if (!subChild) continue;
        const geometryId = subChild.geometry();
        const materialId = subChild.material();
        if (!geometryId || !materialId) continue;
        const storageGeometry = this.uniqueGeometries[geometryId];
        const storageMaterial = this.uniqueMaterials[materialId];
        if (!storageGeometry || !storageMaterial) continue;
        if (!geometriesOfMaterials[materialId]) {
          geometriesOfMaterials[materialId] = {
            material: storageMaterial,
            geometries: []
          } as IGeometry;
          geometriesOfMaterials[materialId].geometries.push(storageGeometry);
        }
      }
    }
    if (Object.keys(geometriesOfMaterials).length === 0) return;
    const mergedGeometries: THREE.BufferGeometry[] = [];
    const mergedMaterials: THREE.MeshBasicMaterial[] = [];
    for (const uuid in geometriesOfMaterials) {
      const { material, geometries } = geometriesOfMaterials[uuid];
      if (geometries.length === 0) continue;
      const mergedGeometry = mergeBufferGeometries(geometries);
      if (!mergedGeometry) continue;
      mergedGeometries.push(mergedGeometry);
      geometries.forEach(geometry => geometry.dispose());
      mergedMaterials.push(material);
    }
    if (mergedGeometries.length === 0) return;
    const combineGeometry = mergeBufferGeometries(mergedGeometries, true);
    if (!combineGeometry) return;
    combineGeometry.computeBoundingBox();
    const mesh = new THREE.Mesh(combineGeometry, mergedMaterials);
    mesh.userData = this.metadata;
    this.scene.add(mesh);
    mergedGeometries.forEach(geometry => geometry.dispose());
    this.uniqueGeometries = {};
    this.uniqueMaterials = {};
  }
}