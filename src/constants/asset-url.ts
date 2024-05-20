import level from "../assets/level.glb?url";
import navmesh from "../assets/navmesh.obj?url";

import mutant from "../assets/animations/mutant.fbx?url";
import idleAnim from "../assets/animations/mutant breathing idle.fbx?url";
import attackAnim from "../assets/animations/mutant punch.fbx?url";
import walkAnim from "../assets/animations/mutant walking.fbx?url";
import runAnim from "../assets/animations/mutant run.fbx?url";
import dieAnim from "../assets/animations/mutant dying.fbx?url";

//AK47 Model and textures
import ak47 from "../assets/guns/ak47/ak47.glb?url";
import muzzleFlash from "../assets/muzzle_flash.glb?url";
//Shot sound
import ak47Shot from "../assets/sounds/ak47_shot.wav?url";

//Ammo box
import ammobox from "../assets/ammo/AmmoBox.fbx?url";
import ammoboxTexD from "../assets/ammo/AmmoBox_D.tga.png?url";
import ammoboxTexN from "../assets/ammo/AmmoBox_N.tga.png?url";
import ammoboxTexM from "../assets/ammo/AmmoBox_M.tga.png?url";
import ammoboxTexR from "../assets/ammo/AmmoBox_R.tga.png?url";
import ammoboxTexAO from "../assets/ammo/AmmoBox_AO.tga.png?url";

//Bullet Decal
import decalColor from "../assets/decals/decal_c.jpg?url";
import decalNormal from "../assets/decals/decal_n.jpg?url";
import decalAlpha from "../assets/decals/decal_a.jpg?url";

//Sky
import skyTex from "../assets/sky.jpg?url";

import { AssetKey } from "./asset-key";

export abstract class AssetUrl {
  public static [AssetKey.GameLevel] = level;

  public static [AssetKey.NavMesh] = navmesh;

  public static [AssetKey.Mutant] = mutant;

  public static [AssetKey.IdleAnim] = idleAnim;

  public static [AssetKey.WalkAnim] = walkAnim;

  public static [AssetKey.RunAnim] = runAnim;

  public static [AssetKey.AttackAnim] = attackAnim;

  public static [AssetKey.DieAnim] = dieAnim;

  public static [AssetKey.Ak47] = ak47;

  public static [AssetKey.MuzzleFlash] = muzzleFlash;

  public static [AssetKey.Ak47Shot] = ak47Shot;

  public static [AssetKey.Ammobox] = ammobox;

  public static [AssetKey.AmmoboxTexD] = ammoboxTexD;

  public static [AssetKey.AmmoboxTexN] = ammoboxTexN;

  public static [AssetKey.AmmoboxTexM] = ammoboxTexM;

  public static [AssetKey.AmmoboxTexR] = ammoboxTexR;

  public static [AssetKey.AmmoboxTexAO] = ammoboxTexAO;

  public static [AssetKey.DecalColor] = decalColor;

  public static [AssetKey.DecalNormal] = decalNormal;

  public static [AssetKey.DecalAlpha] = decalAlpha;

  public static [AssetKey.SkyTex] = skyTex;
}
