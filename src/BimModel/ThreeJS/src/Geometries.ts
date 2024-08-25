import * as THREE from 'three';
import * as OBC from 'openbim-components';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class Geometries implements OBC.Disposable {
  onDisposed: OBC.Event<unknown> = new OBC.Event();
  meshs: THREE.Mesh[] = [];
  constructor(private scene: THREE.Scene) {
    // this.initGeometry();
    // this.initMergeGeometry();
    // this.initGeometryFromPoints();
    // this.initEdgesGeometry();
  }
  async dispose() {
    this.meshs.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    });
    await this.onDisposed.trigger();
    this.onDisposed.reset();
    console.log("geometries disposed");
  }
  private initGeometry() {
    const geometry = new THREE.BufferGeometry();

    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    const vertices = new Float32Array([
      -10.0, 0.0, 10.0, // v0
      10.0, 0.0, 10.0, // v1
      10.0, 0.0, -10.0, // v2

      10.0, 0.0, -10.0, // v3
      -10.0, 0.0, -10.0, // v4
      -10.0, 10.0, 10.0  // v5
    ]);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    this.meshs.push(mesh);
    this.scene.add(mesh);
  }
  private initMergeGeometry() {
    const geometry1 = new THREE.BoxGeometry(5, 5, 5);
    // geometry1.translate(5, 0, 0);
    const geometry2 = new THREE.BoxGeometry(10, 10, 10);
    // geometry2.translate(-5, 0, 0);

    // const mesh1 = new THREE.Mesh(geometry1, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    // const mesh2 = new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));

    const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000, depthWrite: false });
    const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const mergeBox = mergeGeometries([geometry1, geometry2], true);
    const mesh3 = new THREE.Mesh(mergeBox, [material2, material1]);

    this.scene.add(mesh3);
  }
  private initGeometryFromPoints() {

    const geometry = new THREE.BufferGeometry();
    const points: THREE.Vector3[] = [];
    const point1 = new THREE.Vector3(-10.0, 0.0, 10.0);
    const point2 = new THREE.Vector3(10.0, 0.0, 10.0);
    const point3 = new THREE.Vector3(10.0, 0.0, -10.0);
    const point4 = new THREE.Vector3(10.0, 0.0, -10.0,);
    const point5 = new THREE.Vector3(-10.0, 0.0, -10.0);
    const point6 = new THREE.Vector3(-10.0, 0.0, 10.0);
    points.push(point1, point2, point3, point4, point5, point6);
    geometry.setFromPoints(points);

    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    this.meshs.push(mesh);
    this.scene.add(mesh);
  }
  private initEdgesGeometry() {
    const geometry1 = new THREE.BoxGeometry(5, 5, 5);
    geometry1.translate(5, 0, 0);
    const geometry2 = new THREE.BoxGeometry(10, 10, 10);
    geometry2.translate(-10, 0, 0);

    const mergeBox = mergeGeometries([geometry1, geometry2], true);
    // const mesh3 = new THREE.Mesh(mergeBox, [material2, material1]);

    const geometry = new THREE.EdgesGeometry(mergeBox);
    const mesh = new THREE.LineSegments(geometry);
    this.scene.add(mesh)
  }
}