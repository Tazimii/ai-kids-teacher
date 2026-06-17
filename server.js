/* ============================================
   server.js — 本地开发服务器 + API代理
   零依赖，纯 Node.js 内置模块
   ============================================ */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ---- 配置 ----
const PORT = process.env.PORT || 3001;
const STATIC_DIR = __dirname;  // 当前目录即静态文件根目录

// DeepSeek API 配置（从 settings.json 读取）
const DEEPSEEK_TOKEN = 'sk-9c5f573141194f9b82b961bc6dca6c10';
const DEEPSEEK_BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-v4-pro';

// ---- MIME 类型 ----
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
};

// ---- 静态文件服务 ----
function serveStatic(req, res) {
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(STATIC_DIR, filePath);

  // 安全检查：防止路径遍历
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA fallback: 返回 index.html
        fs.readFile(path.join(STATIC_DIR, 'index.html'), (e2, d2) => {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(e2 ? 'Not Found' : d2);
        });
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// ---- API 代理 ----
function proxyChat(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // 读取请求体
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    // 强制限制 max_tokens（儿童场景，但要给reasoning模型留空间）
    if (parsed.max_tokens > 1024) parsed.max_tokens = 1024;
    if (!parsed.max_tokens || parsed.max_tokens < 200) parsed.max_tokens = 512;

    // 转发到 DeepSeek
    const postData = JSON.stringify(parsed);
    const url = new URL('/v1/chat/completions', DEEPSEEK_BASE);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_TOKEN}`,
        'Accept': parsed.stream ? 'text/event-stream' : 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      // 转发响应头
      const headers = {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      };
      res.writeHead(proxyRes.statusCode, headers);

      // 流式转发
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'AI服务暂时不可用，请稍后再试~' }));
    });

    proxyReq.write(postData);
    proxyReq.end();
  });
}

// ---- 主服务器 ----
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 路由
  if (req.url === '/api/chat') {
    proxyChat(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('🤖 小智的AI教室 开发服务器');
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   按 Ctrl+C 停止`);
  console.log('');
});
