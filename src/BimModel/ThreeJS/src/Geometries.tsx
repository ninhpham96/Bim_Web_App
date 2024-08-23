import * as OBC from 'openbim-components';
import * as THREE from 'three';

export class Geometries implements OBC.Disposable {
  onDisposed: OBC.Event<unknown> = new OBC.Event();
  meshs: THREE.Mesh[] = [];
  constructor(private scene: THREE.Scene) {
    this.initGeometry();
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
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    this.meshs.push(mesh);
    this.scene.add(mesh);
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
}