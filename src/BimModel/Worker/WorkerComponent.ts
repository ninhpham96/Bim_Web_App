/* eslint-disable @typescript-eslint/no-unused-vars */
import * as OBC from 'openbim-components'
import { generateUUID } from 'three/src/math/MathUtils.js';

export class WorkerComponent extends OBC.Component<unknown> implements OBC.Disposable {
  enabled!: false;
  readonly onDisposed: OBC.Event<unknown> = new OBC.Event();
  private worker = new Worker(new URL("./worker.js", import.meta.url));
  static readonly uuid = generateUUID();
  get(..._args: unknown[]) {
    throw new Error("Method not implemented.");
  }

  constructor(components: OBC.Components) {
    super(components);
    this.components.tools.add(WorkerComponent.uuid, this);
    this.init();
  }
  async dispose() {
    this.worker.terminate();
    await this.onDisposed.trigger(this);
    this.onDisposed.reset();
  }
  private init() {
    this.worker.postMessage({ a: 100 })
  }
}
export default WorkerComponent

OBC.ToolComponent.libraryUUIDs.add(WorkerComponent.uuid);