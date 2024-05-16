export default abstract class Component {
  name: any;

  parent: any;

  constructor() {
    this.parent = null;
  }

  Initialize() {}

  SetParent(parent: any) {
    this.parent = parent;
  }

  GetComponent(name: any) {
    return this.parent.GetComponent(name);
  }

  FindEntity(name: any) {
    return this.parent.FindEntity(name);
  }

  Broadcast(msg: any) {
    this.parent.Broadcast(msg);
  }

  Update(_: any) {}

  PhysicsUpdate(_: any) {}
}
