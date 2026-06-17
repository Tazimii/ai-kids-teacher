/* build.cjs -- 把所有 JS 和 CSS 内联到 HTML，含紧急点击处理 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// 读取 CSS
const cssFiles = ['css/main.css', 'css/animations.css', 'css/components.css'];
let allCSS = '';
for (const f of cssFiles) {
  allCSS += fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n';
}

// 读取 JS 并打包
const jsFiles = [
  'js/utils.js', 'js/config.js', 'js/storage.js', 'js/safety.js',
  'js/character.js', 'js/agent.js', 'js/gamification.js', 'js/courses.js',
  'js/app.js',
];

let allJS = '';
for (const f of jsFiles) {
  let code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  code = code.replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;?/g, '');
  code = code.replace(/^import\s+.*$/gm, '');
  code = code.replace(/^export\s+(const|let|var|class|function|async\s+function)\s+/gm, '$1 ');
  code = code.replace(/^export\s+default\s+/gm, '');
  code = code.replace(/^export\s+\{[\s\S]*?\}\s*;?\s*$/gm, '');
  allJS += '\n// ' + f + '\n' + code;
}

// 紧急备用点击处理（不依赖主JS逻辑）
const fallbackJS = `
document.title = 'READY';
setTimeout(function(){
  var btns=document.querySelectorAll('.age-btn');
  btns.forEach(function(b){
    b.onclick=function(){
      b.style.background='#4CAF50';b.style.color='#fff';b.textContent='OK!';
      setTimeout(function(){
        var g=document.getElementById('ageGate');
        var a=document.getElementById('app');
        if(g)g.classList.remove('active');
        if(a)a.style.display='';
      },300);
    };
  });
},500);
`;

// 读取 HTML
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 替换 CSS links 为内联 style
html = html.replace(
  /<!-- CSS -->[\s\S]*?<\/head>/,
  '<style>\n' + allCSS + '\n</style>\n</head>'
);

// 替换 bundle.js script 为内联 JS + 备用处理
html = html.replace(
  /<script src="js\/bundle\.js"><\/script>/,
  '<script>\n' + allJS + '\n</script>\n<script>\n' + fallbackJS + '\n</script>'
);

// 移除旧的 module script（如果有）
html = html.replace(/<script type="module" src="[^"]+"><\/script>/g, '');

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('Built: CSS=' + allCSS.length + ' JS=' + allJS.length + ' Total=' + html.length);
