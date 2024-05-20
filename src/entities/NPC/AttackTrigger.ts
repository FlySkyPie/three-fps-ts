import Ammo from "ammojs-typed";

import Component from "../../Component";
import { AmmoInstance, AmmoHelper, CollisionFilterGroups } from "../../AmmoLib";

import type PlayerPhysics from "../Player/PlayerPhysics";

export default class AttackTrigger extends Component {
  name: string;

  physicsWorld: Ammo.btDiscreteDynamicsWorld;

  localTransform: Ammo.btTransform;

  quat: Ammo.btQuaternion;

  overlapping: boolean;

  ghostObj?: Ammo.btPairCachingGhostObject;

  playerPhysics?: PlayerPhysics;

  constructor(physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    this.name = "AttackTrigger";
    this.physicsWorld = physicsWorld;

    //Relative to parent
    this.localTransform = new AmmoInstance.btTransform();
    this.localTransform.setIdentity();
    this.localTransform.getOrigin().setValue(0.0, 1.0, 1.0);

    //@ts-ignore
    this.quat = new AmmoInstance.btQuaternion();

    this.overlapping = false;
  }

  private SetupTrigger() {
    const shape = new AmmoInstance.btSphereShape(0.4);
    this.ghostObj = AmmoHelper.CreateTrigger(shape);

    this.physicsWorld.addCollisionObject(
      this.ghostObj,
      CollisionFilterGroups.SensorTrigger
    );
  }

  public Initialize() {
    this.playerPhysics =
      this.FindEntity("Player").GetComponent<PlayerPhysics>("PlayerPhysics");
    this.SetupTrigger();
  }

  public PhysicsUpdate() {
    this.overlapping = AmmoHelper.IsTriggerOverlapping(
      this.ghostObj!,
      this.playerPhysics!.body!
    );
  }

  public Update() {
    const entityPos = this.parent!.position;
    const entityRot = this.parent!.rotation;
    const transform = this.ghostObj!.getWorldTransform();

    this.quat.setValue(entityRot.x, entityRot.y, entityRot.z, entityRot.w);
    transform.setRotation(this.quat);
    transform.getOrigin().setValue(entityPos.x, entityPos.y, entityPos.z);
    transform.op_mul(this.localTransform);
  }
}
