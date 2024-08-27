import * as THREE from 'three';
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { CreateComment } from './Comment';

export class Label2D {
  constructor(private _scene: THREE.Scene) {
    this.init();
  }
  init() {
    const div = CreateComment(this);
    div.addEventListener('pointerdown', this.onClick);
    const label = new CSS2DObject(div);
    this._scene.add(label);
  }
  private onClick = () => {
    if (this.onClickChange) {
      this.onClickChange();
    }
  }
  onClickChange!: () => void;
} 