import type Entity from "./Entity";

export default class EntityManager {
  ids: number;

  private entities: Entity[];

  constructor() {
    this.ids = 0;
    this.entities = [];
  }

  Get<T extends Entity>(name: string): T {
    const result = this.entities.find((el) => el.Name === name);
    if (!result) {
      throw new Error("The Entity not found.");
    }
    return result as any;
  }

  public Add(entity: Entity) {
    if (!entity.Name) {
      entity.SetName(this.ids);
    }
    entity.id = this.ids;
    this.ids++;
    entity.SetParent(this);
    this.entities.push(entity);
  }

  public EndSetup() {
    for (const ent of this.entities) {
      for (const key in ent.components) {
        ent.components[key].Initialize();
      }
    }
  }

  public PhysicsUpdate(world: any, timeStep: any) {
    for (const entity of this.entities) {
      entity.PhysicsUpdate(world, timeStep);
    }
  }

  public Update(timeElapsed: number) {
    for (const entity of this.entities) {
      entity.Update(timeElapsed);
    }
  }
}
