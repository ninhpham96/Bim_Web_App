import * as THREE from 'three';
import * as OBC from 'openbim-components';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import CameraControls from 'camera-controls';
import { LineMaterial } from 'three/examples/jsm/Addons.js';
import { MeshInstance } from '../MeshInstance/MeshInstance';
// import { Label2D } from '../Label2D/Label2D';
// import { MyLine2 } from '../Line2/MyLine2';
// import { Raycast } from './Raycast';

const pos = new THREE.Vector3(30, 100, 30);
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
  private lineMaterial = new LineMaterial({
    linewidth: 3,
    vertexColors: true,
    alphaToCoverage: true,
    color: 0x0000ff,
    dashed: false,
    dashScale: 1,
  });

  private _projection = false;
  set projection(projection: boolean) {
    if (this._projection === projection) return;
    this._projection = projection;
    this._perspectiveCamera ??= this.initPerspectiveCamera();
    this._orthographicCamera ??= this.initOrthographicCamera();
    this.currentCamera = projection ? this._perspectiveCamera : this._orthographicCamera;
  }
  get scene() {
    return this._scene;
  }
  get renderer() {
    return this._renderer;
  }
  get projection() {
    return this._projection;
  }
  set setEventResize(setup: boolean) {
    if (setup) window.addEventListener('resize', this.onResize);
    else window.removeEventListener('resize', this.onResize);
  }
  constructor(private container: HTMLElement, private canvas: HTMLCanvasElement) {
    this._scene.background = new THREE.Color(0xC0DED8);
    this.projection = true;
    this._renderer = this.initRenderer();
    this._labelRenderer = this.initLabelRenderer();
    this._cameraControls = this.initCameraControls();
    this.initMeshInstance();
    this.initRaycast();
    this.initLabel();
    this.initTool();
    this.animate();
    this.setEventResize = true;
  }
  async dispose() {
    this.setEventResize = false;
    this._renderer?.dispose();
    this._renderer?.renderLists.dispose();
    this._labelRenderer?.domElement.remove();
    this._cameraControls.dispose();
    await this.onDisposed.trigger();
    this.onDisposed.reset();
    console.log("object disposed");
  }
  private initPerspectiveCamera(): THREE.PerspectiveCamera {
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
      preserveDrawingBuffer: true
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
  initMeshInstance() {
    new MeshInstance(this._scene);
  }
  private initRaycast() {
    // new Raycast(this._renderer?.domElement, this._scene, this.currentCamera!);
  }
  private animate = () => {
    if (!this._renderer || !this.currentCamera || !this._labelRenderer || !this._labelRenderer) return;
    const { width, height } = this.canvas.getBoundingClientRect();
    this.lineMaterial.resolution.set(width, height);
    this._cameraControls.update(this.clock.getElapsedTime());
    this._renderer.render(this._scene, this.currentCamera);
    this._renderer.setAnimationLoop(this.animate);
    this._labelRenderer.render(this._scene, this.currentCamera);
  }
  initLabel() {
    // new Label2D(this._scene);
    // new MyLine2(this._scene, this.lineMaterial);
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
