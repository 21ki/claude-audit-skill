---
name: claude-audit-skill
description: "一键为当前设备安装并配置 Claude Code 全量命令审计、执行意图记录、密码凭据自动脱敏与 1GB 持久归档 Hook"
---

# Claude Code 命令全量自动审计与防泄密 Skill

本技能遵循 [skills.sh](https://skills.sh) 开放技能标准，用于在新电脑或新服务器上一键自动化部署与激活 Claude Code 命令审计系统。

## 功能特性
1. **全量静默审计**：监听所有 Bash 执行，记录时间戳、会话 ID、工作目录、执行意图与具体命令。
2. **凭据安全自动脱敏**：落盘前自动识别 Token、密码、私钥并替换为 `<REDACTED_*>`。
3. **多行命令紧凑化**：智能转义换行符，单行化输出，对 grep 与 tail 检索极度友好。
4. **1GB 持久归档**：单日志上限达 1GB，超过 1GB 自动以时间戳永久归档，绝不覆盖历史数据。

## 安装指南 (适用于 AI Agent)
当用户请求安装或初始化该审计钩子时，依次执行：

1. **创建钩子目录**：
   ```bash
   mkdir -p ~/.claude/hooks
   ```

2. **部署钩子脚本**：
   读取本 Skill 中的 `scripts/log-commands.py` 并写入目标路径 `~/.claude/hooks/log-commands.py`，赋予执行权限：
   ```bash
   chmod +x ~/.claude/hooks/log-commands.py
   ```

3. **配置 settings.json**：
   在 `~/.claude/settings.json` 中配置 `hooks.PreToolUse`：
   ```json
   {
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "Bash",
           "hooks": [
             {
               "type": "command",
               "command": "python3 ~/.claude/hooks/log-commands.py"
             }
           ]
         }
       ]
     }
   }
   ```

4. **验证状态**：
   执行测试命令，验证 `~/.claude/command_audit.log` 成功记录带 `[SESSION: ...]` 与 `[DESC: ...]` 的标准日志。
