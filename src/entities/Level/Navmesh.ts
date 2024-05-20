import * as THREE from "three";
import Component from "../../Component";

import { Pathfinding } from "three-pathfinding";

export default class Navmesh extends Component {
  public name: string;

  private scene: THREE.Scene;

  private zone: string;

  private mesh: any;

  private pathfinding?: Pathfinding;

  constructor(scene: THREE.Scene, mesh: any) {
    super();
    this.scene = scene;
    this.name = "Navmesh";
    this.zone = "level1";
    this.mesh = mesh;
  }

  public Initialize() {
    this.pathfinding = new Pathfinding();

    this.mesh.traverse((node: any) => {
      if (node.isMesh) {
        this.pathfinding!.setZoneData(
          this.zone,
          Pathfinding.createZone(node.geometry)
        );
      }
    });
  }

  public GetRandomNode(p: any, range: number) {
    const groupID = this.pathfinding!.getGroup(this.zone, p);
    return this.pathfinding!.getRandomNode(this.zone, groupID, p, range);
  }

  public FindPath(a: any, b: any) {
    const groupID = this.pathfinding!.getGroup(this.zone, a);
    return this.pathfinding!.findPath(a, b, this.zone, groupID);
  }
}
