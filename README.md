# Bronze Ware Interaction

双语青铜器数字化展示资源，包含可交互的 GLB 三维模型、模型信息、截图与科普数据。

## 目录

```text
public/
├── models/          # GLB 三维模型
└── data/            # 结构化介绍数据
docs/
├── model-info/      # 模型结构与技术信息
└── screenshots/     # 模型预览图
introduce.md         # 双语青铜器科普介绍
```

## 青铜器列表

- 武王征商簋 / Wu Wang Zheng Shang Gui
- 曾侯乙编钟 / Zeng Hou Yi Bian Zhong
- 二里头乳钉纹青铜爵 / Erlitou Bronze Jue with Nipple Pattern
- 后司母戊鼎 / Hou Si Mu Wu Ding
- 四羊方尊 / Four-Ram Square Zun

## 使用方式

模型文件位于 `public/models/`，可通过 Three.js、`GLTFLoader` 或其他支持 glTF/GLB 的 Web 3D 引擎加载。

```js
loader.load('public/models/si-yang-fang-zun.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

模型介绍数据位于 `public/data/introduce.json`，科普文本位于 `introduce.md`。

## 说明

模型由原始作品整理而来，具体版权、授权与来源信息请根据实际使用场景补充确认。本仓库中的内容主要用于数字展示、交互原型与文化科普。
