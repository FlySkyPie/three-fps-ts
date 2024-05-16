type IEvent = {
  element: HTMLElement | Document;
  type: string;
  callback: (...arg: any[]) => void;
};

class Input {
  private _keyMap: Record<string, number>;

  private events: IEvent[];

  constructor() {
    this._keyMap = {};
    this.events = [];

    this.AddKeyDownListner(this._onKeyDown);
    this.AddKeyUpListner(this._onKeyUp);
  }

  private _addEventListner(
    element: HTMLElement | Document,
    type: string,
    callback: (...arg: any[]) => void
  ) {
    element.addEventListener(type, callback);
    this.events.push({ element, type, callback });
  }

  public AddKeyDownListner(callback: any) {
    this._addEventListner(document, "keydown", callback);
  }

  public AddKeyUpListner(callback: any) {
    this._addEventListner(document, "keyup", callback);
  }

  public AddMouseMoveListner(callback: any) {
    this._addEventListner(document, "mousemove", callback);
  }

  public AddClickListner(callback: any) {
    this._addEventListner(document.body, "click", callback);
  }

  public AddMouseDownListner(callback: any) {
    this._addEventListner(document.body, "mousedown", callback);
  }

  public AddMouseUpListner(callback: any) {
    this._addEventListner(document.body, "mouseup", callback);
  }

  private _onKeyDown = (event: any) => {
    this._keyMap[event.code] = 1;
  };

  private _onKeyUp = (event: any) => {
    this._keyMap[event.code] = 0;
  };

  public GetKeyDown(code: any) {
    return this._keyMap[code] === undefined ? 0 : this._keyMap[code];
  }

  public ClearEventListners() {
    this.events.forEach((e) => {
      e.element.removeEventListener(e.type, e.callback);
    });

    this.events = [];
    this.AddKeyDownListner(this._onKeyDown);
    this.AddKeyUpListner(this._onKeyUp);
  }
}

const inputInstance = new Input();
export default inputInstance;
