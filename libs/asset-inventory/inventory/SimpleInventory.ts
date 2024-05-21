import { BaseInventory } from "./BaseInventory";

class SimpleInventory<AssetType, T> extends BaseInventory<AssetType> {
    constructor(private typeName: T) {
        super();
    }

    override getTasks() {
        return super
            .getTasks()
            .map((item) => ({ ...item, type: this.typeName }));
    }
}

export { SimpleInventory };
