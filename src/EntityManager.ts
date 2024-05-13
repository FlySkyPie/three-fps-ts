export default class EntityManager {
  ids: number;

  entities: any[];

  constructor() {
    this.ids = 0;
    this.entities = [];
  }

  Get(name: any) {
    return this.entities.find((el) => el.Name === name);
  }

  Add(entity: any) {
    if (!entity.Name) {
      entity.SetName(this.ids);
    }
    entity.id = this.ids;
    this.ids++;
    entity.SetParent(this);
    this.entities.push(entity);
  }

  EndSetup() {
    for (const ent of this.entities) {
      for (const key in ent.components) {
        ent.components[key].Initialize();
      }
    }
  }

  PhysicsUpdate(world: any, timeStep: any) {
    for (const entity of this.entities) {
      entity.PhysicsUpdate(world, timeStep);
    }
  }

  Update(timeElapsed: any) {
    for (const entity of this.entities) {
      entity.Update(timeElapsed);
    }
  }
}
