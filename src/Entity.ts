import { Vector3, Quaternion } from "three";

import type Component from "./Component";
import type EntityManager from "./EntityManager";

export default class Entity {
  id: number = NaN;

  private name: number | string | null;

  public components: Record<string, Component>;

  public position: Vector3;

  public rotation: Quaternion;

  private parent: EntityManager | null;

  eventHandlers: Record<string, any[]>;

  constructor() {
    this.name = null;
    this.components = {};
    this.position = new Vector3();
    this.rotation = new Quaternion();
    this.parent = null;
    this.eventHandlers = {};
  }

  public AddComponent(component: Component) {
    component.SetParent(this);
    this.components[component.name] = component;
  }

  public SetParent(parent: EntityManager) {
    this.parent = parent;
  }

  public SetName(name: number | string) {
    this.name = name;
  }

  public get Name() {
    return this.name;
  }

  public GetComponent<T extends Component>(name: string): T {
    return this.components[name] as any;
  }

  public SetPosition(position: Vector3) {
    this.position.copy(position);
  }

  public get Position() {
    return this.position;
  }

  public SetRotation(rotation: Quaternion) {
    this.rotation.copy(rotation);
  }

  public get Rotation() {
    return this.rotation;
  }

  public FindEntity<T extends Entity>(name: string): T {
    const result = this.parent?.Get(name);
    if (!result) {
      throw new Error("The Entity not found.");
    }

    return result as any;
  }

  public RegisterEventHandler(handler: (...e: any) => void, topic: string) {
    if (!this.eventHandlers.hasOwnProperty(topic)) {
      this.eventHandlers[topic] = [];
    }

    this.eventHandlers[topic].push(handler);
  }

  public Broadcast(msg: any) {
    if (!this.eventHandlers.hasOwnProperty(msg.topic)) {
      return;
    }

    for (const handler of this.eventHandlers[msg.topic]) {
      handler(msg);
    }
  }

  public PhysicsUpdate(world: any, timeStep: any) {
    for (let k in this.components) {
      this.components[k].PhysicsUpdate(world, timeStep);
    }
  }

  public Update(timeElapsed: number) {
    for (let k in this.components) {
      this.components[k].Update(timeElapsed);
    }
  }
}
