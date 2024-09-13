import * as flatBuffers from 'flatbuffers';
import pako from 'pako';
import * as FB from '../compress-revit'
import * as THREE from 'three';
import * as fs from 'fs';
import * as path from 'path';

//#region interface
interface IPosition {
  itemSize: number;
  array: number[];
}
interface IUV {
  item_size: number;
  array: number[];
}

interface IGeometry {
  uuid: string;
  position: IPosition;
  uv: IUV;
}

// material
interface IMaterial {
  uuid: string;
  color: string;
  transparency: boolean;
  opacity: number;
}

// metadata
interface IMetadata {
  type: string;
  version: number;
  generator: string;
  projectName: string;
}
// element
interface ISubElement {
  geometry: string;
  material: string;
}
interface IElement {
  userData: string;
  children: ISubElement[];
}
interface ICompress {
  geometries: IGeometry[];
  materials: IMaterial[];
  metadata: IMetadata;
  children: IElement[];
}
//#endregion

export class Serializer {
  async decompress(data: Uint8Array) {
  }
  async compress(inputPath: string, outputPath: string) {
    try {
      const data = fs.readFileSync(inputPath, { encoding: 'utf-8' });
      const jsonData = JSON.parse(data);
      const { geometries, materials, metadata, object } = jsonData;
      if (!geometries || !materials || !metadata || !object)
        throw new Error('Invalid data');
      if (!Array.isArray(geometries) || !Array.isArray(materials))
        throw new Error('Invalid data');
      if (!object.children || !Array.isArray(object.children))
        throw new Error('Invalid data');
      const metadataProduce = {
        type: metadata.type || "type",
        version: metadata.version || 0,
        generator: metadata.generator || "generator",
        projectName: "project_name",
      } as IMetadata;
      const builder = new flatBuffers.Builder(2048);
      const geometriesCount = this.compressGeometries(geometries, builder);
      const materialsCount = this.compressMaterials(materials, builder);
      const metadataVector = this.compressMetadata(metadataProduce, builder);
      const objectsCount = this.compressObject(object.children, builder);

      const geometriesVector = FB.CompressBuffer.createGeometriesVector(builder, geometriesCount);
      const materialsVector = FB.CompressBuffer.createMaterialsVector(builder, materialsCount);
      const objectsVector = FB.CompressBuffer.createChildrenVector(builder, objectsCount);
      FB.CompressBuffer.startCompressBuffer(builder);
      FB.CompressBuffer.addGeometries(builder, geometriesVector);
      FB.CompressBuffer.addMaterials(builder, materialsVector);
      FB.CompressBuffer.addMetadata(builder, metadataVector);
      FB.CompressBuffer.addChildren(builder, objectsVector);
      const buffer = FB.CompressBuffer.endCompressBuffer(builder);
      builder.finish(buffer);
      const compressedData = builder.asUint8Array();
      const compressedPako = pako.deflate(compressedData);
      const outputName = outputPath + "/" + "Compress.gz"
      fs.writeFileSync(outputName, compressedPako);
    } catch (error) {
      console.log(error);
    }
  }

  private compressGeometries(geometries: any[], builder: flatBuffers.Builder): number[] {
    const geometriesCount: number[] = [];
    for (const geometry of geometries) {
      const { uuid, data } = geometry;
      if (!uuid || !data || !data.attributes) continue;
      const { position, uv } = data.attributes;
      if (!position || !uv) continue;
      if (!position.array && !uv.array) continue;
      if (!position.itemSize && !uv.itemSize) continue;
      if (!Array.isArray(position.array) && !Array.isArray(uv.array)) continue;
      const uuidVector = builder.createString(uuid);
      const positionVector = this.compressAttributes(position.itemSize, position.array, builder);
      const uvVector = this.compressAttributes(uv.itemSize, uv.array, builder);
      FB.IGeometryBuffer.startIGeometryBuffer(builder);
      FB.IGeometryBuffer.addPosition(builder, positionVector);
      FB.IGeometryBuffer.addUv(builder, uvVector);
      FB.IGeometryBuffer.addUuui(builder, uuidVector);
      geometriesCount.push(FB.IGeometryBuffer.endIGeometryBuffer(builder));
    }
    return geometriesCount;
  }
  private compressAttributes(itemSize: number, array: number[], builder: flatBuffers.Builder) {
    const arrayVector = FB.IPositionBuffer.createArrayVector(builder, array);
    return FB.IPositionBuffer.createIPositionBuffer(builder, itemSize, arrayVector)
  }
  private compressMetadata(metadata: IMetadata, builder: flatBuffers.Builder) {
    const { type, version, generator, projectName } = metadata;
    const typeVector = builder.createString(type);
    const generatorVector = builder.createString(generator);
    const projectNameVector = builder.createString(projectName);
    return FB.IMetadataBuffer.createIMetadataBuffer(builder, typeVector, version, generatorVector, projectNameVector);
  }
  private compressMaterials(materials: any[], builder: flatBuffers.Builder) {
    const materialsCount: number[] = [];
    for (const material of materials) {
      const { uuid, color, transparent, opacity } = material;
      if (!uuid || !color || !opacity) continue;
      if (typeof color !== 'string' || typeof opacity !== 'number' ||
        typeof transparent !== 'boolean') continue;
      const uuidVector = builder.createString(uuid);
      const colorVector = builder.createString(color);
      materialsCount.push(FB.IMaterialBuffer.createIMaterialBuffer(builder, uuidVector, colorVector, transparent, opacity));
    }
    return materialsCount;
  }
  private compressObject(object: any[], builder: flatBuffers.Builder) {
    const objectsCount: number[] = [];
    for (const child of object) {
      const { children, userData } = child;
      if (!children || !Array.isArray(children)) continue;
      const userDataVector = builder.createString(userData);
      const subChildCount: number[] = [];
      if (!userData) continue;
      for (const subChild of children) {
        const { geometry, material } = subChild;
        if (!geometry || !material) continue;
        if (typeof geometry !== 'string' || typeof material !== 'string') continue;
        const geometryVector = builder.createString(geometry);
        const materialVector = builder.createString(material);
        subChildCount.push(FB.ISubElementBuffer.createISubElementBuffer(builder, geometryVector, materialVector));
      }
      const subChildVector = FB.IElementBuffer.createSubChildrenVector(builder, subChildCount);
      objectsCount.push(FB.IElementBuffer.createIElementBuffer(builder, userDataVector, subChildVector));
    }
    return objectsCount;
  }
}