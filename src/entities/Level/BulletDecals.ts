import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

import { AmmoInstance } from "../../AmmoLib";
import Component from "../../Component";

export default class LevelBulletDecals extends Component {
  name: string;

  scene: THREE.Scene;

  rot: THREE.Euler;

  mat4: THREE.Matrix4;

  position: THREE.Vector3;

  up: THREE.Vector3;

  scale: THREE.Vector3;

  material: THREE.MeshStandardMaterial;

  constructor(
    scene: THREE.Scene,
    colorMap: THREE.Texture,
    normalMap: THREE.Texture,
    alphaMap: THREE.Texture
  ) {
    super();
    this.name = "LevelBulletDecals";
    this.scene = scene;

    this.rot = new THREE.Euler();
    this.mat4 = new THREE.Matrix4();
    this.position = new THREE.Vector3(0, 0, 0);
    this.up = new THREE.Vector3(0, 1, 0);
    this.scale = new THREE.Vector3(1, 1, 1);
    this.material = new THREE.MeshStandardMaterial({
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      alphaMap,
      normalMap,
      map: colorMap,
      transparent: true,
    });
  }

  private Hit = (e: any) => {
    this.mat4.lookAt(this.position, e.hitResult.intersectionNormal, this.up);
    this.rot.setFromRotationMatrix(this.mat4);

    const size = Math.random() * 0.3 + 0.2;
    this.scale.set(size, size, 1.0);

    // @ts-ignore The method exist, but not in type declaration.
    const rigidBody: Ammo.btRigidBody = AmmoInstance.castObject(
      e.hitResult.collisionObject,
      AmmoInstance.btRigidBody
    );
    const mesh = rigidBody.mesh;

    const m = new THREE.Mesh(
      new DecalGeometry(
        mesh,
        e.hitResult.intersectionPoint,
        this.rot,
        this.scale
      ),
      this.material
    );
    this.scene.add(m);
  };

  Initialize() {
    this.parent?.RegisterEventHandler(this.Hit, "hit");
  }
}
