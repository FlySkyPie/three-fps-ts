import { Color, MeshStandardMaterial } from "three";
import type { AssetInventory } from "../libs/asset-inventory";

import { AssetKey } from "./constants/asset-key";
import { AssetUrl } from "./constants/asset-url";

export class Preloader {
    public mutantAnims: Record<any, any> = {};

    constructor(private inventory: AssetInventory) {
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
    }

    public async SetupAssets() {
        this.inventory.load.on('progress', ({ count, total }) => {
            const progress = count / total * 100;

            this.OnProgress(progress);
        });

        await this.inventory.load.start();

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

            (child as any).material = new MeshStandardMaterial({
                map: this.inventory.resource.texture.get(AssetKey.AmmoboxTexD),
                aoMap: this.inventory.resource.texture.get(AssetKey.AmmoboxTexAO),
                normalMap: this.inventory.resource.texture.get(AssetKey.AmmoboxTexN),
                metalness: 1,
                metalnessMap: this.inventory.resource.texture.get(AssetKey.AmmoboxTexM),
                roughnessMap: this.inventory.resource.texture.get(AssetKey.AmmoboxTexR),
                color: new Color(0.4, 0.4, 0.4),
            });
        });

        this.OnProgress(0);
        document.getElementById("menu")!.style.visibility = "visible";
    }

    private SetAnim(name: string, obj: any) {
        const clip = obj.animations[0];
        this.mutantAnims[name] = clip;
    }

    private OnProgress(p: number) {
        const progressbar = document.getElementById("progress")!;
        progressbar.style.width = `${p}%`;
    }
};
