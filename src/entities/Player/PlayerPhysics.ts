import type Ammo from "ammojs-typed";

import Component from "../../Component";
import { AmmoInstance } from "../../AmmoLib";

//Bullet enums
// const CF_KINEMATIC_OBJECT = 2;
const DISABLE_DEACTIVATION = 4;

export default class PlayerPhysics extends Component {
  world: Ammo.btDiscreteDynamicsWorld;

  body: Ammo.btRigidBody | null = null;

  name: string;

  canJump: boolean;

  up: Ammo.btVector3;

  tempVec: Ammo.btVector3;

  constructor(world: Ammo.btDiscreteDynamicsWorld) {
    super();
    this.world = world;
    this.body = null;
    this.name = "PlayerPhysics";
    this.canJump = false;
    this.up = new AmmoInstance.btVector3(0, 1, 0);
    this.tempVec = new AmmoInstance.btVector3();
  }

  Initialize() {
    const height = 1.3,
      radius = 0.3,
      mass = 5;

    const transform = new AmmoInstance.btTransform();
    transform.setIdentity();
    const pos = this.parent!.Position;
    transform.setOrigin(new AmmoInstance.btVector3(pos.x, pos.y, pos.z));
    const motionState = new AmmoInstance.btDefaultMotionState(transform);

    const shape = new AmmoInstance.btCapsuleShape(radius, height);
    const localInertia = new AmmoInstance.btVector3(0, 0, 0);
    const bodyInfo = new AmmoInstance.btRigidBodyConstructionInfo(
      mass,
      motionState,
      shape,
      localInertia
    );
    this.body = new AmmoInstance.btRigidBody(bodyInfo);
    this.body.setFriction(0);

    //this.body.setCollisionFlags(this.body.getCollisionFlags() | CF_KINEMATIC_OBJECT);
    this.body.setActivationState(DISABLE_DEACTIVATION);

    this.world.addRigidBody(this.body);
  }

  QueryJump() {
    const dispatcher = this.world.getDispatcher();
    const numManifolds = dispatcher.getNumManifolds();

    for (let i = 0; i < numManifolds; i++) {
      const contactManifold = dispatcher.getManifoldByIndexInternal(i);
      const rb0 = AmmoInstance.castObject(
        contactManifold.getBody0(),
        AmmoInstance.btRigidBody
      );
      const rb1 = AmmoInstance.castObject(
        contactManifold.getBody1(),
        AmmoInstance.btRigidBody
      );

      if (rb0 != this.body && rb1 != this.body) {
        continue;
      }

      const numContacts = contactManifold.getNumContacts();

      for (let j = 0; j < numContacts; j++) {
        const contactPoint = contactManifold.getContactPoint(j);

        const normal = contactPoint.get_m_normalWorldOnB();
        this.tempVec.setValue(normal.x(), normal.y(), normal.z());

        if (rb1 == this.body) {
          this.tempVec.setValue(
            -this.tempVec.x(),
            -this.tempVec.y(),
            -this.tempVec.z()
          );
        }

        const angle = this.tempVec.dot(this.up);
        this.canJump = angle > 0.5;

        if (this.canJump) {
          return;
        }
      }
    }
  }

  PhysicsUpdate() {
    this.QueryJump();
  }
}
