import type { Group } from "three";
import PromisePool from "@supercharge/promise-pool";

import { useAudioLoader, useFBXLoader, useGLTFLoader, useOBJLoader, useTextureLoader } from "./loader";
import { TextureInventory } from "./inventory/TextureInventory";
import { GLTFInventory } from "./inventory/GLTFInventory";
import { SimpleInventory } from "./inventory/SimpleInventory";

const assetTypes = <const>['texture', 'fbx', 'gltf', 'fbx', 'obj', 'audio'];

export type LoadEvent = {
    key: string;
    path: string;
    total: number;
    progress: number;
};

type OnProgressHandler = (e: LoadEvent) => void;

type OnCompleteedHandler = () => void;

type EventName = "progress" | "complete";

class AssetInventory {
    isLoading: boolean = false;

    private texture = new TextureInventory();

    private gltf = new GLTFInventory();

    private fbx = new SimpleInventory<Group, 'fbx'>(<const>'fbx');

    private obj = new SimpleInventory<Group, 'obj'>(<const>'obj');

    private audio = new SimpleInventory<AudioBuffer, 'audio'>(<const>'audio');

    private onProgressHanders: OnProgressHandler[] = [];

    private onCompelteHanders: OnCompleteedHandler[] = [];

    private addEventListener = (
        name: EventName,
        callback: (arg?: any) => void
    ) => {
        if (name === "progress") {
            this.onProgressHanders.push(callback);
            return;
        }
        if (name === "complete") {
            this.onCompelteHanders.push(callback);
            return;
        }
        throw new Error(`Unexpected event type: ${name}.`);
    };

    /**
     * Add asstes.
     */
    public get add() {
        if (this.isLoading) {
            console.error("The inventory is busy.");
            return;
        }
        return {
            texture: this.texture.addTask,
            gltf: this.gltf.addTask,
            fbx: this.fbx.addTask,
            obj: this.obj.addTask,
            audio: this.audio.addTask,
        };
    }

    public get resource() {
        return {
            texture: { get: this.texture.getAsset },
            gltf: { get: this.gltf.getAsset },
            fbx: { get: this.fbx.getAsset },
            obj: { get: this.obj.getAsset },
            audio: { get: this.audio.getAsset },
        };
    }

    /**
     * Load asstes.
     */
    public get load() {
        return {
            on: this.addEventListener,
            start: this.startLoad,
        };
    }

    private startLoad = async () => {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;

        const textureTasks = this.texture.getTasks();
        const gltfTasks = this.gltf.getTasks();
        const fbxTasks = this.fbx.getTasks();
        const objTasks = this.obj.getTasks();
        const audioTasks = this.audio.getTasks();

        const tasks = [...textureTasks, ...gltfTasks, ...fbxTasks, ...objTasks, ...audioTasks];
        const total = tasks.length;

        const { loadTexture } = useTextureLoader();
        const { loadGLTF } = useGLTFLoader();
        const { loadFBX } = useFBXLoader();
        const { loadOBJ } = useOBJLoader();
        const { loadAudio } = useAudioLoader();
        const loaders = {
            texture: loadTexture,
            gltf: loadGLTF,
            fbx: loadFBX,
            obj: loadOBJ,
            audio: loadAudio,
        };

        await PromisePool.for(tasks)
            .onTaskFinished((item, pool) => {
                this.onProgressHanders.forEach((callback) =>
                    callback({
                        key: item.key,
                        path: item.path,
                        total,
                        progress: pool.processedCount(),
                    })
                );

                if (pool.processedPercentage() === 100) {
                    this.isLoading = false;
                    this.onCompelteHanders.forEach((callback) => callback());
                }
            })
            .process(async (task) => {
                for (let index = 0; index < assetTypes.length; index++) {
                    const assetType = assetTypes[index];
                    if (task.type === assetType) {
                        const result = await loaders[assetType](task.path);
                        if (result !== undefined) {
                            this[assetType].addAsset(task.key, result as any);
                        } else {
                            console.error(
                                `Error while loading ${assetType} of ${task.key} (${task.path}).`
                            );
                        }
                    }
                }
            });
    };
}

export { AssetInventory };
