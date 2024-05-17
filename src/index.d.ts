declare module "ammo.js" {
  import Ammo from "ammojs-typed";

  export type IAmmo = typeof Ammo & {
    castObject: any;
    addFunction: any;
  };

  export default Ammo;
}
// three-pathfinding

declare module "three-pathfinding" {
  // type Pathfinding = {
  //   new(x: number, y: number): Vector2D
  //   (x:number, y: number): Vector2D
  // }
  class Pathfinding {
    public static createZone: any;
  }
  export default any;

  export { Pathfinding };
}
