declare module "ammo.js" {
  import Ammo from "ammojs-typed";

  export type IAmmo = typeof Ammo & {
    castObject: any;
    addFunction: any;
  };

  export default Ammo;
}
