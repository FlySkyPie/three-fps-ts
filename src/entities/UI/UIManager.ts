import Component from "../../Component";

export default class UIManager extends Component {
  public name: string;

  constructor() {
    super();
    this.name = "UIManager";
  }

  SetAmmo(mag: number, rest: number) {
    document.getElementById("current_ammo")!.innerText = String(mag);
    document.getElementById("max_ammo")!.innerText = String(rest);
  }

  SetHealth(health: number) {
    document.getElementById("health_progress")!.style.width = `${health}%`;
  }

  Initialize() {
    document.getElementById("game_hud")!.style.visibility = "visible";
  }
}
