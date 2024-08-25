import * as THREE from 'three';
import * as OBC from 'openbim-components';
import { RoadMaterial } from './RoadMaterial';

export class Road implements OBC.Disposable {

  private _roadMaterial: RoadMaterial;
  onDisposed: OBC.Event<unknown> = new OBC.Event();

  constructor(private scene: THREE.Scene) {
    this._roadMaterial = new RoadMaterial();
    this.initRoad();
    // this.initCurveRoad();
  }
  async dispose() {
    this._roadMaterial.dispose();
  };
  initRoad() {
    const curvePath = new THREE.CurvePath<THREE.Vector3>();
    const p1 = new THREE.Vector3(0, 0, 25);
    const p2 = new THREE.Vector3(0, 0, 0);
    const p3 = new THREE.Vector3(25, 0, -25);
    const curve = new THREE.CatmullRomCurve3([p1, p2, p3]);
    curvePath.add(curve);
    const roadGeometry = new RoadGeometry(curvePath, 5);
    const mesh = new THREE.Mesh(roadGeometry, this._roadMaterial.material);
    this.scene.add(mesh);
  }
  initCurveRoad() {
    const width = 1;
    const curvePath = new THREE.CurvePath();
    const p1 = new THREE.Vector3(0, 0, 25);
    const p2 = new THREE.Vector3(0, 0, 0);
    const p3 = new THREE.Vector3(25, 0, 0);
    const curve = new THREE.CatmullRomCurve3([p1, p2, p3]);
    curvePath.add(curve);
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    const normal = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const p1Left = p1.clone().add(normal.clone().multiplyScalar(width));
    const p1Right = p1.clone().add(normal.clone().multiplyScalar(-width));
    const p2Left = p2.clone().add(normal.clone().multiplyScalar(width));
    const p2Right = p2.clone().add(normal.clone().multiplyScalar(-width));
    const roadGeometry = new THREE.BufferGeometry().setFromPoints([p1Left, p1Right, p2Left, p2Left, p1Right, p2Right]);
    const road = new THREE.Mesh(roadGeometry, new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide }));
    this.scene.add(road);
  }
}
const radialSegments = 12;
const ribbonSegments = 128;

// helper variables
let P = new THREE.Vector3();
const normal = new THREE.Vector3();
const binormal = new THREE.Vector3();
const tangent = new THREE.Vector3();
const vertex = new THREE.Vector3();
const uv = new THREE.Vector2();

export class RoadGeometry extends THREE.BufferGeometry {
  tangents: THREE.Vector3[];
  normals: THREE.Vector3[];
  binormals: THREE.Vector3[];
  type = "RoadGeometry";
  dispose(): void {
    super.dispose();
    (this.tangents as unknown) = null;
    (this.normals as unknown) = null;
    (this.binormals as unknown) = null;
  }
  constructor(
    path: THREE.CurvePath<THREE.Vector3>,
    ribbonWidth = 10,
    // corner = true,
    numberSegments = ribbonSegments
  ) {
    super();

    const ribbonWidthHalf = ribbonWidth / 2;
    const frames = path.computeFrenetFrames(numberSegments, false);
    // expose internals
    this.tangents = frames.tangents;
    this.normals = frames.normals;
    this.binormals = frames.binormals;
    // buffer
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // create buffer data

    generateBufferData();

    // build geometry

    this.setIndex(indices);
    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    // functions

    function generateBufferData() {
      for (let i = 0; i <= numberSegments; i++) {
        generateSegment(i);
      }
      // generateSegment(0);
      generateUVs();
      generateIndices();
    }
    function generateSegment(i: number) {
      const width =
        i < 1 || i === numberSegments ? ribbonWidthHalf * 1.1 : ribbonWidthHalf;
      const activeWidth =
        ((i + numberSegments) / numberSegments) * ribbonWidthHalf;
      // we use getPointAt to sample evenly distributed points from the given path
      const progressAlongThePath = i / numberSegments;
      P = path.getPointAt(progressAlongThePath, P);
      // retrieve corresponding normal and binormal

      normal.copy(frames.normals[i]); //.applyQuaternion( faceRotation );
      binormal.copy(frames.binormals[i]); //.applyQuaternion( faceRotation );
      tangent.copy(frames.tangents[i]);

      // generate normals and vertices for the current segment

      for (let j = 0; j <= radialSegments; j++) {
        // normal
        normals.push(-normal.x, -normal.y, -normal.z);

        // vertex
        const v = (j / radialSegments) * Math.PI * 2;
        const sin = Math.sin(v);
        const cos = -Math.cos(v);

        vertex.x = P.x + activeWidth * (sin * normal.x + cos * binormal.x);
        vertex.y = P.y + activeWidth * (sin * normal.y + cos * binormal.y);
        vertex.z = P.z + activeWidth * (sin * normal.z + cos * binormal.z);

        vertices.push(vertex.x, vertex.y, vertex.z);
      }
    }

    function generateIndices() {
      for (let j = 1; j <= numberSegments; j++) {
        for (let i = 1; i <= numberSegments - 1; i++) {
          const a = (radialSegments + 1) * (j - 1) + (i - 1);
          const b = (radialSegments + 1) * j + (i - 1);
          const c = (radialSegments + 1) * j + i;
          const d = (radialSegments + 1) * (j - 1) + i;

          // faces

          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }
    }

    function generateUVs() {
      for (let i = 0; i <= numberSegments; i++) {
        for (let j = 0; j <= radialSegments; j++) {
          uv.x = 1 - j / (radialSegments - 1);
          uv.y = i / numberSegments;

          uvs.push(uv.x, uv.y);
        }
      }
    }
  }
}
