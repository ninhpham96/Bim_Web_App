import * as OBC from 'openbim-components';
import * as THREE from 'three';

export class Geometries implements OBC.Disposable {
  constructor(private scene: THREE.Scene) {
    this.initGeometry();
  }
  onDisposed: OBC.Event<unknown> = new OBC.Event();
  private initGeometry() {
    const geometry = new THREE.BufferGeometry();

    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0, // v0
      1.0, -1.0, 1.0, // v1
      1.0, 1.0, 1.0, // v2

      1.0, 1.0, 1.0, // v3
      -1.0, 1.0, 1.0, // v4
      -1.0, -1.0, 1.0  // v5
    ]);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);

    this.scene.add(mesh);
  }
  async dispose() {
    await this.onDisposed.trigger();
    this.onDisposed.reset();
    console.log("geometries disposed");
  }
}