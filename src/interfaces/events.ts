import type { Vector3 } from "three";

import type CharacterController from "../entities/NPC/CharacterController";
import type Entity from "../Entity";

export interface IAmmoPickupEvent {
  topic: "AmmoPickup";
}

export interface IShootEvent {
  topic: "ak47_shot";
}

export interface INavEndEvent {
  topic: "nav.end";
  agent: CharacterController;
}

export interface IBulletHitEvent {
  topic: "hit";
  from: Entity | null;
  amount: number;

  hitResult: {
    intersectionPoint: Vector3;
    intersectionNormal: Vector3;

    collisionObject?: unknown;
  };
}

export type IEvent =
  | IShootEvent
  | INavEndEvent
  | IAmmoPickupEvent
  | IBulletHitEvent;
