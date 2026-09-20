## Metadata

### Overview

| VERSION    | 2.0                                                          |
| ---------- | ------------------------------------------------------------ |
| GENERATOR  | By https://any3d.cc                                          |
| EXTENSIONS | EXT_meshopt_compression EXT_texture_webp KHR_mesh_quantization |

### XMP

*No XMP metadata.*

### Scenes

| ID   | NAME     | ROOT_NAME | BBOX_MIN                    | BBOX_MAX                  | RENDER_VERTEX_COUNT | UPLOAD_VERTEX_COUNT | UPLOAD_NAIVE_VERTEX_COUNT |
| :--- | :------- | :-------- | :-------------------------- | :------------------------ | :------------------ | :------------------ | :------------------------ |
| 0    | AuxScene | convert   | -0.39855, 0.00006, -0.33416 | 0.45666, 0.94693, 0.32857 | 75,000              | 21,192              | 21,192                    |

### Meshes

| ID   | NAME | MODE      | MESH_PRIMITIVES | GL_PRIMITIVES | VERTICES | INDICES | ATTRIBUTES                                             | INSTANCES | SIZE     |
| :--- | :--- | :-------- | :-------------- | :------------ | :------- | :------ | :----------------------------------------------------- | :-------- | :------- |
| 0    |      | TRIANGLES | 1               | 25,000        | 21,192   | u16     | NORMAL:i8_norm, POSITION:i16_norm, TEXCOORD_0:u16_norm | 1         | 425.5 KB |

### Materials

| ID   | NAME         | INSTANCES | TEXTURES                                                  | ALPHA_MODE | DOUBLE_SIDED |
| :--- | :----------- | :-------- | :-------------------------------------------------------- | :--------- | :----------- |
| 0    | Material.001 | 1         | baseColorTexture, normalTexture, metallicRoughnessTexture | OPAQUE     | ✓            |

### Textures

| ID   | NAME | URI  | SLOTS                    | INSTANCES | MIME_TYPE  | COMPRESSION | RESOLUTION | SIZE    | GPU_SIZE |
| :--- | :--- | :--- | :----------------------- | :-------- | :--------- | :---------- | :--------- | :------ | :------- |
| 0    |      |      | metallicRoughnessTexture | 1         | image/webp |             |            | 1.25 MB |          |
| 1    |      |      | baseColorTexture         | 1         | image/webp |             |            | 2.2 MB  |          |
| 2    |      |      | normalTexture            | 1         |            |             |            |         |          |