import Component from "../../Component";

export default class PlayerHealth extends Component {
  health: any;

  uimanager: any;

  constructor() {
    super();

    this.health = 100;
  }

  TakeHit = (e: any) => {
    this.health = Math.max(0, this.health - 10);
    this.uimanager.SetHealth(this.health);
  };

  Initialize() {
    this.uimanager = this.FindEntity("UIManager").GetComponent("UIManager");
    this.parent.RegisterEventHandler(this.TakeHit, "hit");
    this.uimanager.SetHealth(this.health);
  }
}
