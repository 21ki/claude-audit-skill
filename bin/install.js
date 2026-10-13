#!/usr/bin/env node
/**
 * Claude Code Command Audit Hook - One-Click Installer
 * Author: 21ki (https://github.com/21ki)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const HOOKS_DIR = path.join(CLAUDE_DIR, 'hooks');
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');
const TARGET_SCRIPT = path.join(HOOKS_DIR, 'log-commands.py');
const SOURCE_SCRIPT = path.join(__dirname, '..', 'scripts', 'log-commands.py');

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[32m%s\x1b[0m', '🚀 正在为当前设备安装 Claude Code 命令审计与防泄密 Hook...');
console.log('\x1b[36m%s\x1b[0m', '=======================================================');

// 1. 确保 ~/.claude/hooks 目录存在
if (!fs.existsSync(HOOKS_DIR)) {
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
  console.log(`✅ 已创建目录: ${HOOKS_DIR}`);
}

// 2. 复制 log-commands.py
if (!fs.existsSync(SOURCE_SCRIPT)) {
  console.error(`❌ 错误：未找到源脚本 ${SOURCE_SCRIPT}`);
  process.exit(1);
}

fs.copyFileSync(SOURCE_SCRIPT, TARGET_SCRIPT);
fs.chmodSync(TARGET_SCRIPT, 0o755);
console.log(`✅ 已部署审计脚本: ${TARGET_SCRIPT}`);

// 3. 读取并合并 ~/.claude/settings.json
let settings = {};
if (fs.existsSync(SETTINGS_FILE)) {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    settings = JSON.parse(raw);
  } catch (err) {
    console.warn(`⚠️ 解析现有 settings.json 出现警告，将进行安全合并: ${err.message}`);
  }
}

if (!settings.hooks) {
  settings.hooks = {};
}
if (!settings.hooks.PreToolUse) {
  settings.hooks.PreToolUse = [];
}

const HOOK_CMD = 'python3 ~/.claude/hooks/log-commands.py';

// 检查是否已经存在该 hook 配置
let bashHookGroup = settings.hooks.PreToolUse.find(
  (group) => group.matcher === 'Bash'
);

if (!bashHookGroup) {
  bashHookGroup = {
    matcher: 'Bash',
    hooks: []
  };
  settings.hooks.PreToolUse.push(bashHookGroup);
}

const alreadyConfigured = bashHookGroup.hooks.some(
  (h) => h.command && h.command.includes('log-commands.py')
);

if (!alreadyConfigured) {
  bashHookGroup.hooks.push({
    type: 'command',
    command: HOOK_CMD
  });
  console.log('✅ 已向 settings.json 成功注册 PreToolUse (Bash) 钩子！');
} else {
  console.log('ℹ️ settings.json 中已存在 log-commands.py 钩子，无需重复添加。');
}

// 4. 写回 settings.json
fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
console.log(`✅ 已成功保存配置: ${SETTINGS_FILE}`);

console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------------------');
console.log('\x1b[32m%s\x1b[0m', '🎉 安装大功告成！全量命令审计与安全脱敏已在当前设备生效！');
console.log('\x1b[33m%s\x1b[0m', '💡 常用审计查阅命令：');
console.log('   tail -f ~/.claude/command_audit.log');
console.log('\x1b[36m%s\x1b[0m', '=======================================================');
