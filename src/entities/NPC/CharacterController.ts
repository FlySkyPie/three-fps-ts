import Ammo from "ammojs-typed";
import * as THREE from "three";

import type Entity from "../../Entity";
import Component from "../../Component";
import { AmmoInstance, AmmoHelper, CollisionFilterGroups } from "../../AmmoLib";
import DebugShapes from "../../DebugShapes";

import type Navmesh from "../Level/Navmesh";
import type PlayerPhysics from "../Player/PlayerPhysics";

import type AttackTrigger from "./AttackTrigger";
import CharacterFSM from "./CharacterFSM";

export default class CharacterController extends Component {
  name: string;

  physicsWorld: Ammo.btDiscreteDynamicsWorld;

  scene: THREE.Scene;

  mixer: THREE.AnimationMixer | null = null;

  clips: Record<string, any>;

  animations: Record<string, { clip: any; action: any }>;

  model: any;

  dir: THREE.Vector3;

  forwardVec: THREE.Vector3;

  pathDebug: DebugShapes;

  path: any[];

  tempRot: THREE.Quaternion;

  viewAngle: number;

  maxViewDistance: number;

  tempVec: THREE.Vector3;

  attackDistance: number;

  canMove: boolean;

  health: number;

  stateMachine?: CharacterFSM;

  navmesh?: Navmesh;

  hitbox?: AttackTrigger;

  player?: Entity;

  skinnedmesh: any;

  rootBone: any;

  lastPos: any;

  constructor(
    model: THREE.Object3D,
    clips: Record<string, any>,
    scene: THREE.Scene,
    physicsWorld: Ammo.btDiscreteDynamicsWorld
  ) {
    super();
    this.name = "CharacterController";
    this.physicsWorld = physicsWorld;
    this.scene = scene;
    this.mixer = null;
    this.clips = clips;
    this.animations = {};
    this.model = model;
    this.dir = new THREE.Vector3();
    this.forwardVec = new THREE.Vector3(0, 0, 1);
    this.pathDebug = new DebugShapes(scene);
    this.path = [];
    this.tempRot = new THREE.Quaternion();

    this.viewAngle = Math.cos(Math.PI / 4.0);
    this.maxViewDistance = 20.0 * 20.0;
    this.tempVec = new THREE.Vector3();
    this.attackDistance = 2.2;

    this.canMove = true;
    this.health = 100;
  }

  private SetAnim(name: string, clip: any) {
    const action = this.mixer?.clipAction(clip);
    this.animations[name] = { clip, action };
  }

  private SetupAnimations() {
    Object.keys(this.clips).forEach((key) => {
      this.SetAnim(key, this.clips[key]);
    });
  }

  Initialize() {
    this.stateMachine = new CharacterFSM(this);
    this.navmesh = this.FindEntity("Level").GetComponent<Navmesh>("Navmesh");
    this.hitbox = this.GetComponent<AttackTrigger>("AttackTrigger");
    this.player = this.FindEntity<Entity>("Player");

    this.parent?.RegisterEventHandler(this.TakeHit, "hit");

    const scene = this.model;

    scene.scale.setScalar(0.01);
    scene.position.copy(this.parent?.position);

    this.mixer = new THREE.AnimationMixer(scene);

    scene.traverse((child: any) => {
      if (!child.isSkinnedMesh) {
        return;
      }

      child.frustumCulled = false;
      child.castShadow = true;
      child.receiveShadow = true;
      this.skinnedmesh = child;
      this.rootBone = child.skeleton.bones.find(
        (bone: any) => bone.name == "MutantHips"
      );
      this.rootBone.refPos = this.rootBone.position.clone();
      this.lastPos = this.rootBone.position.clone();
    });

    this.SetupAnimations();

    this.scene.add(scene);
    this.stateMachine.SetState("idle");
  }

  private UpdateDirection() {
    this.dir.copy(this.forwardVec);
    this.dir.applyQuaternion(this.parent!.rotation);
  }

  CanSeeThePlayer() {
    const playerPos = this.player!.Position.clone();
    const modelPos = this.model.position.clone();
    modelPos.y += 1.35;
    const charToPlayer = playerPos.sub(modelPos);

    if (playerPos.lengthSq() > this.maxViewDistance) {
      return;
    }

    charToPlayer.normalize();
    const angle = charToPlayer.dot(this.dir);

    if (angle < this.viewAngle) {
      return false;
    }

    const rayInfo: any = {};
    const collisionMask =
      CollisionFilterGroups.AllFilter & ~CollisionFilterGroups.SensorTrigger;

    if (
      AmmoHelper.CastRay(
        this.physicsWorld,
        modelPos,
        this.player!.Position,
        rayInfo,
        collisionMask
      )
    ) {
      // @ts-ignore The method exist, but not in type declaration.
      const body: Ammo.btRigidBody = AmmoInstance.castObject(
        rayInfo.collisionObject,
        AmmoInstance.btRigidBody
      );

      if (
        body == this.player!.GetComponent<PlayerPhysics>("PlayerPhysics").body
      ) {
        return true;
      }
    }

    return false;
  }

  NavigateToRandomPoint() {
    const node = this.navmesh!.GetRandomNode(this.model.position, 50);
    this.path = this.navmesh!.FindPath(this.model.position, node);
  }

  NavigateToPlayer() {
    this.tempVec.copy(this.player!.Position);
    this.tempVec.y = 0.5;
    this.path = this.navmesh!.FindPath(this.model.position, this.tempVec);

    /*
        if(this.path){
            this.pathDebug.Clear();
            for(const point of this.path){
                this.pathDebug.AddPoint(point, "blue");
            }
        }
        */
  }

  FacePlayer(t: any, rate = 3.0) {
    this.tempVec.copy(this.player!.Position).sub(this.model.position);
    this.tempVec.y = 0.0;
    this.tempVec.normalize();

    this.tempRot.setFromUnitVectors(this.forwardVec, this.tempVec);
    this.model.quaternion.rotateTowards(this.tempRot, rate * t);
  }

  get IsCloseToPlayer() {
    this.tempVec.copy(this.player!.Position).sub(this.model.position);

    if (this.tempVec.lengthSq() <= this.attackDistance * this.attackDistance) {
      return true;
    }

    return false;
  }

  get IsPlayerInHitbox() {
    return this.hitbox!.overlapping;
  }

  HitPlayer() {
    this.player?.Broadcast({ topic: "hit" });
  }

  private TakeHit = (msg: any) => {
    this.health = Math.max(0, this.health - msg.amount);

    if (this.health == 0) {
      this.stateMachine?.SetState("dead");
    } else {
      const stateName = this.stateMachine?.currentState?.Name;
      if (stateName == "idle" || stateName == "patrol") {
        this.stateMachine?.SetState("chase");
      }
    }
  };

  private MoveAlongPath(t: any) {
    if (!this.path?.length) return;

    const target = this.path[0].clone().sub(this.model.position);
    target.y = 0.0;

    if (target.lengthSq() > 0.1 * 0.1) {
      target.normalize();
      this.tempRot.setFromUnitVectors(this.forwardVec, target);
      this.model.quaternion.slerp(this.tempRot, 4.0 * t);
    } else {
      // Remove node from the path we calculated
      this.path.shift();

      if (this.path.length === 0) {
        this.Broadcast({ topic: "nav.end", agent: this });
      }
    }
  }

  ClearPath() {
    if (this.path) {
      this.path.length = 0;
    }
  }

  private ApplyRootMotion() {
    if (this.canMove) {
      const vel = this.rootBone.position.clone();
      vel.sub(this.lastPos).multiplyScalar(0.01);
      vel.y = 0;

      vel.applyQuaternion(this.model.quaternion);

      if (vel.lengthSq() < 0.1 * 0.1) {
        this.model.position.add(vel);
      }
    }

    //Reset the root bone horizontal position
    this.lastPos.copy(this.rootBone.position);
    this.rootBone.position.z = this.rootBone.refPos.z;
    this.rootBone.position.x = this.rootBone.refPos.x;
  }

  public Update(t: number) {
    this.mixer && this.mixer.update(t);
    this.ApplyRootMotion();

    this.UpdateDirection();
    this.MoveAlongPath(t);
    this.stateMachine?.Update(t);

    this.parent?.SetRotation(this.model.quaternion);
    this.parent?.SetPosition(this.model.position);
  }
}
