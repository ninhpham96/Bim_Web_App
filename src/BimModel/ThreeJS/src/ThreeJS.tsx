import * as THREE from 'three';
import * as OBC from 'openbim-components';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import CameraControls from 'camera-controls';

const pos = new THREE.Vector3(10, 10, 10);
CameraControls.install({
  THREE: {
    MOUSE: THREE.MOUSE,
    Vector2: THREE.Vector2,
    Vector3: THREE.Vector3,
    Vector4: THREE.Vector4,
    Quaternion: THREE.Quaternion,
    Matrix4: THREE.Matrix4,
    Spherical: THREE.Spherical,
    Box3: THREE.Box3,
    Sphere: THREE.Sphere,
    Raycaster: THREE.Raycaster,
    MathUtils: THREE.MathUtils,
  }
});
let instance: ThreeJS | null = null;
export class ThreeJS implements OBC.Disposable {
  onDisposed: OBC.Event<unknown> = new OBC.Event();
  private _scene: THREE.Scene = new THREE.Scene();
  private _perspectiveCamera!: THREE.PerspectiveCamera;
  private _orthographicCamera!: THREE.OrthographicCamera;
  private _renderer!: THREE.WebGLRenderer;
  private _labelRenderer!: CSS2DRenderer;
  private _cameraControls!: CameraControls;
  private clock = new THREE.Clock();
  currentCamera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  // tool
  private _axesHelper!: THREE.AxesHelper;
  private _ambientLight!: THREE.AmbientLight;
  private _directionalLight!: THREE.DirectionalLight;

  private _projection = false;
  set projection(projection: boolean) {
    if (this._projection === projection) return;
    this._projection = projection;
    this._perspectiveCamera ??= this.initperspectiveCamera();
    this._orthographicCamera ??= this.initOrthographicCamera();
    this.currentCamera = projection ? this._perspectiveCamera : this._orthographicCamera;
  }
  get scene() {
    return this._scene;
  }
  get projection() {
    return this._projection;
  }
  set setEventResize(setup: boolean) {
    if (setup) window.addEventListener('resize', this.onResize);
    else window.removeEventListener('resize', this.onResize);
  }
  constructor(private container: HTMLElement, private canvas: HTMLCanvasElement) {
    if (instance) return instance;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this;
    this.projection = true;
    this._renderer = this.initRenderer();
    this._labelRenderer = this.initLabelRenderer();
    this._cameraControls = this.initCameraControls();
    this.initTool();
    this.animate();
    this.setEventResize = true;
  }
  async dispose() {
    // this._renderer.dispose();
    // this._renderer.renderLists.dispose();
    this._labelRenderer.domElement.remove();
    this._cameraControls.dispose();
    this.setEventResize = false;
    await this.onDisposed.trigger();
    this.onDisposed.reset();
    console.log("object disposed");
  }
  private initperspectiveCamera(): THREE.PerspectiveCamera {
    const { width, height } = this.container.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.copy(pos);
    return camera;
  }
  private initOrthographicCamera(): THREE.OrthographicCamera {
    const { width, height } = this.container.getBoundingClientRect();
    const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    camera.position.copy(pos);
    return camera;
  }
  private initRenderer(): THREE.WebGLRenderer {
    const { width, height } = this.container.getBoundingClientRect();
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
  }
  private initLabelRenderer(): CSS2DRenderer {
    const { width, height } = this.container.getBoundingClientRect();
    const renderer = new CSS2DRenderer();
    renderer.setSize(width, height);
    this.container.appendChild(renderer.domElement);
    return renderer;
  }
  private initCameraControls(): CameraControls {
    const controls = new CameraControls(this.currentCamera!, this._renderer?.domElement);
    return controls;
  }
  private animate = () => {
    if (!this._renderer || !this.currentCamera || !this._labelRenderer || !this._labelRenderer) return;
    this._cameraControls.update(this.clock.getElapsedTime());
    this._renderer.render(this._scene, this.currentCamera);
    this._renderer.setAnimationLoop(this.animate);
  }
  private initTool() {
    this._axesHelper = new THREE.AxesHelper(5);
    this._ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this._directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this._scene.add(this._axesHelper);
    this._scene.add(this._ambientLight);
    this._scene.add(this._directionalLight);
  }
  private onResize = () => {
    if (!this._renderer || !this._labelRenderer) return;
    const { width, height } = this.container.getBoundingClientRect();
    this._renderer.setSize(width, height);
    this._labelRenderer.setSize(width, height);
  }
}
