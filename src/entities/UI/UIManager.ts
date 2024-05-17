import Component from "../../Component";

export default class UIManager extends Component {
  name: string;

  constructor() {
    super();
    this.name = "UIManager";
  }

  SetAmmo(mag: any, rest: any) {
    document.getElementById("current_ammo")!.innerText = mag;
    document.getElementById("max_ammo")!.innerText = rest;
  }

  SetHealth(health: number) {
    document.getElementById("health_progress")!.style.width = `${health}%`;
  }

  Initialize() {
    document.getElementById("game_hud")!.style.visibility = "visible";
  }
}
