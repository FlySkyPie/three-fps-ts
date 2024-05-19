import Component from "../../Component";

import type UIManager from "../UI/UIManager";

export default class PlayerHealth extends Component {
  health: number;

  uimanager?: UIManager;

  constructor() {
    super();

    this.health = 100;
  }

  TakeHit = () => {
    this.health = Math.max(0, this.health - 10);
    this.uimanager?.SetHealth(this.health);
  };

  Initialize() {
    this.uimanager = this.FindEntity("UIManager").GetComponent<UIManager>("UIManager");
    this.parent?.RegisterEventHandler(this.TakeHit, "hit");
    this.uimanager?.SetHealth(this.health);
  }
}
