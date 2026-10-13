#!/usr/bin/env node
/**
 * Claude Code Command Audit & Troubleshooter Suite - CLI (install / uninstall / status)
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

const args = process.argv.slice(2);
const command = args[0] || 'install';
const isForce = args.includes('--force') || args.includes('-f');

function printBanner(title) {
  console.log('\x1b[36m%s\x1b[0m', '================================================================');
  console.log('\x1b[32m%s\x1b[0m', `🚀 ${title}`);
  console.log('\x1b[36m%s\x1b[0m', '================================================================');
}

// -----------------------------------------------------------------------------
// 1. INSTALL
// -----------------------------------------------------------------------------
function doInstall() {
  printBanner('正在为当前设备全自动装配 Claude Code 审计与 Troubleshooter 套件...');

  // 1. 创建基础目录
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

  // 3. 部署 troubleshooter.md 专家画像
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

  // 6. 自动预置 ~/.claude.json (跳过 Dark mode 与引导条款)
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

  // 7. 装配 ~/.claude/settings.json
  let baseTemplate = {};
  if (fs.existsSync(SOURCE_SETTINGS)) {
    try {
      baseTemplate = JSON.parse(fs.readFileSync(SOURCE_SETTINGS, 'utf8'));
    } catch (_) {}
  }

  let finalSettings = {};
  if (isForce || !fs.existsSync(SETTINGS_FILE)) {
    // 强制模式或文件不存在：直接使用完整模版
    finalSettings = JSON.parse(JSON.stringify(baseTemplate));
  } else {
    // 合并模式：读取现有 settings.json 并融合模版
    try {
      finalSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    } catch (_) {
      finalSettings = {};
    }

    // 确保 env 端点存在
    finalSettings.env = {
      ...(baseTemplate.env || {}),
      ...(finalSettings.env || {})
    };

    // 确保 cleanupPeriodDays 和 tui 存在
    if (baseTemplate.cleanupPeriodDays) {
      finalSettings.cleanupPeriodDays = baseTemplate.cleanupPeriodDays;
    }
    if (baseTemplate.tui) {
      finalSettings.tui = baseTemplate.tui;
    }

    // 融合安全 deny 规则
    if (baseTemplate.permissions && baseTemplate.permissions.deny) {
      if (!finalSettings.permissions) finalSettings.permissions = {};
      const existingDeny = new Set(finalSettings.permissions.deny || []);
      for (const item of baseTemplate.permissions.deny) {
        existingDeny.add(item);
      }
      finalSettings.permissions.deny = Array.from(existingDeny);
    }

    // 确保 Bash log-commands.py 钩子被注册
    if (!finalSettings.hooks) finalSettings.hooks = {};
    if (!finalSettings.hooks.PreToolUse) finalSettings.hooks.PreToolUse = [];
    let bashGroup = finalSettings.hooks.PreToolUse.find((g) => g.matcher === 'Bash');
    if (!bashGroup) {
      bashGroup = { matcher: 'Bash', hooks: [] };
      finalSettings.hooks.PreToolUse.push(bashGroup);
    }
    const HOOK_CMD = 'python3 ~/.claude/hooks/log-commands.py';
    if (!bashGroup.hooks.some((h) => h.command && h.command.includes('log-commands.py'))) {
      bashGroup.hooks.push({ type: 'command', command: HOOK_CMD });
    }
  }

  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(finalSettings, null, 2), 'utf8');
  console.log(`✅ 已成功装配核心配置: ${SETTINGS_FILE}`);

  console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------------');
  console.log('\x1b[32m%s\x1b[0m', '🎉 全部套件安装完成！新设备现已就绪：');
  console.log('   1. 专属启动脚本：~/tmp/cc.sh (直接运行即可秒级拉起满血环境)');
  console.log('   2. 自动工作目录：~/tmp/');
  console.log('   3. 故障排查专家：troubleshooter (已绑定 --effort xhigh 极致推理)');
  console.log('   4. 全量命令审计：~/.claude/command_audit.log (1GB 自动时间戳归档)');
  console.log('\x1b[36m%s\x1b[0m', '================================================================');
}

// -----------------------------------------------------------------------------
// 2. UNINSTALL
// -----------------------------------------------------------------------------
function doUninstall() {
  printBanner('正在为当前设备卸载 Claude Code 审计与 Troubleshooter 套件...');

  // 1. 删除部署的文件
  const filesToRemove = [TARGET_SCRIPT, TARGET_AGENT, TARGET_PROFILE, TARGET_CC];
  for (const f of filesToRemove) {
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
        console.log(`🗑️ 已删除: ${f}`);
      } catch (e) {
        console.warn(`⚠️ 删除失败 ${f}: ${e.message}`);
      }
    } else {
      console.log(`ℹ️ 文件不存在，跳过: ${f}`);
    }
  }

  // 2. 从 settings.json 中移除 log-commands 钩子
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      if (settings.hooks && Array.isArray(settings.hooks.PreToolUse)) {
        for (const group of settings.hooks.PreToolUse) {
          if (group.matcher === 'Bash' && Array.isArray(group.hooks)) {
            group.hooks = group.hooks.filter(
              (h) => !h.command || !h.command.includes('log-commands.py')
            );
          }
        }
        // 清理空 hooks
        settings.hooks.PreToolUse = settings.hooks.PreToolUse.filter(
          (g) => g.hooks && g.hooks.length > 0
        );
        if (settings.hooks.PreToolUse.length === 0) {
          delete settings.hooks.PreToolUse;
        }
        if (Object.keys(settings.hooks).length === 0) {
          delete settings.hooks;
        }
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
      console.log(`✅ 已从 settings.json 中移除 PreToolUse 钩子`);
    } catch (e) {
      console.warn(`⚠️ 更新 settings.json 出现异常: ${e.message}`);
    }
  }

  console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------------');
  console.log('\x1b[32m%s\x1b[0m', '🎉 卸载完成！套件组件已安全移除，历史日志 (command_audit.log) 已保留。');
  console.log('\x1b[36m%s\x1b[0m', '================================================================');
}

// -----------------------------------------------------------------------------
// 3. STATUS
// -----------------------------------------------------------------------------
function doStatus() {
  printBanner('Claude Code 审计与 Troubleshooter 套件状态检查');

  const checkFile = (label, filepath) => {
    const exists = fs.existsSync(filepath);
    const mark = exists ? '\x1b[32m[已安装]\x1b[0m' : '\x1b[31m[未安装]\x1b[0m';
    console.log(` ${mark} ${label}: ${filepath}`);
  };

  checkFile('审计脚本 (Hook)', TARGET_SCRIPT);
  checkFile('排查专家 (Agent)', TARGET_AGENT);
  checkFile('运行配置 (Profile)', TARGET_PROFILE);
  checkFile('启动脚本 (cc.sh)', TARGET_CC);
  checkFile('核心配置 (settings.json)', SETTINGS_FILE);
  checkFile('免引导配置 (.claude.json)', CLAUDE_JSON_FILE);
}

// -----------------------------------------------------------------------------
// ROUTER
// -----------------------------------------------------------------------------
switch (command.toLowerCase()) {
  case 'uninstall':
  case 'remove':
  case 'clean':
    doUninstall();
    break;
  case 'status':
  case 'check':
    doStatus();
    break;
  case 'install':
  case 'setup':
  default:
    doInstall();
    break;
}
