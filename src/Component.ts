import type Entity from "./Entity";

export default abstract class Component {
  name: any;

  parent: Entity | null;

  constructor() {
    this.parent = null;
  }

  Initialize() {}

  SetParent(parent: Entity) {
    this.parent = parent;
  }

  GetComponent(name: string) {
    return this.parent?.GetComponent(name);
  }

  FindEntity(name: any) {
    return this.parent?.FindEntity(name);
  }

  Broadcast(msg: any) {
    this.parent?.Broadcast(msg);
  }

  Update(_: any) {}

  PhysicsUpdate(_: any) {}
}
