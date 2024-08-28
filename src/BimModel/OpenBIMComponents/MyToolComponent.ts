import * as OBC from 'openbim-components'
import { generateUUID } from 'three/src/math/MathUtils.js';

export class MyToolComponent extends OBC.Component<unknown> implements OBC.Disposable, OBC.Updateable {
  enabled!: true;
  static readonly uuid = generateUUID();
  readonly onDisposed: OBC.Event<unknown> = new OBC.Event();
  onAfterUpdate: OBC.Event<unknown> = new OBC.Event();
  onBeforeUpdate: OBC.Event<unknown> = new OBC.Event();

  constructor(components: OBC.Components) {
    super(components);
    this.components.tools.add(MyToolComponent.uuid, this);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(delta?: number) {
    if (this.enabled) {
      await this.onBeforeUpdate.trigger(this);
      await this.onAfterUpdate.trigger(this);
    }
  }

  async dispose() {
    await this.onDisposed.trigger(this);
    this.onDisposed.reset();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(..._args: unknown[]) {
    throw new Error("Method not implemented.");
  }
}
OBC.ToolComponent.libraryUUIDs.add(MyToolComponent.uuid);