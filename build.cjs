/* build.cjs -- 把所有 JS 和 CSS 内联到 HTML */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ---- 读取 CSS ----
const cssFiles = ['css/main.css', 'css/animations.css', 'css/components.css'];
let allCSS = '';
for (const f of cssFiles) {
  allCSS += fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n';
}

// ---- 读取 JS 并打包 ----
const jsFiles = [
  'js/utils.js',
  'js/config.js',
  'js/storage.js',
  'js/safety.js',
  'js/character.js',
  'js/agent.js',
  'js/gamification.js',
  'js/courses.js',
  'js/app.js',
];

let allJS = '';
for (const f of jsFiles) {
  let code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  // 移除多行/单行 import
  code = code.replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;?/g, '');
  code = code.replace(/^import\s+.*$/gm, '');
  // 移除 export 关键字
  code = code.replace(/^export\s+(const|let|var|class|function|async\s+function)\s+/gm, '$1 ');
  code = code.replace(/^export\s+default\s+/gm, '');
  code = code.replace(/^export\s+\{[\s\S]*?\}\s*;?\s*$/gm, '');
  allJS += '\n// ====== ' + f + ' ======\n' + code;
}

// ---- 读取 HTML 模板 ----
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 替换 CSS link 为内联 style
html = html.replace(
  /<!-- CSS -->[\s\S]*?<\/head>/,
  '<style>\n' + allCSS + '\n</style>\n</head>'
);

// 替换外部 script 为内联 script
html = html.replace(
  /<script src="js\/bundle\.js"><\/script>/,
  '<script>\n' + allJS + '\n</script>'
);

// 也移除旧的 module 引用（如果还存在）
html = html.replace(/<script type="module" src="[^"]+"><\/script>/g, '');

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('Built index.html with inline CSS+JS');
console.log('CSS size:', allCSS.length, 'chars');
console.log('JS size:', allJS.length, 'chars');
console.log('Total:', html.length, 'chars');
