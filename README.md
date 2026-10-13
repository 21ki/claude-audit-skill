# Claude Code Command Audit & Troubleshooter Suite 🛡️🧠

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Skills.sh](https://img.shields.io/badge/Agent_Skills-skills.sh-green.svg)](https://skills.sh)

为 **Claude Code** 打造的企业级命令全量审计、人类执行意图记录、凭据敏感信息脱敏与 **Troubleshooter（银月深度排查专家）** 全功能套件。支持跨机器（macOS / Linux / Docker）一键秒级部署。

---

## 🌟 核心亮点

- ⚡ **全套环境一键秒配**：换新电脑或新服务器只需 1 行命令，即可全自动配置 `~/tmp/cc.sh`、`troubleshoot.json`、安全策略与 Hook！
- 🧠 **Troubleshooter 深度排查专家**：自带规范化排查工作流，排障解决后强制自动生成 `docs/troubleshooting/YYYY-MM-DD-*.md` 结构化报告。
- 🎯 **极致思考深度 (`--effort xhigh`)**：开箱即用绑定超长思维链推理，复杂网络、Docker 与 Linux 内核排障拒绝瞎猜盲试。
- 📂 **默认工作目录 `~/tmp/`**：`cc.sh` 脚本自动定位并保证工作目录为 `~/tmp/`。
- 🛡️ **敏感信息自动脱敏**：落盘前自动正则识别 NetBird Token、API Key、数据库密码、私钥等，统一打码为 `<REDACTED_*>`。
- 📦 **1GB 时间戳持久归档**：单日志上限达 1GB，超过 1GB 自动以 `command_audit_YYYYMMDD_HHMMSS.log` 永久封存归档，绝不覆盖丢弃任何历史。
- 🚀 **零交互秒启动**：自动预置暗黑模式与 CPA 代理配置，杜绝首次启动询问 Dark mode 与 Login method 的繁琐流程。

---

## 🚀 换电脑/换服务器一键安装

在任何新电脑或新服务器上，您只需选择以下任意一种方式即可一键安装生效：

### 方式 A：通过 NPX 极速装机（最推荐，免进 Claude）
无需提前启动 Claude，在系统终端中直接运行：
```bash
npx github:21ki/claude-audit-skill
```

### 方式 B：通过 Agent Skills CLI 安装（官方生态规范）
```bash
npx skills add -g 21ki/claude-audit-skill
```

安装完成后，直接在终端执行：
```bash
~/tmp/cc.sh
```
即刻秒级进入满血状态！

---

## 📁 自动生成的环境目录结构

```text
~/.claude/
├── settings.json               # 核心配置 (CPA 端点、安全 deny 规则、PreToolUse Hook)
├── command_audit.log           # 1GB 审计日志 (自动按时间戳归档)
├── hooks/
│   └── log-commands.py         # 审计与脱敏前置钩子
├── profiles/
│   └── troubleshoot.json       # Troubleshooter 运行配置 (--effort xhigh)
└── agents/
    └── troubleshooter.md       # 银月专家画像与复盘规范

~/tmp/
└── cc.sh                       # 专属启动脚本 (自动定位 ~/tmp，带执行权限)
```

---

## 🔍 常用日志查阅指令

```bash
# 实时监听正在执行的所有命令
tail -f ~/.claude/command_audit.log

# 查阅最近 20 条执行记录
tail -n 20 ~/.claude/command_audit.log

# 按意图描述检索特定操作
grep '\[DESC: ' ~/.claude/command_audit.log
```

---

## 📄 License
[MIT License](LICENSE) © 2026 21ki
