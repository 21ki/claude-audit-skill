---
name: claude-audit-skill
description: "一键为当前设备全自动装配 Claude Code 审计日志、Troubleshooter 排查专家、CPA 配置与 ~/tmp/cc.sh 启动环境"
---

# Claude Code 审计与 Troubleshooter 专家套件 Skill

本技能遵循 [skills.sh](https://skills.sh) 开放技能标准，用于在新电脑或新服务器上一键自动化部署与激活全套工作环境。

## 📦 自动交付内容
1. **全量命令审计 Hook**：`~/.claude/hooks/log-commands.py`（单文件 1GB，时间戳无损归档，凭据自动脱敏，`[SESSION]` + `[DESC]` 标签）。
2. **Troubleshooter 专家画像**：`~/.claude/agents/troubleshooter.md`（深度排查规范与自动产出 `docs/troubleshooting/` 报告）。
3. **Troubleshoot 运行配置**：`~/.claude/profiles/troubleshoot.json`（绑定 `--effort xhigh` 极致推理与标题防覆盖）。
4. **一键启动脚本**：`~/tmp/cc.sh`（自动保证默认工作目录为 `~/tmp`，自带代理、CPA 环境变量与执行权限）。
5. **核心设置与权限管控**：`~/.claude/settings.json`（安全策略 deny 规则、CPA 端点、tui 全屏、36500天会话保留）。
6. **零交互启动支持**：`~/.claude.json`（预置 Dark mode 与向导跳过，无需手动配置）。

## 🚀 跨设备一键使用
在新电脑或新服务器的终端执行：
```bash
npx github:21ki/claude-audit-skill
```
或者通过 Skills 开放生态：
```bash
npx skills add -g 21ki/claude-audit-skill
```
部署完成后，直接在任意终端运行：
```bash
~/tmp/cc.sh
```
即刻秒级进入满血状态！
