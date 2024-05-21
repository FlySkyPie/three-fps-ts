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
import { AssetInventory } from "../libs/asset-inventory";

export class FPSGameApp {
  private lastFrameTime: number | null;

  private animFrameId: number;

  private scene?: THREE.Scene;

  private renderer?: THREE.WebGLRenderer;

  private stats?: Stats;

  private camera?: THREE.PerspectiveCamera;

  private listener?: THREE.AudioListener;

  private physicsWorld?: Ammo.btDiscreteDynamicsWorld;

  private mutantAnims: Record<any, any> = {};

  private entityManager?: EntityManager;

  private inventory: AssetInventory;

  constructor() {
    this.lastFrameTime = null;
    this.animFrameId = 0;

    this.inventory = new AssetInventory();

    AmmoHelper.Init(() => {
      this.Init();
    });
  }

  private Init() {
    this.SetupAssets();
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

  private async SetupAssets() {
    //Level
    this.inventory.add.gltf(AssetKey.GameLevel, AssetUrl[AssetKey.GameLevel]);
    this.inventory.add.obj(AssetKey.NavMesh, AssetUrl[AssetKey.NavMesh]);
    //Mutant
    this.inventory.add.fbx(AssetKey.Mutant, AssetUrl[AssetKey.Mutant]);
    this.inventory.add.fbx(AssetKey.IdleAnim, AssetUrl[AssetKey.IdleAnim]);
    this.inventory.add.fbx(AssetKey.WalkAnim, AssetUrl[AssetKey.WalkAnim]);
    this.inventory.add.fbx(AssetKey.RunAnim, AssetUrl[AssetKey.RunAnim]);
    this.inventory.add.fbx(AssetKey.AttackAnim, AssetUrl[AssetKey.AttackAnim]);
    this.inventory.add.fbx(AssetKey.DieAnim, AssetUrl[AssetKey.DieAnim]);
    //AK47
    this.inventory.add.gltf(AssetKey.Ak47, AssetUrl[AssetKey.Ak47]);
    this.inventory.add.gltf(AssetKey.MuzzleFlash, AssetUrl[AssetKey.MuzzleFlash]);
    this.inventory.add.audio(AssetKey.Ak47Shot, AssetUrl[AssetKey.Ak47Shot]);
    //Ammo box
    this.inventory.add.fbx(AssetKey.Ammobox, AssetUrl[AssetKey.Ammobox]);
    this.inventory.add.texture(AssetKey.AmmoboxTexD, AssetUrl[AssetKey.AmmoboxTexD]);
    this.inventory.add.texture(AssetKey.AmmoboxTexN, AssetUrl[AssetKey.AmmoboxTexN]);
    this.inventory.add.texture(AssetKey.AmmoboxTexM, AssetUrl[AssetKey.AmmoboxTexM]);
    this.inventory.add.texture(AssetKey.AmmoboxTexR, AssetUrl[AssetKey.AmmoboxTexR]);
    this.inventory.add.texture(AssetKey.AmmoboxTexAO, AssetUrl[AssetKey.AmmoboxTexAO]);
    //Decal
    this.inventory.add.texture(AssetKey.DecalColor, AssetUrl[AssetKey.DecalColor]);
    this.inventory.add.texture(AssetKey.DecalNormal, AssetUrl[AssetKey.DecalNormal]);
    this.inventory.add.texture(AssetKey.DecalAlpha, AssetUrl[AssetKey.DecalAlpha]);

    this.inventory.add.texture(AssetKey.SkyTex, AssetUrl[AssetKey.SkyTex]);

    this.inventory.load.on('progress', ({ count, total }) => {
      const progress = count / total * 100;

      this.OnProgress(progress);
    });

    this.inventory.load.on('complete', () => {
      //Extract mutant anims
      this.mutantAnims = {};
      this.SetAnim("idle", this.inventory.resource.fbx.get(AssetKey.IdleAnim));
      this.SetAnim("walk", this.inventory.resource.fbx.get(AssetKey.WalkAnim));
      this.SetAnim("run", this.inventory.resource.fbx.get(AssetKey.RunAnim));
      this.SetAnim("attack", this.inventory.resource.fbx.get(AssetKey.AttackAnim));
      this.SetAnim("die", this.inventory.resource.fbx.get(AssetKey.DieAnim));

      this.inventory.resource.gltf.get(AssetKey.Ak47).scene.animations =
        this.inventory.resource.gltf.get(AssetKey.Ak47).animations;

      //Set ammo box textures and other props
      this.inventory.resource.fbx.get(AssetKey.Ammobox).scale.set(0.01, 0.01, 0.01);

      this.inventory.resource.fbx.get(AssetKey.Ammobox).traverse((child) => {
        child.castShadow = true;
        child.receiveShadow = true;

        (child as any).material = new THREE.MeshStandardMaterial({
          map: this.inventory.resource.texture.get(AssetKey.AmmoboxTexD),
          aoMap: this.inventory.resource.texture.get(AssetKey.AmmoboxTexAO),
          normalMap: this.inventory.resource.texture.get(AssetKey.AmmoboxTexN),
          metalness: 1,
          metalnessMap: this.inventory.resource.texture.get(AssetKey.AmmoboxTexM),
          roughnessMap: this.inventory.resource.texture.get(AssetKey.AmmoboxTexR),
          color: new THREE.Color(0.4, 0.4, 0.4),
        });
      });

      this.HideProgress();
      this.ShowMenu();
    });

    await this.inventory.load.start();
  }

  private EntitySetup() {
    this.entityManager = new EntityManager();

    const levelEntity = new Entity();
    levelEntity.SetName("Level");
    levelEntity.AddComponent(
      new LevelSetup(
        // this.assets[AssetKey.GameLevel],
        this.inventory.resource.gltf.get(AssetKey.GameLevel).scene,
        this.scene!,
        this.physicsWorld!
      )
    );
    levelEntity.AddComponent(
      new Navmesh(this.scene!,
        this.inventory.resource.obj.get(AssetKey.NavMesh)
        //  this.assets[AssetKey.NavMesh]
      )
    );
    levelEntity.AddComponent(
      new LevelBulletDecals(
        this.scene!,
        this.inventory.resource.texture.get(AssetKey.DecalColor),
        this.inventory.resource.texture.get(AssetKey.DecalNormal),
        this.inventory.resource.texture.get(AssetKey.DecalAlpha),
        // this.assets[AssetKey.DecalColor],
        // this.assets[AssetKey.DecalNormal],
        // this.assets[AssetKey.DecalAlpha]
      )
    );
    this.entityManager.Add(levelEntity);

    const skyEntity = new Entity();
    skyEntity.SetName("Sky");
    skyEntity.AddComponent(new Sky(this.scene!,
      this.inventory.resource.texture.get(AssetKey.SkyTex)));
    this.entityManager.Add(skyEntity);

    const playerEntity = new Entity();
    playerEntity.SetName("Player");
    playerEntity.AddComponent(new PlayerPhysics(this.physicsWorld!));
    playerEntity.AddComponent(new PlayerControls(this.camera!));
    playerEntity.AddComponent(
      new Weapon(
        this.camera!,
        this.inventory.resource.gltf.get(AssetKey.Ak47).scene,
        // this.assets[AssetKey.Ak47].scene,
        // this.assets[AssetKey.MuzzleFlash],
        this.inventory.resource.gltf.get(AssetKey.MuzzleFlash).scene,
        this.physicsWorld!,
        this.inventory.resource.audio.get(AssetKey.Ak47Shot),
        // this.assets[AssetKey.Ak47Shot],
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
          (SkeletonUtils as any).clone(
            this.inventory.resource.fbx.get(AssetKey.Mutant)),
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
          this.inventory.resource.fbx.get(AssetKey.Ammobox).clone(),
          createConvexHullShape(
            this.inventory.resource.fbx.get(AssetKey.Ammobox)
          ),
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
    this.entityManager?.PhysicsUpdate();

    this.renderer &&
      this.scene &&
      this.camera &&
      this.renderer.render(this.scene, this.camera);
    this.stats?.update();
  }
};
