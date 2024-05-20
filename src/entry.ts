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

import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

import { AmmoHelper, AmmoInstance, createConvexHullShape } from "./AmmoLib";
import EntityManager from "./EntityManager";
import Entity from "./Entity";
import Sky from "./entities/Sky/Sky2";
import LevelSetup from "./entities/Level/LevelSetup";
import PlayerControls from "./entities/Player/PlayerControls";
import PlayerPhysics from "./entities/Player/PlayerPhysics";

import NpcCharacterController from "./entities/NPC/CharacterController";
import Input from "./Input";

import { AssetKey } from "./constants/asset-key";
import { AssetUrl } from "./constants/asset-url";

import Navmesh from "./entities/Level/Navmesh";
import AttackTrigger from "./entities/NPC/AttackTrigger";
import DirectionDebug from "./entities/NPC/DirectionDebug";
import CharacterCollision from "./entities/NPC/CharacterCollision";
import Weapon from "./entities/Player/Weapon";
import UIManager from "./entities/UI/UIManager";
import AmmoBox from "./entities/AmmoBox/AmmoBox";
import LevelBulletDecals from "./entities/Level/BulletDecals";
import PlayerHealth from "./entities/Player/PlayerHealth";

type ILoader =
  | FBXLoader
  | GLTFLoader
  | OBJLoader
  | THREE.TextureLoader
  | THREE.AudioLoader;

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
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

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

    /**
     * Comment this would break "jump" feature, the `addFunction` not exist in three's build version.
     */
    // const fp = AmmoInstance.addFunction(this.PhysicsUpdate);
    // this.physicsWorld.setInternalTickCallback(fp);

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

  private async AddAsset(name: AssetKey, loader: ILoader) {
    const result = await loader.loadAsync(AssetUrl[name]);
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
    promises.push(this.AddAsset(AssetKey.GameLevel, gltfLoader));
    promises.push(this.AddAsset(AssetKey.NavMesh, objLoader));
    //Mutant
    promises.push(this.AddAsset(AssetKey.Mutant, fbxLoader));
    promises.push(this.AddAsset(AssetKey.IdleAnim, fbxLoader));
    promises.push(this.AddAsset(AssetKey.WalkAnim, fbxLoader));
    promises.push(this.AddAsset(AssetKey.RunAnim, fbxLoader));
    promises.push(this.AddAsset(AssetKey.AttackAnim, fbxLoader));
    promises.push(this.AddAsset(AssetKey.DieAnim, fbxLoader));
    //AK47
    promises.push(this.AddAsset(AssetKey.Ak47, gltfLoader));
    promises.push(this.AddAsset(AssetKey.MuzzleFlash, gltfLoader));
    promises.push(this.AddAsset(AssetKey.Ak47Shot, audioLoader));
    //Ammo box
    promises.push(this.AddAsset(AssetKey.Ammobox, fbxLoader));
    promises.push(this.AddAsset(AssetKey.AmmoboxTexD, texLoader));
    promises.push(this.AddAsset(AssetKey.AmmoboxTexN, texLoader));
    promises.push(this.AddAsset(AssetKey.AmmoboxTexM, texLoader));
    promises.push(this.AddAsset(AssetKey.AmmoboxTexR, texLoader));
    promises.push(this.AddAsset(AssetKey.AmmoboxTexAO, texLoader));
    //Decal
    promises.push(this.AddAsset(AssetKey.DecalColor, texLoader));
    promises.push(this.AddAsset(AssetKey.DecalNormal, texLoader));
    promises.push(this.AddAsset(AssetKey.DecalAlpha, texLoader));

    promises.push(this.AddAsset(AssetKey.SkyTex, texLoader));

    await this.PromiseProgress(promises, this.OnProgress);

    this.assets[AssetKey.GameLevel] = this.assets[AssetKey.GameLevel].scene;
    this.assets[AssetKey.MuzzleFlash] = this.assets[AssetKey.MuzzleFlash].scene;

    //Extract mutant anims
    this.mutantAnims = {};
    this.SetAnim("idle", this.assets[AssetKey.IdleAnim]);
    this.SetAnim("walk", this.assets[AssetKey.WalkAnim]);
    this.SetAnim("run", this.assets[AssetKey.RunAnim]);
    this.SetAnim("attack", this.assets[AssetKey.AttackAnim]);
    this.SetAnim("die", this.assets[AssetKey.DieAnim]);

    this.assets[AssetKey.Ak47].scene.animations =
      this.assets[AssetKey.Ak47].animations;

    //Set ammo box textures and other props
    this.assets[AssetKey.Ammobox].scale.set(0.01, 0.01, 0.01);
    this.assets[AssetKey.Ammobox].traverse((child: any) => {
      child.castShadow = true;
      child.receiveShadow = true;

      child.material = new THREE.MeshStandardMaterial({
        map: this.assets[AssetKey.AmmoboxTexD],
        aoMap: this.assets[AssetKey.AmmoboxTexAO],
        normalMap: this.assets[AssetKey.AmmoboxTexN],
        metalness: 1,
        metalnessMap: this.assets[AssetKey.AmmoboxTexM],
        roughnessMap: this.assets[AssetKey.AmmoboxTexR],
        color: new THREE.Color(0.4, 0.4, 0.4),
      });
    });

    this.assets["ammoboxShape"] = createConvexHullShape(
      this.assets[AssetKey.Ammobox]
    );

    this.HideProgress();
    this.ShowMenu();
  }

  private EntitySetup() {
    this.entityManager = new EntityManager();

    const levelEntity = new Entity();
    levelEntity.SetName("Level");
    levelEntity.AddComponent(
      new LevelSetup(
        this.assets[AssetKey.GameLevel],
        this.scene!,
        this.physicsWorld!
      )
    );
    levelEntity.AddComponent(
      new Navmesh(this.scene!, this.assets[AssetKey.NavMesh])
    );
    levelEntity.AddComponent(
      new LevelBulletDecals(
        this.scene!,
        this.assets[AssetKey.DecalColor],
        this.assets[AssetKey.DecalNormal],
        this.assets[AssetKey.DecalAlpha]
      )
    );
    this.entityManager.Add(levelEntity);

    const skyEntity = new Entity();
    skyEntity.SetName("Sky");
    skyEntity.AddComponent(new Sky(this.scene!, this.assets[AssetKey.SkyTex]));
    this.entityManager.Add(skyEntity);

    const playerEntity = new Entity();
    playerEntity.SetName("Player");
    playerEntity.AddComponent(new PlayerPhysics(this.physicsWorld!));
    playerEntity.AddComponent(new PlayerControls(this.camera!));
    playerEntity.AddComponent(
      new Weapon(
        this.camera!,
        this.assets[AssetKey.Ak47].scene,
        this.assets[AssetKey.MuzzleFlash],
        this.physicsWorld!,
        this.assets[AssetKey.Ak47Shot],
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
          (SkeletonUtils as any).clone(this.assets[AssetKey.Mutant]),
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
          this.assets[AssetKey.Ammobox].clone(),
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

  // private PhysicsUpdate = (world: any, timeStep: any) => {
  //   this.entityManager?.PhysicsUpdate(world, timeStep);
  // };

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
