import type { Texture } from "three";

import { BaseInventory } from "./BaseInventory";
import { getDefaultTexture } from "./untils";

class TextureInventory extends BaseInventory<Texture> {
    constructor() {
        super(getDefaultTexture);
    }

    override getTasks() {
        return super
            .getTasks()
            .map((item) => ({ ...item, type: <const>"texture" }));
    }
}

export { TextureInventory };
