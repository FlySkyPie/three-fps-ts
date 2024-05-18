/**
 * entry.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene, Physics and Entities. It also starts the render loop and
 * handles window resizes.
 *
 */
import type Ammo from "ammojs-typed";
import "ammojs-typed";
import * as THREE from "three";
import Stats from "stats.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

import { AmmoHelper, AmmoInstance, createConvexHullShape } from "./AmmoLib";
import EntityManager from "./EntityManager";
import Entity from "./Entity";
import Sky from "./entities/Sky/Sky2";
import LevelSetup from "./entities/Level/LevelSetup";
import PlayerControls from "./entities/Player/PlayerControls";
import PlayerPhysics from "./entities/Player/PlayerPhysics";

import NpcCharacterController from "./entities/NPC/CharacterController";
import Input from "./Input";

import level from "./assets/level.glb?url";
import navmesh from "./assets/navmesh.obj?url";

import mutant from "./assets/animations/mutant.fbx?url";
import idleAnim from "./assets/animations/mutant breathing idle.fbx?url";
import attackAnim from "./assets/animations/mutant punch.fbx?url";
import walkAnim from "./assets/animations/mutant walking.fbx?url";
import runAnim from "./assets/animations/mutant run.fbx?url";
import dieAnim from "./assets/animations/mutant dying.fbx?url";

//AK47 Model and textures
import ak47 from "./assets/guns/ak47/ak47.glb?url";
import muzzleFlash from "./assets/muzzle_flash.glb?url";
//Shot sound
import ak47Shot from "./assets/sounds/ak47_shot.wav?url";

//Ammo box
import ammobox from "./assets/ammo/AmmoBox.fbx?url";
import ammoboxTexD from "./assets/ammo/AmmoBox_D.tga.png?url";
import ammoboxTexN from "./assets/ammo/AmmoBox_N.tga.png?url";
import ammoboxTexM from "./assets/ammo/AmmoBox_M.tga.png?url";
import ammoboxTexR from "./assets/ammo/AmmoBox_R.tga.png?url";
import ammoboxTexAO from "./assets/ammo/AmmoBox_AO.tga.png?url";

//Bullet Decal
import decalColor from "./assets/decals/decal_c.jpg?url";
import decalNormal from "./assets/decals/decal_n.jpg?url";
import decalAlpha from "./assets/decals/decal_a.jpg?url";

//Sky
import skyTex from "./assets/sky.jpg?url";

import Navmesh from "./entities/Level/Navmesh";
import AttackTrigger from "./entities/NPC/AttackTrigger";
import DirectionDebug from "./entities/NPC/DirectionDebug";
import CharacterCollision from "./entities/NPC/CharacterCollision";
import Weapon from "./entities/Player/Weapon";
import UIManager from "./entities/UI/UIManager";
import AmmoBox from "./entities/AmmoBox/AmmoBox";
import LevelBulletDecals from "./entities/Level/BulletDecals";
import PlayerHealth from "./entities/Player/PlayerHealth";

class FPSGameApp {
  lastFrameTime: number | null;

  assets: Record<string, any>;

  animFrameId: number;

  scene?: THREE.Scene;

  renderer?: THREE.WebGLRenderer;

  stats?: Stats;

  camera?: THREE.PerspectiveCamera;

  listener?: THREE.AudioListener;

  physicsWorld?: Ammo.btDiscreteDynamicsWorld;

  mutantAnims: Record<any, any> = {};

  entityManager?: EntityManager;

  constructor() {
    this.lastFrameTime = null;
    this.assets = {};
    this.animFrameId = 0;

    AmmoHelper.Init(() => {
      this.Init();
    });
  }

  private Init() {
    this.LoadAssets();
    this.SetupGraphics();
    this.SetupStartButton();
  }

  private SetupGraphics() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera = new THREE.PerspectiveCamera();
    this.camera.near = 0.01;

    // create an AudioListener and add it to the camera
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);

    // renderer
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.WindowResizeHanlder();
    window.addEventListener("resize", this.WindowResizeHanlder);

    document.body.appendChild(this.renderer.domElement);

    // Stats.js
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  private SetupPhysics() {
    // Physics configuration
    const collisionConfiguration =
      new AmmoInstance.btDefaultCollisionConfiguration();
    const dispatcher = new AmmoInstance.btCollisionDispatcher(
      collisionConfiguration
    );
    const broadphase = new AmmoInstance.btDbvtBroadphase();
    const solver = new AmmoInstance.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new AmmoInstance.btDiscreteDynamicsWorld(
      dispatcher,
      broadphase,
      solver,
      collisionConfiguration
    );
    this.physicsWorld.setGravity(new AmmoInstance.btVector3(0.0, -9.81, 0.0));
    const fp = AmmoInstance.addFunction(this.PhysicsUpdate);
    this.physicsWorld.setInternalTickCallback(fp);
    this.physicsWorld
      .getBroadphase()
      .getOverlappingPairCache()
      .setInternalGhostPairCallback(new AmmoInstance.btGhostPairCallback());

    //Physics debug drawer
    //this.debugDrawer = new DebugDrawer(this.scene, this.physicsWorld);
    //this.debugDrawer.enable();
  }

  private SetAnim(name: string, obj: any) {
    const clip = obj.animations[0];
    this.mutantAnims[name] = clip;
  }

  private PromiseProgress(proms: any, progress_cb: any) {
    let d = 0;
    progress_cb(0);
    for (const p of proms) {
      p.then(() => {
        d++;
        progress_cb((d / proms.length) * 100);
      });
    }
    return Promise.all(proms);
  }

  private async AddAsset(asset: string, loader: THREE.Loader, name: string) {
    const result = await loader.loadAsync(asset);
    this.assets[name] = result;
  }

  private OnProgress(p: number) {
    const progressbar = document.getElementById("progress")!;
    progressbar.style.width = `${p}%`;
  }

  private HideProgress() {
    this.OnProgress(0);
  }

  private SetupStartButton() {
    document
      .getElementById("start_game")!
      .addEventListener("click", this.StartGame);
  }

  private ShowMenu(visible = true) {
    document.getElementById("menu")!.style.visibility = visible
      ? "visible"
      : "hidden";
  }

  private async LoadAssets() {
    const gltfLoader = new GLTFLoader();
    const fbxLoader = new FBXLoader();
    const objLoader = new OBJLoader();
    const audioLoader = new THREE.AudioLoader();
    const texLoader = new THREE.TextureLoader();
    const promises = [];

    //Level
    promises.push(this.AddAsset(level, gltfLoader, "level"));
    promises.push(this.AddAsset(navmesh, objLoader, "navmesh"));
    //Mutant
    promises.push(this.AddAsset(mutant, fbxLoader, "mutant"));
    promises.push(this.AddAsset(idleAnim, fbxLoader, "idleAnim"));
    promises.push(this.AddAsset(walkAnim, fbxLoader, "walkAnim"));
    promises.push(this.AddAsset(runAnim, fbxLoader, "runAnim"));
    promises.push(this.AddAsset(attackAnim, fbxLoader, "attackAnim"));
    promises.push(this.AddAsset(dieAnim, fbxLoader, "dieAnim"));
    //AK47
    promises.push(this.AddAsset(ak47, gltfLoader, "ak47"));
    promises.push(this.AddAsset(muzzleFlash, gltfLoader, "muzzleFlash"));
    promises.push(this.AddAsset(ak47Shot, audioLoader, "ak47Shot"));
    //Ammo box
    promises.push(this.AddAsset(ammobox, fbxLoader, "ammobox"));
    promises.push(this.AddAsset(ammoboxTexD, texLoader, "ammoboxTexD"));
    promises.push(this.AddAsset(ammoboxTexN, texLoader, "ammoboxTexN"));
    promises.push(this.AddAsset(ammoboxTexM, texLoader, "ammoboxTexM"));
    promises.push(this.AddAsset(ammoboxTexR, texLoader, "ammoboxTexR"));
    promises.push(this.AddAsset(ammoboxTexAO, texLoader, "ammoboxTexAO"));
    //Decal
    promises.push(this.AddAsset(decalColor, texLoader, "decalColor"));
    promises.push(this.AddAsset(decalNormal, texLoader, "decalNormal"));
    promises.push(this.AddAsset(decalAlpha, texLoader, "decalAlpha"));

    promises.push(this.AddAsset(skyTex, texLoader, "skyTex"));

    await this.PromiseProgress(promises, this.OnProgress);

    this.assets["level"] = this.assets["level"].scene;
    this.assets["muzzleFlash"] = this.assets["muzzleFlash"].scene;

    //Extract mutant anims
    this.mutantAnims = {};
    this.SetAnim("idle", this.assets["idleAnim"]);
    this.SetAnim("walk", this.assets["walkAnim"]);
    this.SetAnim("run", this.assets["runAnim"]);
    this.SetAnim("attack", this.assets["attackAnim"]);
    this.SetAnim("die", this.assets["dieAnim"]);

    this.assets["ak47"].scene.animations = this.assets["ak47"].animations;

    //Set ammo box textures and other props
    this.assets["ammobox"].scale.set(0.01, 0.01, 0.01);
    this.assets["ammobox"].traverse((child: any) => {
      child.castShadow = true;
      child.receiveShadow = true;

      child.material = new THREE.MeshStandardMaterial({
        map: this.assets["ammoboxTexD"],
        aoMap: this.assets["ammoboxTexAO"],
        normalMap: this.assets["ammoboxTexN"],
        metalness: 1,
        metalnessMap: this.assets["ammoboxTexM"],
        roughnessMap: this.assets["ammoboxTexR"],
        color: new THREE.Color(0.4, 0.4, 0.4),
      });
    });

    this.assets["ammoboxShape"] = createConvexHullShape(this.assets["ammobox"]);

    this.HideProgress();
    this.ShowMenu();
  }

  private EntitySetup() {
    this.entityManager = new EntityManager();

    const levelEntity = new Entity();
    levelEntity.SetName("Level");
    levelEntity.AddComponent(
      new LevelSetup(this.assets["level"], this.scene!, this.physicsWorld!)
    );
    levelEntity.AddComponent(new Navmesh(this.scene!, this.assets["navmesh"]));
    levelEntity.AddComponent(
      new LevelBulletDecals(
        this.scene!,
        this.assets["decalColor"],
        this.assets["decalNormal"],
        this.assets["decalAlpha"]
      )
    );
    this.entityManager.Add(levelEntity);

    const skyEntity = new Entity();
    skyEntity.SetName("Sky");
    skyEntity.AddComponent(new Sky(this.scene!, this.assets["skyTex"]));
    this.entityManager.Add(skyEntity);

    const playerEntity = new Entity();
    playerEntity.SetName("Player");
    playerEntity.AddComponent(new PlayerPhysics(this.physicsWorld!));
    playerEntity.AddComponent(new PlayerControls(this.camera!));
    playerEntity.AddComponent(
      new Weapon(
        this.camera!,
        this.assets["ak47"].scene,
        this.assets["muzzleFlash"],
        this.physicsWorld!,
        this.assets["ak47Shot"],
        this.listener!
      )
    );
    playerEntity.AddComponent(new PlayerHealth());
    playerEntity.SetPosition(new THREE.Vector3(2.14, 1.48, -1.36));
    playerEntity.SetRotation(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -Math.PI * 0.5
      )
    );
    this.entityManager.Add(playerEntity);

    const npcLocations = [[10.8, 0.0, 22.0]];

    npcLocations.forEach((v, i) => {
      const npcEntity = new Entity();
      npcEntity.SetPosition(new THREE.Vector3(v[0], v[1], v[2]));
      npcEntity.SetName(`Mutant${i}`);
      npcEntity.AddComponent(
        new NpcCharacterController(
          SkeletonUtils.clone(this.assets["mutant"]),
          this.mutantAnims,
          this.scene!,
          this.physicsWorld!
        )
      );
      npcEntity.AddComponent(new AttackTrigger(this.physicsWorld!));
      npcEntity.AddComponent(new CharacterCollision(this.physicsWorld!));
      npcEntity.AddComponent(new DirectionDebug(this.scene!));
      this.entityManager?.Add(npcEntity);
    });

    const uimanagerEntity = new Entity();
    uimanagerEntity.SetName("UIManager");
    uimanagerEntity.AddComponent(new UIManager());
    this.entityManager.Add(uimanagerEntity);

    const ammoLocations = [
      [14.37, 0.0, 10.45],
      [32.77, 0.0, 33.84],
    ];

    ammoLocations.forEach((loc, i) => {
      const box = new Entity();
      box.SetName(`AmmoBox${i}`);
      box.AddComponent(
        new AmmoBox(
          this.scene!,
          this.assets["ammobox"].clone(),
          this.assets["ammoboxShape"],
          this.physicsWorld!
        )
      );
      box.SetPosition(new THREE.Vector3(loc[0], loc[1], loc[2]));
      this.entityManager?.Add(box);
    });

    this.entityManager.EndSetup();

    this.scene && this.camera && this.scene.add(this.camera);
    this.animFrameId = window.requestAnimationFrame(
      this.OnAnimationFrameHandler
    );
  }

  private StartGame = () => {
    window.cancelAnimationFrame(this.animFrameId);
    Input.ClearEventListners();

    //Create entities and physics
    this.scene?.clear();
    this.SetupPhysics();
    this.EntitySetup();
    this.ShowMenu(false);
  };

  // resize
  private WindowResizeHanlder = () => {
    const { innerHeight, innerWidth } = window;
    this.renderer?.setSize(innerWidth, innerHeight);
    if (this.camera) {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
    }
  };

  // render loop
  private OnAnimationFrameHandler = (t: number) => {
    if (this.lastFrameTime === null) {
      this.lastFrameTime = t;
    }

    const delta = t - this.lastFrameTime;
    let timeElapsed = Math.min(1.0 / 30.0, delta * 0.001);
    this.Step(timeElapsed);
    this.lastFrameTime = t;

    this.animFrameId = window.requestAnimationFrame(
      this.OnAnimationFrameHandler
    );
  };

  private PhysicsUpdate = (world: any, timeStep: any) => {
    this.entityManager?.PhysicsUpdate(world, timeStep);
  };

  private Step(elapsedTime: number) {
    this.physicsWorld?.stepSimulation(elapsedTime, 10);
    //this.debugDrawer.update();

    this.entityManager?.Update(elapsedTime);

    this.renderer &&
      this.scene &&
      this.camera &&
      this.renderer.render(this.scene, this.camera);
    this.stats?.update();
  }
}

let _APP = null;
window.addEventListener("DOMContentLoaded", () => {
  _APP = new FPSGameApp();
});
