# Aether for Google Antigravity

> **Editorial Theme, Harmonized Telemetry Cockpit & Zero-Gravity Orbital Boot Suite for Google Antigravity 2.x**

**Aether** 是一套面向 Google Antigravity 2.x 的一体化美学与观测增强套件，直接持久化内置到客户端 `app.asar` 与原生 **`Settings → Appearance`** 面板中——无需后台守护进程、无需调试端口，每次正常启动 Antigravity 自动生效。

---

## 核心特性

### 1. Antigravity 原生美学启动页 (`Aether Boot Screen`)
- **`Orbital`（默认）**：灵感源自 `antigravity.google` 标志性的失重微粒子星环（Medusae / Orbital Swarm），136 颗微胶囊粒子在 3D 轨道上呼吸漂浮，实时响应鼠标波动，中心以优雅衬线体呈现 `Antigravity` 字标与极细进度线，约 `1.5s` 平滑淡出（点击或按 `Esc` 立即跳过）。
- **`Minimal`**：极简纯排版淡入（`<0.9s`），零干扰。
- **内置开关与预览**：在 **`Settings → Appearance → Aether Boot Screen`** 中可随时切换 `Orbital / Minimal / Off`，并支持点击 **`Preview`** 即时预览。

### 2. 全套编辑部质感主题与字体体系 (`Aether Studio`)
- **配色风格**：
  - **`Clay`**（默认）：温润暖白 `#FAF9F5` / 炭灰 `#262624` + 陶土红 `#D97757` 强调色，完整覆盖侧栏、对话卡片、Prism 代码高亮、内嵌 VS Code 编辑器、Diff 与终端。
  - **`Classic`**：中性纯白 / 深黑 + 经典钴蓝强调色。
  - **`Original`**：一键切回 Antigravity 官方原版样式。
- **分层字体体系**（原生内置于 `Settings → Appearance → Aether Typography`）：
  - 西文：**`Editorial`**（Claude 衬线阅读体 `Anthropic Serif / Tiempos Text / Georgia / Charter`） / **`Modern`**（无衬线现代体 `Anthropic Sans / Inter / SF Pro`） / **`System`**
  - 中文：**`WenKai`**（霞鹜文楷） / **`PingFang`**（苹方） / **`Songti`**（宋体 `Songti SC`）

### 3. 配色统一化的上下文与用量监控 (`Telemetry Cockpit`)
- 实时追踪当前会话上下文窗口占用、模型额度池、生成速度（TPS / TTFT）、桌面与 CLI 历史 Token 热力图及费用参考。
- **视觉统一化**：顶栏胶囊、进度圆环、浮层面板与热力图自动随 `Clay`（陶土色系）/ `Classic`（钴蓝色系）与明暗模式联动，告别突兀配色。
- **弹窗互斥修复**：彻底修复宿主设置弹窗（`[role="dialog"]`）与右上角浮层（账号共享池 / 模型额度 / Token 用量）重叠导致点击锁死的问题。

---

## 快速安装（macOS）

先按 **`Cmd + Q`** 完全退出 Antigravity，然后在终端执行：

```bash
git clone https://github.com/kyler-attendre/antigravity-aether.git
cd antigravity-aether
./aether/install-mac.sh
```

可选：安装霞鹜文楷以获得更佳中文阅读排版：

```bash
brew install --cask font-lxgw-wenkai
```

如需还原纯净原版 `app.asar`：

```bash
node ./aether/patch-aether.js --restore
```

---

## 致谢与借鉴 (Credits & Acknowledgments)

**Aether** 在底层架构、监控引擎与视觉配色上借鉴并整合了以下优秀开源项目的成果，特此致谢：

- 上下文与 Token 用量监控内核及纯 Node ASAR 引擎借鉴并改造自 **[`elviscjn-cjn/antigravity-context-viewer`](https://github.com/elviscjn-cjn/antigravity-context-viewer)**（MIT License）
- Claude 风格明暗配色与组件 CSS 变量体系借鉴自 **[`AlexByoung/Claudized-Antigravity`](https://github.com/AlexByoung/Claudized-Antigravity)**（MIT License）
- 启动页失重微粒子星环动效灵感源自 Google Antigravity 官网（`antigravity.google`）
