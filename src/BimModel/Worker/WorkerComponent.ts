/* eslint-disable @typescript-eslint/no-unused-vars */
import * as OBC from 'openbim-components'
import { generateUUID } from 'three/src/math/MathUtils.js';

export class WorkerComponent extends OBC.Component<unknown> implements OBC.Disposable {
  enabled!: false;
  readonly onDisposed: OBC.Event<unknown> = new OBC.Event();
  private revitWorker = new Worker(new URL("./RevitWorker.js", import.meta.url));
  static readonly uuid = generateUUID();
  get(..._args: unknown[]) {
    throw new Error("Method not implemented.");
  }

  constructor(components: OBC.Components) {
    super(components);
    this.components.tools.add(WorkerComponent.uuid, this);
    this.onMessage();
  }
  async dispose() {
    this.revitWorker.terminate();
    await this.onDisposed.trigger(this);
    this.onDisposed.reset();
  }
  private onMessage() {
    this.revitWorker.onmessage = (event: MessageEvent) => {
      const { error, result } = event.data;
      if (error) {
        console.error(error);
        return;
      } else {
        console.log(result);
      }
    }
  }
  loadFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gz';
    input.multiple = false;
    input.click();
    input.onchange = async () => {
      const file = input.files?.item(0);
      if (file) {
        console.log(file);
        const rawBuffer = await file.arrayBuffer();
        this.revitWorker.postMessage({ action: 'onLoad', payload: new Uint8Array(rawBuffer) });
      }
    };
    input.remove();
  }
}
export default WorkerComponent

OBC.ToolComponent.libraryUUIDs.add(WorkerComponent.uuid);