# fortune-draw · 专属抽卡生成器

> 给 TA 做一页**有仪式感的专属抽卡小礼物**：花瓣绽放 → 点花蕊翻卡 → 稀有度动画 → 温度尾句 → 收集册存档 → （可选）飞书多维表格记录 + 群提醒。
> 单文件 HTML，无需后端，直接本地双击预览，或丢 GitHub Pages 获得公开访问链接。

默认「鸢尾紫」主题，内置「一句心意 / 今天去哪儿 / 小小挑战」三大卡池 + UR 传说 + 节气/月份限定 + 特殊日专属卡。

## ✨ 特性

- **仪式感花盘**：12 外瓣（粉红）+ 8 中瓣（紫色）逆时针绽放，花蕊金色呼吸光；点击花蕊抽卡，花瓣四散、卡片 3D 翻转入场。
- **稀有度体系**：UR / SSR / SR / R 四档，基础概率 5% / 15% / 30%；连续签到 ≥2 天翻倍、≥5 天再翻倍并保底。
- **限定与特殊日**：节气 4 张、每月 1 张；6月5日「特别的日子」、每月15日「月半」、初见纪念日「初见纪念」。
- **传说解锁**：第 7 次访问、连续 3 天、翻转 20 张、晚 22 点后等条件解锁 4 张 UR 传说卡。
- **关系温度阶梯**：依据访问次数 0/1/2 档，给「一句心意」类卡附加不同温度尾句。
- **共同记忆收集册**：普通池 / 特别日 / 限定卡分区；已收集卡片自动标注「去过了 · 日期」；顶部显示「相识于 X · 已相遇 N 次」。
- **每日签语 + 专属彩蛋**：每日首次签到签语，1/6 概率触发专属彩蛋（「今晚特意没有香菜」级别的细节句）。
- **可选密码锁 & 访客记录**：只有知道密码才能进（可删）；开发者可看本地访客记录。
- **可选后台记录 + 群提醒**：前端 5 类事件上报（open / daily / draw / special / limited），写进飞书多维表格，并在签到 / UR·SSR / 特别日 / 限时卡时向群里推送摘要。

## 📁 目录结构

```
fortune-draw/
├── README.md                本文件（概览 & 快速开始）
├── SKILL.md                 Agent 调用规范：占位符、工作流、上线步骤、常见改动
└── templates/
    ├── fortune.html         单文件 HTML 主模板（直接双击预览）
    ├── scf-handler.js       腾讯云函数中转 · 大陆网络可用（零依赖）
    └── bitable-setup.md     飞书多维表格字段清单 + 应用 scopes 指引
```

## 🚀 3 步做好自己的版本

### 1. 复制 + 改 3 个地方

复制 `templates/fortune.html` 到你喜欢的位置，比如 `index.html`，改这 3 处：

| 位置 | 作用 |
| --- | --- |
| `{{__BRAND__}}`（3 处） | 品牌名/TA 的昵称，出现在锁头标题、页头品牌、按钮里 |
| `var FIRST_MET = { year, month, day }` | 初见年月日 → 影响「初见纪念」卡与「相识第几天」 |
| `var SPECIAL_DAY_DATE = { month, day }` | 「特别的日子」，比如 TA 的生日 |

可选：
- `var CORRECT_PASSWORD = '0605'`：首页密码锁答案；不想要锁就删除 HTML 里 `#lockScreen` 整块，以及 `<script>` 中 `lockScreen / lockBtn / lockInput / lockError / tryUnlock / iris_logged_in / recordVisit / showVisitLog` 相关代码。
- `REPORT_ENDPOINT`：不接后台就保持模板占位符，代码会自动跳过；接后台就填你自己的中转函数 URL。

### 2. 改卡片内容（想改就改，不改也能玩）

`<script>` 开头前半部分有 7 个数组集中在一起，按需增删：

- `CARDS` 三类日常卡：一句心意 / 今天去哪儿 / 小小挑战
- `HIDDEN_CARDS` UR 传说（解锁条件：unlockVisit / unlockStreak / unlockFlips / nightOnly）
- `SEASONAL_CARDS` 节气限定 4 张（30 天窗口）
- `MONTHLY_CARDS` 每月限定 12 张
- `SPECIAL_CARDS` 特殊日 3 张（6月5日 / 15日 / 初见）
- `DAILY_FORTUNES` 每日签语池
- `IRIS_MOMENTS` 专属细节彩蛋池

### 3. 发给 TA（两种方式）

#### 本地直接看
双击改完的 `index.html`，立刻能看到花盘绽放动画。

#### 上线公开链接（推荐 GitHub Pages，免费）
1. 新建一个 **Public** GitHub 仓库，假设叫 `fortune-gift`；
2. 把改完的 `index.html` 丢到仓库根目录；
3. 仓库 → Settings → Pages → Source 选 **Deploy from a branch** → Branch `main` / `/root` → Save；
4. 等 1~3 分钟，拿到链接：
   ```
   https://<用户名>.github.io/fortune-gift/
   ```
5. 把链接发给 TA，浏览器打开就能玩。

## 🧠 事件通知策略（默认）

| 事件 | 记不记录 | 群里推不推 |
| --- | --- | --- |
| 打开应用（任意次） | ✅ | ❌ |
| 今日首次来访（签到） | ✅ 连续天数 + 累计次数 + 今日签语 | ✅ 推 |
| 普通抽卡 | ✅ 卡名 + 稀有度 | 仅 UR / SSR 推 |
| 限定卡抽中 | ✅ | ✅ 推（✦ 限定） |
| 特殊日专属卡 | ✅ | ✅ 推（✦ 特别） |

## 🔌 后台记录 + 群提醒（可选）

需要「她玩了，我第一时间知道」时：

1. 飞书开放平台 → 自建应用 → 开启必要 scopes（见 `templates/bitable-setup.md`），把应用拉进接收群；
2. 按 `templates/bitable-setup.md` 建好多维表格，拿到 `app_token` 和 `table_id`；
3. 用「群设置 → 群机器人 → 搜索应用名」确认机器人已进群，再配合 lark-cli 拿到 `CHAT_ID`（群 ID）；
4. 按 `templates/scf-handler.js` 部署一个腾讯云函数（Node 运行时，函数 URL 触发器，匿名访问，超时 30s，环境变量 `APP_SECRET` = 飞书 App Secret）；
5. 拿到腾讯云函数的公网 URL，填回模板里的 `var REPORT_ENDPOINT`；
6. 重新 push 到 GitHub Pages，完成。

## 🎨 常见改动

- **改主题色**：改 CSS `:root` 里的 3 个品牌色 `--brand / --brand-soft / --brand-deep`。
- **改稀有度概率**：改 `pickRarity()` 里的 `p.UR / p.SSR / p.SR`。
- **加更多卡**：直接往对应数组 push 对象，其他逻辑自动适配。
- **关掉花盘动画**：删除 `buildFlower / withDrawState / restoreFlower` 相关代码和 `.petal / .orbit-stage / center-stamen` CSS，把抽卡按钮直接连 `doDraw()`。
- **不想重复抽到同一张**：改 `pickCardByRarity()` 过滤 `memory.collected[idx]` 即可。

## 🔒 安全

- 飞书 App Secret 永远不要写进 HTML 或提交到仓库，请用云函数/Worker 的环境变量注入。
- GitHub token 用完 Revoke，不要内嵌在 git remote URL 里。
- 如果传到公开仓库，避免写真实生日、真实密码等个人敏感信息。

## 相关文件速查

- 工作流与 Agent 调用规范：[SKILL.md](./SKILL.md)
- 单文件 HTML 模板：[templates/fortune.html](./templates/fortune.html)
- 腾讯云函数中转：[templates/scf-handler.js](./templates/scf-handler.js)
- 飞书多维表格字段：[templates/bitable-setup.md](./templates/bitable-setup.md)
