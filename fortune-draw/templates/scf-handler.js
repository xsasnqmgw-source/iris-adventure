'use strict';

// Fortune Draw · 腾讯云函数（SCF）中转服务
// 链路：前端 POST → 这里 → 飞书：换 token → ① 写多维表格  ②（可选）推送群提醒
// 依赖：仅 Node 内置 https。粘贴到腾讯云函数代码编辑器即可用，不需要 npm。
// 敏感信息请放在函数「环境变量」APP_SECRET，不要写进代码。

const https = require('https');

// ===== 【模板提示】按你自己的飞书资源改这 4 个常量 =====
const APP_ID     = 'cli_xxxxxxxxxxxxxxxx';   // 飞书自建应用 App ID
const BASE_TOKEN = 'bascnXXXXXXXXXXXXXXXXXX'; // 多维表格 app_token（bitable URL 里那一段）
const TABLE_ID   = 'tblXXXXXXXXXXXX';         // 数据表 table_id
const CHAT_ID    = 'oc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // 机器人所在群的 chat_id

// 前端事件 → 表格「事件」单选字段
const EVENT_MAP = {
  open:    '打开应用',
  draw:    '抽卡',
  daily:   '签到',
  special: '特别日',
  limited: '抽卡',
};

// 字段名要和你飞书多维表格里的「显示名称」严格一致，否则写记录失败
const FIELD_TIME       = '时间';
const FIELD_EVENT      = '事件';
const FIELD_CARD       = '卡片';
const FIELD_RARITY     = '稀有度';
const FIELD_STREAK     = '连续签到';
const FIELD_TOTAL      = '累计次数';
const FIELD_PROGRESS   = '收集进度';
const FIELD_NOTE       = '备注';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function resp(code, obj) {
  return {
    isBase64Encoded: false,
    statusCode: code,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS_HEADERS),
    body: JSON.stringify(obj),
  };
}

function httpsPost(hostname, path, headers, postData) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(postData);
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: Object.assign(
          { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
          headers
        ),
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('非JSON响应: ' + data)); }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function getTenantToken(secret) {
  const j = await httpsPost(
    'open.feishu.cn',
    '/open-apis/auth/v3/tenant_access_token/internal',
    {},
    { app_id: APP_ID, app_secret: secret }
  );
  if (j.code !== 0) throw new Error('换取token失败: ' + (j.msg || j.code));
  return j.tenant_access_token;
}

async function writeRecord(token, fields) {
  const j = await httpsPost(
    'open.feishu.cn',
    `/open-apis/bitable/v1/apps/${BASE_TOKEN}/tables/${TABLE_ID}/records/batch_create`,
    { Authorization: 'Bearer ' + token },
    { records: [{ fields }] }
  );
  if (j.code !== 0) throw new Error('写记录失败: ' + (j.msg || j.code));
  return j;
}

async function sendMessage(token, text) {
  const j = await httpsPost(
    'open.feishu.cn',
    '/open-apis/im/v1/messages?receive_id_type=chat_id',
    { Authorization: 'Bearer ' + token },
    { receive_id: CHAT_ID, msg_type: 'text', content: JSON.stringify({ text: String(text) }) }
  );
  if (j.code !== 0) throw new Error('发消息失败: ' + (j.msg || j.code));
  return j;
}

exports.main_handler = async (event) => {
  // API 网关 CORS 预检
  if (event.httpMethod === 'OPTIONS') {
    return { isBase64Encoded: false, statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  let body;
  try {
    let raw = event.body;
    if (event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8');
    body = JSON.parse(raw);
  } catch (e) {
    return resp(400, { ok: false, error: 'invalid json' });
  }

  const fields = {};
  fields[FIELD_TIME]     = body.timeMs || Date.now();
  fields[FIELD_EVENT]    = EVENT_MAP[body.event] || '打开应用';
  if (body.card != null && body.card !== '') fields[FIELD_CARD]     = String(body.card);
  if (body.rarity)                                fields[FIELD_RARITY]   = String(body.rarity);
  if (body.consecutiveDays != null)               fields[FIELD_STREAK]   = Number(body.consecutiveDays);
  if (body.visitCount != null)                    fields[FIELD_TOTAL]    = Number(body.visitCount);
  if (body.collectionProgress)                    fields[FIELD_PROGRESS] = String(body.collectionProgress);
  if (body.note)                                  fields[FIELD_NOTE]     = String(body.note);

  try {
    const token = await getTenantToken(process.env.APP_SECRET);
    await writeRecord(token, fields);
    if (body.notify && body.message) {
      await sendMessage(token, body.message);
    }
    return resp(200, { ok: true });
  } catch (e) {
    return resp(500, { ok: false, error: e.message });
  }
};
