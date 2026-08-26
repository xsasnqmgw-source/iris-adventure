# 多维表格 · 字段清单（按此建好 → 把 app_token / table_id 填进 scf-handler.js）

建议新建 1 张多维表格，然后在默认表里新增下面 8 个字段。**字段名必须和下面一模一样**（因为飞书写记录按字段名精确匹配，差一个空格或标点就失败）。

| 顺序 | 字段显示名 | 字段类型 | 格式/选项 |
| --- | --- | --- | --- |
| 1 | 时间         | 日期时间   | `yyyy-MM-dd HH:mm`（默认即可） |
| 2 | 事件         | 单选       | `打开应用` · `签到` · `抽卡` · `特别日`  （后面两个是事件映射，不写进选项也没事，但建议加上方便筛） |
| 3 | 卡片         | 文本       | — |
| 4 | 稀有度       | 单选       | `UR` · `SSR` · `SR` · `R` · `特别` |
| 5 | 连续签到     | 数字       | 整数 |
| 6 | 累计次数     | 数字       | 整数 |
| 7 | 收集进度     | 文本       | （形如 `12/42`） |
| 8 | 备注         | 文本       | — |

建完后：

1. **拿 bitable app_token**：浏览器地址栏里 `https://xxx.feishu.cn/base/xxxxxxxx`，`base/` 后面到下一个 `/` 或 `?` 之前那段就是 app_token（形如 `bascnXXXX`）。
2. **拿 table_id**：在多维表格里切到那张表（通常是默认建的第 1 张），地址栏里 `table=tblXXXXXXXXXXXX` 那段，`tbl` 开头就是 table_id。
3. 把这两个值 + 你的 `APP_ID` + 群 `CHAT_ID` 一并填进 `templates/scf-handler.js` 的 4 个常量里。

## 推荐的 scopes（给自建应用）
机器人身份（--as bot）需要开通：

- `bitable:app:create`（可选，只想建表时用）
- `bitable:app:read_write`（必须，写记录）
- `im:message`（必须，群里发消息）
- `im:message:send_as_bot`（必须，以应用身份发消息）
- 查找群 chat_id 时可能用到：`im:chat`（读群列表，可选）

这些 scope 都在飞书开放平台 → 应用 → 权限管理 里开通。
