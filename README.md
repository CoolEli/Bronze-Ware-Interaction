# Bronze Ware Interaction

青铜器数字化展示资源仓库，保留三维模型、模型资料、科普数据、背景音乐和模型截图。

## 目录结构

```text
public/
├── models/                  # GLB 三维模型
├── music/                   # 背景音乐
└── data/
    └── introduce.json       # 结构化介绍数据
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

本仓库当前仅保存项目资源，不包含网页入口、交互代码或构建运行时。模型、音乐及相关资料的版权和授权信息请根据实际使用场景补充确认。
