#!/bin/bash
# 确保默认工作目录为 ~/tmp
mkdir -p "$HOME/tmp" 2>/dev/null || true
cd "$HOME/tmp" 2>/dev/null || true

# proxy代理
export https_proxy=http://192.168.11.11:6152;export http_proxy=http://192.168.11.11:6152;export all_proxy=socks5://192.168.11.11:6153
# tengu_harbor：GrowthBook 上的 flag，管的是 channels（--channels，也就是之前聊的 Telegram 插件）能不能注册。它为 false 时，channel 的通知处理器不会注册，收到的消息被静默丢弃，终端提示 “Channels are not currently available”。这个预览是服务端控制放量
# export CLAUDE_INTERNAL_FC_OVERRIDES='{"tengu_harbor":true}'
# TOKEN
export ANTHROPIC_API_KEY=mk-14
export ANTHROPIC_BASE_URL=http://192.168.1.18:8317
# 最大上下文token
export CLAUDE_CODE_MAX_CONTEXT_TOKENS=1000000
# 禁用未知模型窗口强制
export CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT=1
# 防治修改标题iterm2-title
export CLAUDE_CODE_DISABLE_TERMINAL_TITLE=1
# 移除遥测禁用
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
export DISABLE_TELEMETRY=1

clear
printf '\033[1;32m\033[50G Mikrotik \033[0m\n'
# oracle
#claude --settings ~/.claude/profiles/troubleshoot.json --model Myki-Nexus --effort high --resume f357e318-4716-4152-800e-e55024fe306a
claude --settings ~/.claude/profiles/troubleshoot.json --model Myki-Nexus --effort xhigh "$@"
