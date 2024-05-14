import { FiniteStateMachine, State } from "../../FiniteStateMachine";
import * as THREE from "three";

export default class CharacterFSM extends FiniteStateMachine {
  proxy: any;

  constructor(proxy: any) {
    super();
    this.proxy = proxy;
    this.Init();
  }

  Init() {
    this.AddState("idle", new IdleState(this));
    this.AddState("patrol", new PatrolState(this));
    this.AddState("chase", new ChaseState(this));
    this.AddState("attack", new AttackState(this));
    this.AddState("dead", new DeadState(this));
  }
}

class IdleState extends State {
  maxWaitTime: any;

  minWaitTime: any;

  waitTime: any;

  constructor(parent: any) {
    super(parent);
    this.maxWaitTime = 5.0;
    this.minWaitTime = 1.0;
    this.waitTime = 0.0;
  }

  get Name() {
    return "idle";
  }
  get Animation() {
    return this.parent.proxy.animations["idle"];
  }

  //@ts-ignore
  Enter(prevState: any) {
    this.parent.proxy.canMove = false;
    const action = this.Animation.action;

    if (prevState) {
      action.time = 0.0;
      action.enabled = true;
      action.crossFadeFrom(prevState.Animation.action, 0.5, true);
    }

    action.play();

    this.waitTime =
      Math.random() * (this.maxWaitTime - this.minWaitTime) + this.minWaitTime;
  }

  //@ts-ignore
  Update(t: any) {
    if (this.waitTime <= 0.0) {
      this.parent.SetState("patrol");
      return;
    }

    this.waitTime -= t;

    if (this.parent.proxy.CanSeeThePlayer()) {
      this.parent.SetState("chase");
    }
  }
}

class PatrolState extends State {
  constructor(parent: any) {
    super(parent);
  }

  get Name() {
    return "patrol";
  }
  get Animation() {
    return this.parent.proxy.animations["walk"];
  }

  PatrolEnd = () => {
    this.parent.SetState("idle");
  };

  //@ts-ignore
  Enter(prevState: any) {
    this.parent.proxy.canMove = true;
    const action = this.Animation.action;

    if (prevState) {
      action.time = 0.0;
      action.enabled = true;
      action.crossFadeFrom(prevState.Animation.action, 0.5, true);
    }

    action.play();

    this.parent.proxy.NavigateToRandomPoint();
  }

  //@ts-ignore
  Update(t: any) {
    if (this.parent.proxy.CanSeeThePlayer()) {
      this.parent.SetState("chase");
    } else if (this.parent.proxy.path && this.parent.proxy.path.length == 0) {
      this.parent.SetState("idle");
    }
  }
}

class ChaseState extends State {
  updateFrequency: any;

  updateTimer: any;

  attackDistance: any;

  shouldRotate: any;

  switchDelay: any;

  constructor(parent: any) {
    super(parent);
    this.updateFrequency = 0.5;
    this.updateTimer = 0.0;
    this.attackDistance = 2.0;
    this.shouldRotate = false;
    this.switchDelay = 0.2;
  }

  get Name() {
    return "chase";
  }
  get Animation() {
    return this.parent.proxy.animations["run"];
  }

  RunToPlayer(prevState: any) {
    this.parent.proxy.canMove = true;
    const action = this.Animation.action;
    this.updateTimer = 0.0;

    if (prevState) {
      action.time = 0.0;
      action.enabled = true;
      action.setEffectiveTimeScale(1.0);
      action.setEffectiveWeight(1.0);
      action.crossFadeFrom(prevState.Animation.action, 0.2, true);
    }

    action.timeScale = 1.5;
    action.play();
  }

  //@ts-ignore
  Enter(prevState: any) {
    this.RunToPlayer(prevState);
  }

  //@ts-ignore
  Update(t: any) {
    if (this.updateTimer <= 0.0) {
      this.parent.proxy.NavigateToPlayer();
      this.updateTimer = this.updateFrequency;
    }

    if (this.parent.proxy.IsCloseToPlayer) {
      if (this.switchDelay <= 0.0) {
        this.parent.SetState("attack");
      }

      this.parent.proxy.ClearPath();
      this.switchDelay -= t;
    } else {
      this.switchDelay = 0.1;
    }

    this.updateTimer -= t;
  }
}

class AttackState extends State {
  attackTime: any;

  canHit: any;

  attackEvent:any;

  constructor(parent: any) {
    super(parent);
    this.attackTime = 0.0;
    this.canHit = true;
  }

  get Name() {
    return "attack";
  }
  get Animation() {
    return this.parent.proxy.animations["attack"];
  }

  //@ts-ignore
  Enter(prevState: any) {
    this.parent.proxy.canMove = false;
    const action = this.Animation.action;
    this.attackTime = this.Animation.clip.duration;
    this.attackEvent = this.attackTime * 0.85;

    if (prevState) {
      action.time = 0.0;
      action.enabled = true;
      action.crossFadeFrom(prevState.Animation.action, 0.1, true);
    }

    action.play();
  }

  //@ts-ignore
  Update(t: any) {
    this.parent.proxy.FacePlayer(t);

    if (!this.parent.proxy.IsCloseToPlayer && this.attackTime <= 0.0) {
      this.parent.SetState("chase");
      return;
    }

    if (
      this.canHit &&
      this.attackTime <= this.attackEvent &&
      this.parent.proxy.IsPlayerInHitbox
    ) {
      this.parent.proxy.HitPlayer();
      this.canHit = false;
    }

    if (this.attackTime <= 0.0) {
      this.attackTime = this.Animation.clip.duration;
      this.canHit = true;
    }

    this.attackTime -= t;
  }
}

class DeadState extends State {
  constructor(parent: any) {
    super(parent);
  }

  get Name() {
    return "dead";
  }
  get Animation() {
    return this.parent.proxy.animations["die"];
  }

  //@ts-ignore
  Enter(prevState: any) {
    const action = this.Animation.action;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;

    if (prevState) {
      action.time = 0.0;
      action.enabled = true;
      action.crossFadeFrom(prevState.Animation.action, 0.1, true);
    }

    action.play();
  }

  //@ts-ignore
  Update(t: any) {}
}
