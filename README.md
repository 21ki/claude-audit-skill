# Claude Code Command Audit Skill 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Skills.sh](https://img.shields.io/badge/Agent_Skills-skills.sh-green.svg)](https://skills.sh)

为 **Claude Code** 打造的企业级命令全量审计、人类执行意图记录、凭据敏感信息脱敏与 1GB 持久归档 Hook 方案。支持一键跨机器/跨操作系统部署（macOS / Linux）。

---

## 🌟 核心亮点

- ⚡ **0 Token 消耗 & 纯本地离线**：基于 Claude Code 原生 `PreToolUse` Hook 内存管道流转，不耗费任何 API Token。
- 🛡️ **敏感信息自动脱敏**：落盘前自动正则识别 NetBird Token、API Key、数据库密码、私钥等，统一打码为 `<REDACTED_*>`。
- 🧠 **捕获人类执行意图**：自动捕获 Claude 在执行命令前声明的业务目的（如 `[DESC: 检查配置]`），不再需要费脑子反推复杂命令行。
- 📑 **格式工整对齐**：智能单行紧凑化转义，每一条命令独占一行，对 `grep`、`awk` 与 `tail -f` 极其友好。
- 📦 **1GB 时间戳持久归档**：单日志上限达 1GB，超过 1GB 自动以 `command_audit_YYYYMMDD_HHMMSS.log` 永久封存归档，绝不覆盖丢弃任何历史。

---

## 🚀 换电脑/换服务器一键安装

在任何新电脑或新服务器上，您只需选择以下任意一种方式即可一键安装生效：

### 方式 A：通过 Agent Skills CLI 安装（官方生态规范）
```bash
npx skills add -g 21ki/claude-audit-skill
```
安装后在 Claude Code 聊天框输入 `/claude-audit-skill` 即可自动激活。

---

### 方式 B：通过 NPX 直接一秒装机（最推荐，免进 Claude）
无需提前启动 Claude，在系统终端中直接运行：
```bash
npx github:21ki/claude-audit-skill
```
该命令会自动：
1. 创建 `~/.claude/hooks` 目录；
2. 部署 `log-commands.py` 并赋予可执行权限；
3. 智能合并配置到 `~/.claude/settings.json`（保留您原有配置，安全无损）。

---

## 📋 审计日志样例

日志存放路径：`~/.claude/command_audit.log`

```text
[2026-10-13 10:08:09] [SESSION: c4c06ec8] [DIR: /Users/m4/tmp] [DESC: 测试全新标签格式生效情况] tail -n 1 /Users/m4/.claude/command_audit.log
[2026-10-13 10:10:46] [SESSION: c4c06ec8] [DIR: /Users/m4/tmp] [DESC: 测试敏感信息自动清洗] curl -H "Authorization: Token <REDACTED_TOKEN>" --password <REDACTED_PASSWORD> http://example.com
```

---

## 🔍 常用日志查阅指令

```bash
# 1. 实时监听正在执行的所有命令
tail -f ~/.claude/command_audit.log

# 2. 查阅最近 20 条执行记录
tail -n 20 ~/.claude/command_audit.log

# 3. 按会话 Session ID 过滤该轮对话的所有操作
grep '\[SESSION: c4c06ec8\]' ~/.claude/command_audit.log

# 4. 按意图描述检索特定操作
grep '\[DESC: ' ~/.claude/command_audit.log
```

---

## 📄 License
[MIT License](LICENSE) © 2026 21ki
