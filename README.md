# Aether for Google Antigravity

> **Editorial Theme, Dream Skin Wallpaper Engine, 60fps Particle Boot Screen & 3-Tab Telemetry Cockpit for Google Antigravity 2.x**

**Aether** 是一套面向 Google Antigravity 2.x（macOS）的一体化美学与遥测增强套件，直接持久化内置到客户端 `app.asar` 与原生 **`Settings → Appearance`** / **`Settings → Aether`** 面板中——无需后台守护进程、无需调试端口，每次正常启动 Antigravity 自动生效。

---

## 核心特性

### 1. 60fps 粒子汇聚启动画面 (`Aether Boot Screen`)
- **弹簧物理粒子引擎**：650+ 发光粒子从全屏汇聚拼出 Antigravity `A` 徽标，锁定瞬间触发暖陶土金径向冲击波与 3D 轨道星云连线，支持鼠标磁力排斥与失重散开退场（点击画面或按 `Esc` 立即跳过）。
- **自定义 Pilot ID**：内置于 **`Settings → Appearance → Aether Boot Screen`**，可随时修改展示的个人 ID（如 `ATTENDRE`）、切换 `Orbital / Minimal / Off`，并点击 **`Preview`** 即时预览。

### 2. Aether Dream Skin 全窗壁纸与毛玻璃引擎 (`Aether Dream Skin`)
- 原生集成于 **`Settings → Appearance → Aether Dream Skin`**，一张壁纸铺满整个窗口，所有原生控件（侧栏、对话卡片、项目选择器、输入框）保持真实可交互：
  - **内置预设**：`Aurora`（暖霞流光）、`Void`（深空哥特氛围）
  - **自定义壁纸**：点击 **`Choose Image…`** 导入任意本地高清图片（自动压缩离线持久化）
  - **三档毛玻璃遮罩**：`Light` / `Balanced` / `Deep` 自适应可读性遮罩，浅色与深色模式均清晰通透

### 3. 编辑部质感主题与 3×3 字体体系 (`Aether Studio`)
- **配色**：`Clay`（暖宣纸 `#FAF9F5` / 炭灰 `#262624` + 陶土红 `#C6613F` / `#D97757`）、`Classic`（钴蓝）、`Original`（一键还原官方原版）
- **字体**：西文 `Editorial / Modern / System` × 中文 `WenKai / PingFang / Songti`

### 4. 极简 3-Tab 遥测工作台 (`额度` · `会话` · `用量`)
- 顶栏 **5h + 7d 双额度圆环** 共存 + 最近重置倒计时，精简模式持久化不回弹；隐藏未使用的 CLI 入口。
- 单窗 `640×620` 零跳动切换（支持键盘 `1 / 2 / 3` 秒切）：
  - **`额度`**：当前模型 5h/7d 限额与节奏预警 + 其他共享池 + **内嵌多账号 OAuth 切换与自动切号** + 折叠详情与缓存保活。
  - **`会话`**：默认展示 3 张全宽核心遥测卡（上下文占用 / Token 构成 / 响应速度），一键切入 **`深度排障`** 展开全部 11 个 Bento 排障组件，另含 `速度对比` 与 `模型设置`。
  - **`用量`**：今日/本月/年度 Token、缓存命中率、按模型分布、API 参考金额、实时请求流与 Clay 陶土色活动热力图。

### 5. 一键官方版本升级 + macOS 原生体验修复
- **一键宿主更新**：内置于 **`Settings → Appearance → Aether Host Update`**（以及 `./aether/upgrade-mac.sh`），直连 Google 官方更新清单、SHA-512 校验、原子替换升级并自动重装 Aether。
- **macOS `Cmd+W` 唤醒修复**：修复后台常驻模式下 `Cmd+W` 隐藏窗口后点击 Dock 图标无法唤回窗口的问题。

---

## 快速安装与升级（macOS）

先按 **`Cmd + Q`** 完全退出 Antigravity，然后在终端执行：

```bash
git clone https://github.com/kyler-attendre/antigravity-aether.git
cd antigravity-aether
./aether/install-mac.sh
```

后续官方发布新版本时，可直接在客户端 **`Settings → Appearance → Aether Host Update`** 点击 **`Upgrade & Re-apply`**，或在终端执行：

```bash
./aether/upgrade-mac.sh
```

如需还原纯净原版 `app.asar`：

```bash
node ./aether/patch-aether.js --restore
```

---

## 致谢与借鉴 (Credits & Acknowledgments)

**Aether** 在底层架构、监控引擎与视觉设计上借鉴并融合了以下优秀开源项目的理念，特此致谢：

- 上下文与 Token 监控内核及纯 Node ASAR 引擎借鉴并改造自 **[`elviscjn-cjn/antigravity-context-viewer`](https://github.com/elviscjn-cjn/antigravity-context-viewer)**（MIT License）
- 全窗连续壁纸与自适应毛玻璃遮罩设计灵感源自 **[`Fei-Away/Codex-Dream-Skin`](https://github.com/Fei-Away/Codex-Dream-Skin)**（MIT License）
- Claude 风格明暗配色与组件 CSS 变量体系借鉴自 **[`AlexByoung/Claudized-Antigravity`](https://github.com/AlexByoung/Claudized-Antigravity)**（MIT License）
