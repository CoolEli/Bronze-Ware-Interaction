# Bronze Ware Interaction

青铜器数字化交互展示项目：以粒子态作为默认入口，支持实体模型、粒子解构、模型切换、鼠标操作、MediaPipe 手势和背景音乐。

在线访问：[GitHub Pages](https://cooleli.github.io/Bronze-Ware-Interaction/)

## 目录

```text
public/
├── models/          # GLB 三维模型
├── music/           # 背景音乐
├── data/            # 结构化介绍数据与运行时配置
└── vendor/three/    # 本地 Three.js 运行时
docs/
├── model-info/      # 模型结构与技术信息
├── screenshots/     # 模型预览图
└── OPTIMIZATION.md  # 优化记录与部署检查清单
introduce.md         # 双语青铜器科普介绍
index.html           # GitHub Pages 入口
```

## 青铜器列表

- 武王征商簋 / Wu Wang Zheng Shang Gui
- 曾侯乙编钟 / Zeng Hou Yi Bian Zhong
- 二里头乳钉纹青铜爵 / Erlitou Bronze Jue with Nipple Pattern
- 后司母戊鼎 / Hou Si Mu Wu Ding
- 四羊方尊 / Four-Ram Square Zun

## 使用方式

模型文件位于 `public/models/`，可通过 Three.js、`GLTFLoader` 或其他支持 glTF/GLB 的 Web 3D 引擎加载。

网页首屏只优先加载第一个模型，其余模型在切换时按需加载。粒子采样数据会缓存到浏览器 IndexedDB，背景音乐只在点击播放后加载。

### 交互

- 鼠标拖拽：旋转模型
- 滚轮：缩放
- 单击：粒子爆破
- 空格：切换青铜器
- `Particle / Solid`：切换粒子态与实体态
- `Mouse / Gesture`：请求摄像头并启动 MediaPipe 手势

手势功能需要 HTTPS、支持摄像头的浏览器和用户授权。若 MediaPipe 或摄像头不可用，页面会自动保留鼠标交互。

### 性能建议

推荐使用桌面版 Chrome、Edge 或 Safari。当前粒子数量会根据设备内存和 CPU 核心数自适应：高性能桌面约 65,536 个粒子，较低性能设备约 36,864 个粒子。

## 网页入口

完整交互网页位于 [`index.html`](./index.html)，部署到支持静态网页的环境后即可运行。网页会自动读取本仓库中的模型、介绍数据与背景音乐资源。

```js
loader.load('public/models/si-yang-fang-zun.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

模型介绍数据位于 `public/data/introduce.json`，科普文本位于 `introduce.md`。

运行时参数见 [`public/data/runtime-config.json`](./public/data/runtime-config.json)，优化细节见 [`docs/OPTIMIZATION.md`](./docs/OPTIMIZATION.md)。

## 说明

模型由原始作品整理而来，具体版权、授权与来源信息请根据实际使用场景补充确认。本仓库中的内容主要用于数字展示、交互原型与文化科普。背景音乐及模型文件的正式路径分别为 `public/music/` 与 `public/models/`。
