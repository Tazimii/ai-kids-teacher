/* ============================================
   api/chat.js — Vercel Serverless Function
   代理 DeepSeek API，隐藏 API Key
   ============================================ */

// DeepSeek API 配置
const DEEPSEEK_TOKEN = process.env.DEEPSEEK_TOKEN || 'sk-9c5f573141194f9b82b961bc6dca6c10';
const DEEPSEEK_BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-v4-pro';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, max_tokens, temperature, stream } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages required' });
  }

  // 限制 token
  let maxTokens = max_tokens || 512;
  if (maxTokens > 1024) maxTokens = 1024;
  if (maxTokens < 200) maxTokens = 512;

  try {
    const response = await fetch(`${DEEPSEEK_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_TOKEN}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: temperature ?? 0.75,
        stream: stream ?? false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek error:', response.status, errText);
      return res.status(502).json({ error: 'AI服务暂时不可用，请稍后再试~' });
    }

    // 非流式：直接返回 JSON
    if (!stream) {
      const data = await response.json();
      return res.status(200).json(data);
    }

    // 流式：透传 SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // 过滤 reasoning_content（DeepSeek V4推理token）
      // 在SSE层面不需要过滤，agent.js前端会处理
      res.write(chunk);
    }

    res.end();
  } catch (err) {
    console.error('Proxy error:', err.message);
    return res.status(502).json({ error: 'AI服务连接失败，请稍后再试~' });
  }
}
