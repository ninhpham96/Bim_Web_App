import * as THREE from 'three';
import * as OBC from 'openbim-components';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export class ThreeJS implements OBC.Disposable {
  onDisposed: OBC.Event<unknown> = new OBC.Event();

  private _scene: THREE.Scene = new THREE.Scene();
  private _perspectiveCamera!: THREE.PerspectiveCamera;
  private _orthographicCamera!: THREE.OrthographicCamera;
  private _renderer!: THREE.WebGLRenderer;
  private _labelRenderer!: CSS2DRenderer;
  private _orbitControls!: OrbitControls;
  currentCamera!: THREE.Camera;

  private _projection = true;
  set projection(projection: boolean) {
    if (this._projection === projection) return;
    this._projection = projection;
    this._perspectiveCamera ??= this.initperspectiveCamera();
    this._orthographicCamera ??= this.initOrthographicCamera();
    this.currentCamera = projection ? this._perspectiveCamera : this._orthographicCamera;
  }
  get projection() {
    return this._projection;
  }

  constructor(private container: HTMLElement) {
    this.projection = true;
    this.initRenderer();
  }
  async dispose() {
    await this.onDisposed.trigger();
    this.onDisposed.reset();
    console.log("object disposed");
  }
  private initperspectiveCamera(): THREE.PerspectiveCamera {
    const { width, height } = this.container.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    return camera;
  }
  private initOrthographicCamera(): THREE.OrthographicCamera {
    const { width, height } = this.container.getBoundingClientRect();
    const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    return camera;
  }
  private initRenderer() {
    const { width, height } = this.container.getBoundingClientRect();
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(width, height);
    this.container.appendChild(this._renderer.domElement);
  }
}
