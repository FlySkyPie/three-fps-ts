class Input {
  _keyMap: any;
  events: any[];

  constructor() {
    this._keyMap = {};
    this.events = [];

    this.AddKeyDownListner(this._onKeyDown);
    this.AddKeyUpListner(this._onKeyUp);
  }

  _addEventListner(element: any, type: any, callback: any) {
    element.addEventListener(type, callback);
    this.events.push({ element, type, callback });
  }

  AddKeyDownListner(callback: any) {
    this._addEventListner(document, "keydown", callback);
  }

  AddKeyUpListner(callback: any) {
    this._addEventListner(document, "keyup", callback);
  }

  AddMouseMoveListner(callback: any) {
    this._addEventListner(document, "mousemove", callback);
  }

  AddClickListner(callback: any) {
    this._addEventListner(document.body, "click", callback);
  }

  AddMouseDownListner(callback: any) {
    this._addEventListner(document.body, "mousedown", callback);
  }

  AddMouseUpListner(callback: any) {
    this._addEventListner(document.body, "mouseup", callback);
  }

  _onKeyDown = (event: any) => {
    this._keyMap[event.code] = 1;
  };

  _onKeyUp = (event: any) => {
    this._keyMap[event.code] = 0;
  };

  GetKeyDown(code: any) {
    return this._keyMap[code] === undefined ? 0 : this._keyMap[code];
  }

  ClearEventListners() {
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
