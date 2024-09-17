import * as OBC from 'openbim-components'
import * as THREE from 'three'
import { MyToolComponent } from '../MyToolComponent';
import WorkerComponent from '@/BimModel/Worker/WorkerComponent';

export class BasicComponent implements OBC.Disposable {
  readonly onDisposed: OBC.Event<unknown> = new OBC.Event();
  private components!: OBC.Components;

  constructor(private container: HTMLElement) {
    this.init();
    this.initMyTool();
  }
  init() {
    // initialize the component
    this.components = new OBC.Components();
    this.components.scene = new OBC.SimpleScene(this.components);
    this.components.renderer = new OBC.PostproductionRenderer(this.components, this.container);
    this.components.camera = new OBC.SimpleCamera(this.components);
    this.components.raycaster = new OBC.SimpleRaycaster(this.components);
    this.components.init();

    const scene = this.components.scene.get();
    (this.components.renderer as OBC.PostproductionRenderer).postproduction.enabled = true;

    (this.components.camera as OBC.SimpleCamera).controls.setLookAt(20, 20, 20, 0, 0, 0);
    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(5, 10, 3);
    directionalLight.intensity = 0.5;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight();
    ambientLight.intensity = 0.5;
    scene.add(ambientLight);
    const grid = new OBC.SimpleGrid(this.components, new THREE.Color(0x666666));
    this.components.tools.add("77e3066d-c402-4d77-b3bf-3f1dce9a9576", grid);
    const customEffects = (this.components.renderer as OBC.PostproductionRenderer).postproduction.customEffects;
    customEffects.excludedMeshes.push(grid.get());
    const matrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
    const matrixInverse = matrix.clone().transpose();
    scene.matrix.premultiply(matrix).multiply(matrixInverse);
  }
  initMyTool() {
    const myTool = this.components.tools.get(MyToolComponent);
    const Worker = this.components.tools.get(WorkerComponent);


    const toolbars = new OBC.Toolbar(this.components);
    const button = new OBC.Button(this.components);
    button.materialIcon = "add";
    button.tooltip = "My Tool";
    button.onClick.add(myTool.action);
    toolbars.addChild(button);
    this.components.ui.addToolbar(toolbars);
  }
  async dispose() {
    this.components.dispose();
    await this.onDisposed.trigger(this);
    this.onDisposed.reset();
  }
}