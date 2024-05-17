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

  GetComponent<T = any>(name: string): T {
    return this.parent?.GetComponent(name);
  }

  FindEntity<T = any>(name: string): T {
    return this.parent?.FindEntity(name);
  }

  Broadcast(msg: any) {
    this.parent?.Broadcast(msg);
  }

  Update(..._arg: any[]) {}

  PhysicsUpdate(..._arg: any[]) {}
}
