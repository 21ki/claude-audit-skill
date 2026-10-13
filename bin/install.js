#!/usr/bin/env node
/**
 * Claude Code Command Audit & Troubleshooter Suite - One-Click Installer
 * Author: 21ki (https://github.com/21ki)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const HOOKS_DIR = path.join(CLAUDE_DIR, 'hooks');
const PROFILES_DIR = path.join(CLAUDE_DIR, 'profiles');
const AGENTS_DIR = path.join(CLAUDE_DIR, 'agents');
const TMP_DIR = path.join(HOME, 'tmp');

const CLAUDE_JSON_FILE = path.join(HOME, '.claude.json');
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');
const TARGET_SCRIPT = path.join(HOOKS_DIR, 'log-commands.py');
const TARGET_AGENT = path.join(AGENTS_DIR, 'troubleshooter.md');
const TARGET_PROFILE = path.join(PROFILES_DIR, 'troubleshoot.json');
const TARGET_CC = path.join(TMP_DIR, 'cc.sh');

const PKG_ROOT = path.join(__dirname, '..');
const SOURCE_SCRIPT = path.join(PKG_ROOT, 'scripts', 'log-commands.py');
const SOURCE_AGENT = path.join(PKG_ROOT, 'agents', 'troubleshooter.md');
const SOURCE_PROFILE = path.join(PKG_ROOT, 'profiles', 'troubleshoot.json');
const SOURCE_SETTINGS = path.join(PKG_ROOT, 'configs', 'settings.json');
const SOURCE_CC = path.join(PKG_ROOT, 'cc.sh');
const SOURCE_CLAUDE_JSON = path.join(PKG_ROOT, 'configs', 'claude.json');

console.log('\x1b[36m%s\x1b[0m', '================================================================');
console.log('\x1b[32m%s\x1b[0m', '🚀 正在为当前设备全自动装配 Claude Code 审计与 Troubleshooter 套件...');
console.log('\x1b[36m%s\x1b[0m', '================================================================');

// 1. 确保基础目录存在 (~/.claude/hooks, profiles, agents 以及 ~/tmp)
const dirsToCreate = [HOOKS_DIR, PROFILES_DIR, AGENTS_DIR, TMP_DIR];
for (const dir of dirsToCreate) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 已创建目录: ${dir}`);
  }
}

// 2. 部署 log-commands.py
if (fs.existsSync(SOURCE_SCRIPT)) {
  fs.copyFileSync(SOURCE_SCRIPT, TARGET_SCRIPT);
  fs.chmodSync(TARGET_SCRIPT, 0o755);
  console.log(`✅ 已部署 1GB 持久归档审计脚本: ${TARGET_SCRIPT}`);
}

// 3. 部署 troubleshooter.md 专家代理
if (fs.existsSync(SOURCE_AGENT)) {
  fs.copyFileSync(SOURCE_AGENT, TARGET_AGENT);
  console.log(`✅ 已部署 Troubleshooter 专家画像: ${TARGET_AGENT}`);
}

// 4. 部署 troubleshoot.json Profile
if (fs.existsSync(SOURCE_PROFILE)) {
  fs.copyFileSync(SOURCE_PROFILE, TARGET_PROFILE);
  console.log(`✅ 已部署 Troubleshoot (xhigh) Profile: ${TARGET_PROFILE}`);
}

// 5. 部署 ~/tmp/cc.sh 并赋予执行权限
if (fs.existsSync(SOURCE_CC)) {
  fs.copyFileSync(SOURCE_CC, TARGET_CC);
  fs.chmodSync(TARGET_CC, 0o755);
  console.log(`✅ 已部署启动脚本 (默认工作目录 ~/tmp): ${TARGET_CC}`);
}

// 6. 自动预置 ~/.claude.json (跳过 Dark mode、引导条款)
try {
  let claudeJson = {};
  if (fs.existsSync(CLAUDE_JSON_FILE)) {
    try {
      claudeJson = JSON.parse(fs.readFileSync(CLAUDE_JSON_FILE, 'utf8'));
    } catch (_) {}
  }
  claudeJson.hasCompletedOnboarding = true;
  if (!claudeJson.theme) {
    claudeJson.theme = 'dark';
  }
  fs.writeFileSync(CLAUDE_JSON_FILE, JSON.stringify(claudeJson, null, 2), 'utf8');
  console.log(`✅ 已配置 ~/.claude.json (自动跳过首次引导与 Dark mode 设置)`);
} catch (e) {
  console.warn(`⚠️ 写入 ~/.claude.json 提示: ${e.message}`);
}

// 7. 读取并合并 ~/.claude/settings.json (包含安全策略、CPA 环境配置、Hook)
let baseTemplate = {};
if (fs.existsSync(SOURCE_SETTINGS)) {
  try {
    baseTemplate = JSON.parse(fs.readFileSync(SOURCE_SETTINGS, 'utf8'));
  } catch (_) {}
}

let userSettings = {};
if (fs.existsSync(SETTINGS_FILE)) {
  try {
    userSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch (err) {
    console.warn(`⚠️ 解析现有 settings.json 出现警告，将进行深度合并: ${err.message}`);
  }
}

// 深度合并设置
const mergedSettings = {
  ...baseTemplate,
  ...userSettings,
  env: {
    ...(baseTemplate.env || {}),
    ...(userSettings.env || {})
  },
  permissions: {
    ...(baseTemplate.permissions || {}),
    ...(userSettings.permissions || {})
  },
  hooks: {
    ...(baseTemplate.hooks || {}),
    ...(userSettings.hooks || {})
  }
};

// 确保 deny 权限列表完整
if (baseTemplate.permissions && baseTemplate.permissions.deny) {
  const existingDeny = new Set(mergedSettings.permissions.deny || []);
  for (const item of baseTemplate.permissions.deny) {
    existingDeny.add(item);
  }
  mergedSettings.permissions.deny = Array.from(existingDeny);
}

// 确保 Bash log-commands.py 钩子被注册
if (!mergedSettings.hooks.PreToolUse) {
  mergedSettings.hooks.PreToolUse = [];
}
let bashGroup = mergedSettings.hooks.PreToolUse.find((g) => g.matcher === 'Bash');
if (!bashGroup) {
  bashGroup = { matcher: 'Bash', hooks: [] };
  mergedSettings.hooks.PreToolUse.push(bashGroup);
}
const HOOK_CMD = 'python3 ~/.claude/hooks/log-commands.py';
if (!bashGroup.hooks.some((h) => h.command && h.command.includes('log-commands.py'))) {
  bashGroup.hooks.push({ type: 'command', command: HOOK_CMD });
}

fs.writeFileSync(SETTINGS_FILE, JSON.stringify(mergedSettings, null, 2), 'utf8');
console.log(`✅ 已成功装配核心配置: ${SETTINGS_FILE}`);

console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------------');
console.log('\x1b[32m%s\x1b[0m', '🎉 全部套件安装完成！新设备现已就绪：');
console.log('   1. 专属启动脚本：~/tmp/cc.sh (直接运行即可秒级拉起满血环境)');
console.log('   2. 自动工作目录：~/tmp/');
console.log('   3. 故障排查专家：troubleshooter (已绑定 --effort xhigh 极致推理)');
console.log('   4. 全量命令审计：~/.claude/command_audit.log (1GB 自动时间戳归档)');
console.log('\x1b[36m%s\x1b[0m', '================================================================');
