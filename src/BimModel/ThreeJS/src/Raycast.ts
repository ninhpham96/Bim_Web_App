import * as THREE from 'three';

export class Raycast {
  private _raycaster = new THREE.Raycaster();
  private _pointer = new THREE.Vector2();

  set setupEvent(setup: boolean) {
    if (!this._domElement) return;
    if (setup) {
      this._domElement.addEventListener('pointermove', this.onPointerMove);
    } else {
      this._domElement.removeEventListener('pointermove', this.onPointerMove);
    }
  }

  constructor(private _domElement: HTMLCanvasElement, private _scene: THREE.Scene, private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    this.setupEvent = true;
  }
  onPointerMove(event: any) {
    // const { width, height } = this._domElement.getBoundingClientRect();
    // this._pointer.x = event.clientX / width * 2 - 1;
    // this._pointer.y = -event.clientY / height * 2 + 1;
    // this._raycaster.setFromCamera(this._pointer, this.camera);
    // const intersects = this._raycaster.intersectObjects(this._scene.children, true);
    console.log('🚀 ~ Raycast ~ onPointerMove ~ intersects:', this._domElement)
  }
  async Dispose() {
    this.setupEvent = false;
  }
}