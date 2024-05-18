import type Entity from "./Entity";

export default abstract class Component<ParentType extends Entity = Entity> {
  name: string = "Unknown Component";

  parent: ParentType | null;

  constructor() {
    this.parent = null;
  }

  Initialize() {}

  SetParent(parent: ParentType) {
    this.parent = parent;
  }

  GetComponent<T extends Component>(name: string): T {
    const result = this.parent?.GetComponent<T>(name);
    if (!result) {
      throw new Error("The Component not found.");
    }

    return result;
  }

  FindEntity<T extends Entity>(name: string): T {
    const result = this.parent?.FindEntity<T>(name);
    if (!result) {
      throw new Error("The Entity not found.");
    }

    return result;
  }

  Broadcast(msg: any) {
    this.parent?.Broadcast(msg);
  }

  Update(_t: number) {}

  PhysicsUpdate(..._arg: any[]) {}
}
