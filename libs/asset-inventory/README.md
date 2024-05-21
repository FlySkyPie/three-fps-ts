# Three Asset Inventory

## Usage

```javascript
import { AssetInventory } from '@flyskypie/three-asset-inventory';

const inventory = new AssetInventory();

// Setup assets meta.
inventory.add.texture('cube-texture','assets/texture/cube.png');

// Setup progress event
inventory.load.on('progress', ({ progress, total }) => {
    const persentage = (progress / total * 100).toFixed(2);
    // Update your loading page.

})

inventory.load.on('complete', () => {
    // Start your app.
})

// Start the loading process.
inventory.load.start();

```


## TODO

- [x] Texture
- [ ] Animation
- [x] Audio
- [ ] BufferGeometry
- [ ] CompressedTexture
- [ ] CubeTexture
- [ ] DataTexture
- [ ] File
- [ ] ImageBitmap
- [ ] Image
- [ ] Material
- [x] OBJ
- [x] FBX
- [x] GLTF
