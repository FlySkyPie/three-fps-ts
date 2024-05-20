import type { Scene } from "three";
import Ammo from "ammojs-typed";

import type Entity from "../../Entity";
import Component from "../../Component";
import { AmmoInstance, AmmoHelper, CollisionFilterGroups } from "../../AmmoLib";

import type PlayerPhysics from "../Player/PlayerPhysics";

export default class AmmoBox extends Component {
  public name: string;

  private model: any;

  private shape: any;

  private scene: Scene;

  private world: Ammo.btDiscreteDynamicsWorld;

  private quat: Ammo.btQuaternion;

  private update: boolean;

  private player?: Entity;

  private playerPhysics?: PlayerPhysics;

  private trigger?: Ammo.btPairCachingGhostObject;

  constructor(
    scene: Scene,
    model: any,
    shape: any,
    physicsWorld: Ammo.btDiscreteDynamicsWorld
  ) {
    super();
    this.name = "AmmoBox";
    this.model = model;
    this.shape = shape;
    this.scene = scene;
    this.world = physicsWorld;

    //@ts-ignore
    this.quat = new AmmoInstance.btQuaternion();
    this.update = true;
  }

  Initialize() {
    this.player = this.FindEntity("Player");
    this.playerPhysics =
      this.player.GetComponent<PlayerPhysics>("PlayerPhysics");

    this.trigger = AmmoHelper.CreateTrigger(this.shape);

    this.world.addCollisionObject(
      this.trigger,
      CollisionFilterGroups.SensorTrigger
    );
    this.scene.add(this.model);
  }

  Disable() {
    this.update = false;
    this.scene.remove(this.model);
    this.world.removeCollisionObject(this.trigger!);
  }

  Update() {
    if (!this.update) {
      return;
    }

    const entityPos = this.parent!.position;
    const entityRot = this.parent!.rotation;

    this.model.position.copy(entityPos);
    this.model.quaternion.copy(entityRot);

    const transform = this.trigger!.getWorldTransform();

    this.quat.setValue(entityRot.x, entityRot.y, entityRot.z, entityRot.w);
    transform.setRotation(this.quat);
    transform.getOrigin().setValue(entityPos.x, entityPos.y, entityPos.z);

    if (
      AmmoHelper.IsTriggerOverlapping(this.trigger!, this.playerPhysics!.body!)
    ) {
      this.player?.Broadcast({ topic: "AmmoPickup" });
      this.Disable();
    }
  }
}
