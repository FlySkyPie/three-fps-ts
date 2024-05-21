import type { GLTF } from "three/examples/jsm/Addons.js";

import { BaseInventory } from "./BaseInventory";

class GLTFInventory extends BaseInventory<GLTF> {
    override getTasks() {
        return super
            .getTasks()
            .map((item) => ({ ...item, type: <const>"gltf" }));
    }
}

export { GLTFInventory };
