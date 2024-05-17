import { Vector3, Quaternion } from "three";

import type Component from "./Component";

export default class Entity {
  id: number = NaN;

  private name: number | string | null;

  public components: Record<string, any>;

  public position: Vector3;

  public rotation: Quaternion;

  private parent: any;

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

  public SetParent(parent: any) {
    this.parent = parent;
  }

  public SetName(name: number | string) {
    this.name = name;
  }

  public get Name() {
    return this.name;
  }

  GetComponent(name: string) {
    return this.components[name];
  }

  public SetPosition(position: Vector3) {
    this.position.copy(position);
  }

  get Position() {
    return this.position;
  }

  public SetRotation(rotation: Quaternion) {
    this.rotation.copy(rotation);
  }

  get Rotation() {
    return this.rotation;
  }

  FindEntity(name: any) {
    return this.parent.Get(name);
  }

  RegisterEventHandler(handler: any, topic: any) {
    if (!this.eventHandlers.hasOwnProperty(topic)) {
      this.eventHandlers[topic] = [];
    }

    this.eventHandlers[topic].push(handler);
  }

  Broadcast(msg: any) {
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
