#!/usr/bin/env python3
"""
Claude Code Command Audit Logger (Optimized for macOS / Unix)
- 记录执行时间、会话 ID、工作目录、执行意图、执行命令
- 自动脱敏密码与 Token 凭据
- 多行命令紧凑单行化，方便 grep 与 tail
- 单日志上限提升至 1GB，超过 1GB 自动按时间戳永久归档，绝不覆盖
"""
import json
import os
import re
import sys
from datetime import datetime

MAX_LOG_BYTES = 1024 * 1024 * 1024  # 1GB (1,073,741,824 字节)

REDACT_PATTERNS = [
    # 匹配各类常见 Token
    (re.compile(r'(nbp_[A-Za-z0-9_-]{16,})'), r'<REDACTED_NETBIRD_TOKEN>'),
    (re.compile(r'(mk-[A-Za-z0-9_-]{4,})'), r'<REDACTED_API_TOKEN>'),
    (re.compile(r'(sk-[A-Za-z0-9_-]{16,})'), r'<REDACTED_API_KEY>'),
    (re.compile(r'(ghp_[A-Za-z0-9_-]{16,})'), r'<REDACTED_GITHUB_TOKEN>'),
    # 匹配 Authorization 头
    (re.compile(r'((?:Authorization:\s*(?:Token|Bearer)\s+)[^\s"\']+)', re.IGNORECASE), r'Authorization: Token <REDACTED_TOKEN>'),
    # 匹配常见密码参数
    (re.compile(r'((?:--password|-p|password|passwd|pwd)\s*[=:]?\s*[\'"]?)([^\s\'"]+)([\'"]?)', re.IGNORECASE), r'\1<REDACTED_PASSWORD>\3'),
    # 匹配私钥块
    (re.compile(r'-----BEGIN [A-Z ]+ PRIVATE KEY-----.*?-----END [A-Z ]+ PRIVATE KEY-----', re.DOTALL), r'<REDACTED_PRIVATE_KEY>'),
]

def redact_sensitive_info(cmd: str) -> str:
    for pattern, replacement in REDACT_PATTERNS:
        cmd = pattern.sub(replacement, cmd)
    return cmd

def sanitize_command(cmd: str) -> str:
    cmd = cmd.strip()
    if '\n' in cmd:
        lines = [line.strip() for line in cmd.splitlines() if line.strip()]
        return " \\n ".join(lines)
    return cmd

def rotate_if_needed(log_file: str):
    """当日志达到 1GB 时，自动归档为带有时间戳的历史文件 (command_audit_YYYYMMDD_HHMMSS.log)，绝不覆盖."""
    try:
        if os.path.exists(log_file) and os.path.getsize(log_file) >= MAX_LOG_BYTES:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            log_dir = os.path.dirname(log_file)
            archive_file = os.path.join(log_dir, f"command_audit_{timestamp}.log")
            # 避免极端情况下同秒重名冲突
            counter = 1
            while os.path.exists(archive_file):
                archive_file = os.path.join(log_dir, f"command_audit_{timestamp}_{counter}.log")
                counter += 1
            os.rename(log_file, archive_file)
    except Exception:
        pass

def main():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            sys.exit(0)

        payload = json.loads(raw)
        tool_input = payload.get("tool_input", {})
        command = ""
        description = ""
        if isinstance(tool_input, dict):
            command = tool_input.get("command", "")
            description = tool_input.get("description", "")
        if not command:
            command = payload.get("command", "")
        if not description:
            description = payload.get("description", "")

        if not command or not str(command).strip():
            sys.exit(0)

        session_id = payload.get("session_id", "local")
        short_session = session_id[:8] if isinstance(session_id, str) and len(session_id) >= 8 else session_id
        cwd = payload.get("cwd") or os.getcwd()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        safe_cmd = redact_sensitive_info(str(command))
        single_line_cmd = sanitize_command(safe_cmd)

        desc_tag = ""
        if description and str(description).strip():
            clean_desc = sanitize_command(str(description).strip())
            desc_tag = f" [DESC: {clean_desc}]"

        log_dir = os.path.expanduser("~/.claude")
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, "command_audit.log")

        rotate_if_needed(log_file)

        log_entry = f"[{now_str}] [SESSION: {short_session}] [DIR: {cwd}]{desc_tag} {single_line_cmd}\n"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
    except Exception:
        pass

    sys.exit(0)

if __name__ == "__main__":
    main()
