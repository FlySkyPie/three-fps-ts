import type { Texture, Group, } from "three";
import type { GLTF, } from "three/examples/jsm/Addons.js";
import { AudioLoader, TextureLoader } from "three";
import { FBXLoader, GLTFLoader, OBJLoader } from "three/examples/jsm/Addons.js";

export const useTextureLoader = () => {
    const loader = new TextureLoader();

    const loadTexture = (path: string) =>
        new Promise<Texture | undefined>((resolve) => {
            loader.load(
                path,
                (texture) => resolve(texture),
                undefined,
                () => resolve(undefined)
            );
        });

    return { loadTexture };
};

export const useGLTFLoader = () => {
    const loader = new GLTFLoader();

    const loadGLTF = (path: string) =>
        new Promise<GLTF | undefined>((resolve) => {
            loader.load(
                path,
                (gltf) => resolve(gltf),
                undefined,
                () => resolve(undefined)
            );
        });

    return { loadGLTF };
};

export const useFBXLoader = () => {
    const loader = new FBXLoader();

    const loadFBX = (path: string) =>
        new Promise<Group | undefined>((resolve) => {
            loader.load(
                path,
                (group) => resolve(group),
                undefined,
                () => resolve(undefined)
            );
        });

    return { loadFBX };
};

export const useOBJLoader = () => {
    const loader = new OBJLoader();

    const loadOBJ = (path: string) =>
        new Promise<Group | undefined>((resolve) => {
            loader.load(
                path,
                (group) => resolve(group),
                undefined,
                () => resolve(undefined)
            );
        });

    return { loadOBJ };
};

export const useAudioLoader = () => {
    const loader = new AudioLoader();

    const loadAudio = (path: string) =>
        new Promise<AudioBuffer | undefined>((resolve) => {
            loader.load(
                path,
                (buffer) => resolve(buffer),
                undefined,
                () => resolve(undefined)
            );
        });

    return { loadAudio };
};
