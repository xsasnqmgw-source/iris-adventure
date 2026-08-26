---
name: "fortune-draw"
description: "一键生成抽卡/送心意 HTML 网页，支持花盘绽放仪式感、稀有度概率、限定/特殊/传说、签到温度阶梯、收集册+共同记忆存档，并可一键上线 GitHub Pages。Invoke when 你需要为某人快速做一套「专属抽卡/扭蛋/翻卡」网页或线上小礼物。"
---

# Fortune Draw · 专属抽卡生成器

给 TA 做一页**有仪式感的专属抽卡小礼物**，不用写代码：花瓣绽放→点花蕊翻卡→稀有度动画→温度尾句→收集册存档→（可选）后台多维表格记录 + 群提醒。

模板默认「鸢尾紫」主题，内置「一句心意 / 今天去哪儿 / 小小挑战」三大卡池 + UR 传说 + 节气/月份限定 + 特殊日专属。复制模板、改文案、改两个占位符 → 直接本地打开或丢 GitHub Pages 上线。

## 何时调用

当出现以下需求立刻用本 skill：
- 想给某个人（恋人/朋友/自己）做一个**专属抽卡网页 / 翻卡页 / 心意收集册**
- 需要「一页 HTML，不需要后端，但能 GitHub Pages 公开访问」
- 需要有**稀有度、限定卡、特殊日仪式感、温度递进、收集册**等玩法
- 希望加**后台记录 / 飞书群提醒**（可选，不配置不影响玩法）

## 调用方式建议

调用者（Agent）的标准工作流：

1. 问清 3 件事，写下来：
   - **给谁**的（昵称/称呼）→ 替换 `{{__BRAND__}}`（页头品牌名 + 锁屏幕标题）
   - **初识日期**：年月日 → 替换模板里 `var FIRST_MET = { year, month, day }` 和 `var SPECIAL_DAY_DATE = { month, day }`
   - **要不要密码锁**：要的话留着 `#lockScreen` 区块和 `CORRECT_PASSWORD`，不要就删掉这两块
2. 复制 `templates/fortune.html` 到目标项目，把上面 3 项改完
3. 想改卡片内容就改 `CARDS / HIDDEN_CARDS / SEASONAL_CARDS / MONTHLY_CARDS / SPECIAL_CARDS / DAILY_FORTUNES / IRIS_MOMENTS` 这几个数组（都在 `<script>` 开头前半部分，集中在一起）
4. 想改主题色改 CSS `:root` 里的 3 个品牌变量（`--brand / --brand-soft / --brand-deep`）
5. 如果要接「后台记录 + 群提醒」：
   - 看 `templates/bitable-setup.md` 建飞书多维表格；
   - 用 `templates/scf-handler.js` 部署腾讯云函数（大陆网络可达）或 Cloudflare Worker（海外）；
   - 拿到中转函数 URL → 填回模板里 `var REPORT_ENDPOINT = '{{__REPORT_ENDPOINT__}}'` 那个占位符
6. **上线**（推荐 GitHub Pages，最简单免费）

## 可复用模板文件清单

```
templates/
├── fortune.html         主模板 · 一页单文件 HTML，直接本地双击即可预览
├── scf-handler.js       腾讯云函数中转（零依赖、粘贴即用），给前端上报 → 飞书写表 + 推群
└── bitable-setup.md     飞书多维表格字段清单 + 自建应用需要的 scopes
```

> 如果你部署海外、想用 Cloudflare Worker 替代 SCF，Worker 的 handler 写法和 `scf-handler.js` 结构一模一样，只是把 `exports.main_handler = async (event) => { ... }` 改成 `export default { async fetch(req) { ... } }`，读取 body 的 API 换成 `await req.json()`。逻辑和常量完全复用。

## 模板占位符清单（改完就好）

| 占位符 / 位置 | 出现次数 | 要改成什么 |
| --- | --- | --- |
| `{{__BRAND__}}` | 3 处（锁屏幕标题 / 页头品牌 / 品牌按钮） | TA 的昵称，比如「IRIS」「她」「小宝」「晚安站」 |
| `{{__REPORT_ENDPOINT__}}` | 1 处（`var REPORT_ENDPOINT`） | 不接后台就留着模板原样，代码会判断空/占位符并**静默跳过**；接后台就填中转函数的公网 URL（腾讯函数 URL 或 Worker URL） |
| `var FIRST_MET = { year, month, day }` | 1 处 | 真实的初见年月日（影响「初见纪念」卡触发日 + 相识第几天） |
| `var SPECIAL_DAY_DATE = { month, day }` | 1 处 | 你想定义「特别的日子」，比如 TA 的生日或某纪念日 |
| `var CORRECT_PASSWORD` | 1 处 | 首页密码锁的正确答案（默认 `0605`）。想去掉锁：删除 HTML 里 `#lockScreen` 整块，以及 `<script>` 里所有与 `lockScreen / lockBtn / lockInput / lockError / iris_logged_in / tryUnlock / recordVisit / showVisitLog` 相关的初始化 |

## 「上线 GitHub Pages」30 秒步骤

这是让页面获得一个**公开链接**的最快方法，别人通过浏览器就能打开。

### A. 纯浏览器上传（最简单，不用 git）

1. 新建 GitHub 仓库，名字随便起，**Public**（要 Private + Pages 也行，但 Public 更省事）
2. 仓库根目录建一个文件夹 `to-you`（名字随意），把改完的 `fortune.html` 传进去，**重命名为 `index.html`**
3. GitHub → 仓库 → Settings → Pages → Source 选「**Deploy from a branch**」→ Branch 选 `main` / `/` 根 → Save
4. 等 1~3 分钟，页面就会告诉你生成的网址，形如：
   ```
   https://<你的用户名>.github.io/<仓库名>/to-you/
   ```
5. 把这个链接发给 TA，浏览器打开就能玩。

### B. 本地 git（适合后续经常改）

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库>.git
git push -u origin main
```
然后还是仓库 Settings → Pages 选 main 分支。

## 「后台记录 + 群提醒」配置摘要

只在你需要「她一打开/抽卡，我这边能看到明细」时才做：

1. 飞书开放平台 → 新建自建应用（随便起名），拿到 `App ID / App Secret`；
2. 按 `templates/bitable-setup.md` 建多维表格和字段；
3. 把应用拉进你想接收提醒的飞书群；
4. 用 `templates/scf-handler.js` 部署一个腾讯云函数（函数 URL 触发器，鉴权 NONE，超时 30s，环境变量 `APP_SECRET` 填飞书 App Secret）；
5. 把函数 URL 填回模板 `REPORT_ENDPOINT`；
6. 把新的 `index.html` 重新推到 GitHub（同 A.1-5 步），完成。

## 前端事件与通知策略（写死在模板里，默认就是这样）

| 事件 | 记不记录 | 群里推不推 |
| --- | --- | --- |
| 打开（任意次） | ✅ 记「打开应用」 | 不推（避免骚扰） |
| 今日首次来访 | ✅ 记「签到」+ 连续天数 + 累计次数 + 今日签语 | ✅ 推送摘要 |
| 普通抽卡 | ✅ 记「抽卡」+ 卡名 + 稀有度 | 仅 UR/SSR 推送 |
| 限定卡 | ✅ 记「抽卡」+ 卡名 | 推送「限定」标记 |
| 特殊日专属卡 | ✅ 记「特别日」+ 卡名 | ✅ 推送 ✦ 特别标记 |

## 常见改动点速查

- **想把花盘动画关了**：删除 `<script>` 里所有与 `buildFlower / withDrawState / restoreFlower / orbitStage / petals / stamen` 相关的代码和 CSS，把 `#btnDraw` 直接接 `doDraw()`。
- **想换配色**：改 CSS `:root` 三个品牌变量 + `.r-UR / .r-SSR / .r-SR / .r-R` 四个稀有度颜色块。
- **想加更多卡**：只管往 `CARDS / HIDDEN_CARDS / SEASONAL_CARDS / MONTHLY_CARDS / SPECIAL_CARDS` 对应数组里 push 对象，其他逻辑自动适配。
- **想改抽卡概率**：改 `pickRarity()` 里的 `p.UR / p.SSR / p.SR`，默认 5/15/30，连签 ≥2 天 UR/SSR 翻倍，连签 ≥5 天再翻倍并保底。
- **想让某张卡绝对不出重复**：目前是「已收集标记去过了」，但抽卡仍然会抽到（制造「又翻到了它」的回忆感）。想改成不重复，改 `pickCardByRarity` 过滤 `memory.collected[i]`。

## 安全提示

- **不要把 App Secret / Token 写进 HTML 或仓库里**。SCF/Worker 用「环境变量」注入。token 用完就 Revoke。
- 如果把代码传到公共仓库，不要在 commit 消息或文件里写真实生日/密码等隐私，这些只保留在你本地改好的最终版本里。
