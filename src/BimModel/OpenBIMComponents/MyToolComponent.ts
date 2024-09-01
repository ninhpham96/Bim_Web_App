import * as OBC from 'openbim-components'
import { generateUUID } from 'three/src/math/MathUtils.js';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface IGeometry {
  material: THREE.MeshBasicMaterial;
  geometries: THREE.BufferGeometry[];
}
export class MyToolComponent extends OBC.Component<unknown> implements OBC.Disposable, OBC.Updateable {
  enabled!: true;
  static readonly uuid = generateUUID();
  readonly onDisposed: OBC.Event<unknown> = new OBC.Event();
  readonly onAfterUpdate: OBC.Event<unknown> = new OBC.Event();
  readonly onBeforeUpdate: OBC.Event<unknown> = new OBC.Event();
  private mergeGeometries: { [uuid: string]: THREE.BufferGeometry } = {};
  private mergeMaterials: { [uuid: string]: THREE.MeshBasicMaterial } = {};

  constructor(components: OBC.Components) {
    super(components);
    this.components.tools.add(MyToolComponent.uuid, this);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(delta?: number) {
    if (this.enabled) {
      await this.onBeforeUpdate.trigger(this);
      await this.onAfterUpdate.trigger(this);
    }
  }
  async dispose() {
    await this.onDisposed.trigger(this);
    this.onDisposed.reset();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(..._args: unknown[]) {
    throw new Error("Method not implemented.");
  }
  action = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = false;
    input.click();
    input.onchange = async () => {
      const file = input.files?.item(0);
      if (file) {
        const json = await file.text();
        const data = JSON.parse(json);
        console.log('🚀 ~ MyToolComponent ~ input.onchange= ~ data:', data)
        this.processJsonFile(data);
        console.log("day la cai quan que gi vay?:", this.mergeMaterials);
      }
    };
    input.remove();
  }
  private processJsonFile(jsonFile: unknown) {
    const { geometries, images, materials, object, textures } = jsonFile;
    if (!geometries || !images || !materials || !object || !textures)
      throw new Error('Invalid JSON file');
    if (!object.children || !Array.isArray(object.children))
      throw new Error('Invalid JSON file');
    // process geometries
    this.storageGeometries(geometries);
    // process materials
    this.storageMaterials(materials);
    // process object
    this.storageObject(object.children);
    // process images
    this.storageImages(images);
    // process textures
    this.storageTextures(textures);
  }
  storageGeometries(geometries: unknown[]) {
    for (const geometry of geometries) {
      const { uuid, data } = geometry;
      if (!uuid || !data) continue;
      if (!data.attributes) continue;
      const { position, uv } = data.attributes;
      if (!position || !uv) continue;
      if (!position.array || !uv.array) continue;
      if (!position.itemSize || !uv.itemSize) continue;
      if (!Array.isArray(position.array) || !Array.isArray(uv.array)) continue;
      if (position.array.length === 0 || uv.array.length === 0) continue;
      const newPosition = new Float32Array(position.array);
      const newUv = new Float32Array(uv.array);
      const index: number[] = [];
      for (let i = 0; i < newPosition.length / 3; i++) {
        index.push(i);
      }
      const newGeometry = new THREE.BufferGeometry();
      newGeometry.setAttribute('position', new THREE.BufferAttribute(newPosition, position.itemSize));
      newGeometry.setAttribute('uv', new THREE.BufferAttribute(newUv, uv.itemSize));
      newGeometry.setIndex(index);
      newGeometry.computeVertexNormals();
      if (!this.mergeGeometries[uuid])
        this.mergeGeometries[uuid] = newGeometry;
    }
  }
  storageMaterials(materials: unknown[]) {
    for (const material of materials) {
      const { color, transparent, opacity, uuid } = material;
      if (!color || !opacity || !uuid) return;
      const newMaterial = new THREE.MeshBasicMaterial({ color: parseInt(color, 16), transparent, opacity });
      if (!this.mergeMaterials[uuid])
        this.mergeMaterials[uuid] = newMaterial
    }
  }
  storageObject(Children: unknown[]) {
    const geometriesOfMaterials: { [uuid: string]: IGeometry } = {};
    for (const child of Children) {
      const { children, userData } = child;
      if (!children || !userData) continue;
      if (!Array.isArray(children)) continue;
      for (const _child of children) {
        const { geometry, material } = _child;
        if (!geometry || !material) continue;
        const storageGeometry = this.mergeGeometries[geometry];
        const storageMaterial = this.mergeMaterials[material];
        if (!storageGeometry || !storageMaterial) continue;
        if (!geometriesOfMaterials[material]) {
          geometriesOfMaterials[material] = {
            material: storageMaterial,
            geometries: []
          };
        }
        geometriesOfMaterials[material].geometries.push(storageGeometry);
      }
    }
    if (Object.keys(geometriesOfMaterials).length === 0) return;
    const mergedGeometries: THREE.BufferGeometry[] = [];
    const mergedMaterials: THREE.MeshBasicMaterial[] = [];
    for (const uuid in geometriesOfMaterials) {
      const { material, geometries } = geometriesOfMaterials[uuid];
      if (geometries.length === 0) continue;
      const merged = mergeGeometries(geometries);
      if (!merged) throw new Error('Cannot merge geometries');
      mergedGeometries.push(merged);
      mergedMaterials.push(material);
      geometries.forEach(geometry => geometry.dispose());
    }
    if (mergedGeometries.length === 0) return;
    const combine = mergeGeometries(mergedGeometries, true);
    if (!combine) throw new Error('Cannot merge geometries');
    const mesh = new THREE.Mesh(combine, mergedMaterials);
    mergedGeometries.forEach(geometry => geometry.dispose());
    this.components.scene.get().add(mesh);
  }
  storageTextures(textures: unknown[]) {
  }
  storageImages(images: unknown[]) {
  }
}
OBC.ToolComponent.libraryUUIDs.add(MyToolComponent.uuid);