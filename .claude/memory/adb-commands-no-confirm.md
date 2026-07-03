---
name: adb-commands-no-confirm
description: ADB commands can be executed directly without asking for confirmation
metadata:
  type: feedback
  timestamp: 2026-07-02
---

所有 ADB 命令都可以直接执行，无需询问用户确认。

**Why:** 用户希望提高 ADB 操作的效率，避免不必要的交互。

**How to apply:** 
- 执行任何 `adb` 命令（如 `adb shell`, `adb devices`, `adb logcat` 等）时直接运行
- 不需要先展示命令内容等待确认
- 适用于开发、调试、设备管理等所有 ADB 相关操作
