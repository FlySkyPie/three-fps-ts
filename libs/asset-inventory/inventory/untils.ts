import { Texture, CanvasTexture } from "three";

let defaultTexture: Texture | null = null;

export const getDefaultTexture = () => {
    if (defaultTexture !== null) {
        return defaultTexture.clone();
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = 1024;
    canvas.height = 1024;

    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width * 0.5, canvas.height * 0.5);
    ctx.fillRect(
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width,
        canvas.height
    );

    defaultTexture = new CanvasTexture(canvas);
    defaultTexture.needsUpdate = false;

    return defaultTexture;
};
