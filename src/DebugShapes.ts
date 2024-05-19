import type { Scene } from "three";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";

export default class DebugShapes {
  meshes: Mesh<SphereGeometry, MeshBasicMaterial>[];

  pointGeom: SphereGeometry;

  constructor(public scene: Scene) {
    this.meshes = [];
    this.pointGeom = new SphereGeometry(0.3, 8, 8);
  }

  AddPoint(position: any, color: any) {
    const material = new MeshBasicMaterial({ color, wireframe: true });
    const sphere = new Mesh(this.pointGeom, material);
    sphere.position.copy(position);
    this.scene.add(sphere);
    this.meshes.push(sphere);
  }

  Clear() {
    for (const mesh of this.meshes) {
      this.scene.remove(mesh);
    }

    this.meshes.length = 0;
  }
}
