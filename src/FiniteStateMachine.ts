class FiniteStateMachine {
  states: Record<string, State>;

  currentState: State | null;

  constructor() {
    this.states = {};
    this.currentState = null;
  }

  public AddState(name: string, instance: State) {
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

abstract class State {
  //   parent: any;

  constructor(public parent: any) {
    // this.parent = parent;
  }

  get Name(): string {
    throw new Error("No implement.");
  }

  Enter(..._arg: any) {}

  Exit(..._arg: any) {}

  Update(..._arg: any) {}
}

export { State, FiniteStateMachine };
