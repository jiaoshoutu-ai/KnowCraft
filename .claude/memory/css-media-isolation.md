---
name: css-media-isolation
description: CSS responsive design - media queries must be isolated per breakpoint (mobile/iPad/desktop)
metadata:
  type: feedback
  timestamp: 2026-07-02
---

修改响应式 CSS 时，每个 media query 必须独立作用，不能相互影响。

**三个断点：**
- Mobile: `@media (max-width: 768px)`
- iPad: `@media (min-width: 769px) and (max-width: 1024px)`
- Desktop: `@media (min-width: 1025px)`

**Why:** 之前修改 iPad 样式时意外影响了 mobile 版本的布局。

**How to apply:** 
1. 修改某个断点的样式前，先确认 CSS 规则在正确的 media query 内
2. 避免在媒体查询外定义响应式样式
3. 测试时要在所有三个版本上验证
4. 如果发现样式冲突，使用更精确的选择器或添加 `!important`
