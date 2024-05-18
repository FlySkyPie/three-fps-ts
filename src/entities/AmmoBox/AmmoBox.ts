import type Ammo from "ammo.js";

import type Entity from "../../Entity";
import Component from "../../Component";
import { AmmoInstance, AmmoHelper, CollisionFilterGroups } from "../../AmmoLib";

import type PlayerPhysics from "../Player/PlayerPhysics";

export default class AmmoBox extends Component {
  name: string;

  model: any;

  shape: any;

  scene: THREE.Scene;

  world: Ammo.btDiscreteDynamicsWorld;

  quat: Ammo.btQuaternion;

  update: boolean;

  player?: Entity;

  playerPhysics?: PlayerPhysics;

  trigger?: Ammo.btPairCachingGhostObject;

  constructor(
    scene: THREE.Scene,
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

  Update(t: any) {
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
      AmmoHelper.IsTriggerOverlapping(this.trigger, this.playerPhysics!.body)
    ) {
      this.player?.Broadcast({ topic: "AmmoPickup" });
      this.Disable();
    }
  }
}
