// scripts/setup-sqljs.js
const fs = require('fs');
const path = require('path');

// Створюємо публічну папку, якщо її немає
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Created public directory');
}

// Шляхи до вихідного та цільового файлів
const sourcePath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const targetPath = path.join(publicDir, 'sql-wasm.wasm');

try {
  // Перевіряємо, чи існує вихідний файл
  if (!fs.existsSync(sourcePath)) {
    console.error('SQL.js WebAssembly file not found. Make sure sql.js is installed.');
    console.error('Run: npm install sql.js');
    process.exit(1);
  }

  // Копіюємо файл
  fs.copyFileSync(sourcePath, targetPath);
  console.log('✅ SQL.js WebAssembly file copied to public directory');
  console.log(`📁 Source: ${sourcePath}`);
  console.log(`📁 Target: ${targetPath}`);
} catch (error) {
  console.error('❌ Failed to copy SQL.js WebAssembly file:', error.message);
  process.exit(1);
}