class FiniteStateMachine {
  states: Record<string, any>;

  currentState: any;

  constructor() {
    this.states = {};
    this.currentState = null;
  }

  AddState(name: any, instance: any) {
    this.states[name] = instance;
  }

  SetState(name: any) {
    const prevState = this.currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    this.currentState = this.states[name];
    this.currentState.Enter(prevState);
  }

  Update(timeElapsed: any) {
    this.currentState && this.currentState.Update(timeElapsed);
  }
}

class State {
  //   parent: any;

  constructor(public parent: any) {
    // this.parent = parent;
  }

  Enter() {}
  Exit() {}
  Update() {}
}

export { State, FiniteStateMachine };
