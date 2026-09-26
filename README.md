# Bronze Ware Interaction

青铜器数字化展示与交互项目。网页入口使用 Three.js、GPU 粒子系统和 MediaPipe 手势识别，支持粒子态 / 实体态切换、五件青铜器切换、鼠标与手势交互、背景音乐和中英文界面。

在线访问：<https://cooleli.github.io/Bronze-Ware-Interaction/>

## 目录结构

```text
public/
├── models/                  # GLB 三维模型
├── music/                   # 背景音乐
└── data/
    └── introduce.json       # 结构化介绍数据
index.html                   # GitHub Pages 网页入口
styles.css                   # 页面样式
src/                         # 拆分后的交互模块
├── config.js                # 文案、资源路径和质量配置
├── state.js                 # 状态与界面更新
├── scene.js                 # Three.js 场景与后处理
├── particles.js             # GPU 粒子系统
├── models.js                # GLB 加载与采样
├── gesture.js               # MediaPipe 手势识别
└── main.js                  # 入口、输入和动画循环
docs/
├── model-info/              # 各青铜器模型信息
└── screenshots/             # 模型截图
introduce.md                 # 合并科普介绍
README.md
```

## 青铜器列表

- 武王征商簋 / Wu Wang Zheng Shang Gui
- 曾侯乙编钟 / Zeng Hou Yi Bian Zhong
- 二里头乳钉纹青铜爵 / Erlitou Bronze Jue with Nipple Pattern
- 后司母戊鼎 / Hou Si Mu Wu Ding
- 四羊方尊 / Four-Ram Square Zun

## 资源说明

模型文件位于 `public/models/`，格式为 GLB，可通过 Three.js、Blender 或其他支持 glTF/GLB 的工具打开。

模型结构与技术信息位于 `docs/model-info/`，预览图位于 `docs/screenshots/`，结构化介绍数据位于 `public/data/introduce.json`，完整科普介绍位于 `introduce.md`，背景音乐位于 `public/music/`。

MediaPipe 的模型和运行时通过 CDN 按需加载；摄像头手势模式需要 HTTPS、摄像头权限和支持 WebGL 的桌面浏览器。模型、音乐及相关资料的版权和授权信息请根据实际使用场景补充确认。
