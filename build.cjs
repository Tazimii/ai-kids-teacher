/* build.cjs -- 把所有 JS 模块打包成单个普通脚本（无 ES module） */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// 依赖顺序（后面的依赖前面的）
const files = [
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

let output = '';

for (const f of files) {
  let code = fs.readFileSync(path.join(ROOT, f), 'utf8');

  // 移除多行 import { ... } from '...'
  code = code.replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;?/g, '// [import]');
  // 移除单行 import xxx from '...'
  code = code.replace(/^import\s+.*$/gm, '// [import]');

  // 移除 export 关键字（保留声明）
  code = code.replace(/^export\s+(const|let|var|class|function|async\s+function)\s+/gm, '$1 ');

  // 移除 export default
  code = code.replace(/^export\s+default\s+/gm, '');

  // 移除 export { ... }
  code = code.replace(/^export\s+\{[\s\S]*?\}\s*;?\s*$/gm, '// [export]');

  output += '\n// ====== ' + f + ' ======\n';
  output += code;
}

// 包装：所有变量共享同一个函数作用域
output = '(function(){\n"use strict";\n' + output + '\n})();';

fs.writeFileSync(path.join(ROOT, 'js', 'bundle.js'), output);
console.log('Bundle created:', output.length, 'chars');
