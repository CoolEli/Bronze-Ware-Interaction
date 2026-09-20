# 模型结构报告

## Overview

| 项目         | 值                                                           |
| ------------ | ------------------------------------------------------------ |
| VERSION      | 2.0                                                          |
| GENERATOR    | By https://any3d.cc                                          |
| EXTENSIONS   | EXT_meshopt_compression<br>EXT_texture_webp<br>KHR_mesh_quantization<br>XMP |
| XMP metadata | 无                                                           |

## Scenes

| ID   | NAME     | ROOT_NAME | BBOX_MIN                    | BBOX_MAX                  | RENDER_VERTEX_COUNT | UPLOAD_VERTEX_COUNT | UPLOAD_NAIVE_VERTEX_COUNT |
| ---- | -------- | --------- | --------------------------- | ------------------------- | ------------------- | ------------------- | ------------------------- |
| 0    | AuxScene | convert   | -0.48326, 0.00017, -0.34157 | 0.48919, 0.89499, 0.34488 | 75,198              | 21,384              | 21,384                    |

## Meshes

| ID   | NAME | MODE      | MESH_PRIMITIVES | GL_PRIMITIVES | VERTICES | INDICES | ATTRIBUTES                                             | INSTANCES | SIZE      |
| ---- | ---- | --------- | --------------- | ------------- | -------- | ------- | ------------------------------------------------------ | --------- | --------- |
| 0    |      | TRIANGLES | 1               | 25,066        | 21,384   | u16     | NORMAL:i8_norm, POSITION:i16_norm, TEXCOORD_0:u16_norm | 1         | 428.39 KB |

## Materials

| ID   | NAME         | INSTANCES | TEXTURES                                                  | ALPHA_MODE | DOUBLE_SIDED |
| ---- | ------------ | --------- | --------------------------------------------------------- | ---------- | ------------ |
| 0    | Material.001 | 1         | baseColorTexture, normalTexture, metallicRoughnessTexture | OPAQUE     | ✓            |

## Textures

| ID   | NAME | URI  | SLOTS                    | INSTANCES | MIME_TYPE  | COMPRESSION | RESOLUTION | SIZE    | GPU_SIZE |
| ---- | ---- | ---- | ------------------------ | --------- | ---------- | ----------- | ---------- | ------- | -------- |
| 0    |      |      | metallicRoughnessTexture | 1         | image/webp |             |            | 1.58 MB |          |
| 1    |      |      | baseColorTexture         | 1         | image/webp |             |            | 1.97 MB |          |
| 2    |      |      | normalTexture            | 1         |            |             |            |         |          |

## 备注

- 模型使用 Meshopt 压缩，加载时需引入 `MeshoptDecoder`。
- 贴图为 WebP 格式，现代浏览器支持良好。
- 顶点数据被量化（`POSITION:i16_norm`），GLTFLoader 会自动还原。
- 包围盒显示模型高约 0.89，原点接近底部中心。
- 贴图占主要体积，粒子模式下可忽略贴图以节省显存。