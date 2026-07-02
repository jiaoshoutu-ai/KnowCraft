# LLM 配置指南

本文档说明如何配置 KnowCraft 后端的大语言模型（LLM）参数。

## 支持的模型提供商

KnowCraft 支持以下三种 LLM 提供商：

1. **DeepSeek**（默认）- 高性能中文模型
2. **Qwen**（通义千问）- 阿里云大模型
3. **Mock** - 用于开发测试的模拟适配器

## 环境变量配置

### 1. DeepSeek 配置（默认）

```bash
# 选择 DeepSeek 作为 LLM 提供商
LLM_PROVIDER=deepseek

# DeepSeek API 密钥（从 https://platform.deepseek.com 获取）
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# DeepSeek API 基础 URL（可选，默认：https://api.deepseek.com）
DEEPSEEK_BASE_URL=https://api.deepseek.com

# DeepSeek 模型名称（可选，默认：deepseek-chat）
DEEPSEEK_MODEL=deepseek-chat
```

### 2. Qwen（通义千问）配置

```bash
# 选择 Qwen 作为 LLM 提供商
LLM_PROVIDER=qwen

# 阿里云 DashScope API 密钥（从 https://dashscope.aliyun.com 获取）
DASHSCOPE_API_KEY=sk-your-dashscope-api-key-here

# Qwen 模型名称（可选，默认：qwen-plus）
LLM_MODEL=qwen-plus
```

### 3. Mock 配置（开发测试用）

```bash
# 选择 Mock 适配器
LLM_PROVIDER=mock
```

或者不配置任何 API 密钥，系统会自动回退到 Mock 适配器。

## 通用参数配置

无论使用哪个提供商，都可以配置以下通用参数：

```bash
# 最大生成 token 数（默认：500）
LLM_MAX_TOKENS=500

# 温度参数，控制随机性（0.0-1.0，默认：0.8）
LLM_TEMPERATURE=0.8
```

## 完整配置示例

### 示例 1：使用 DeepSeek（推荐）

```bash
# .env 文件
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=["*"]

DATABASE_URL=sqlite+aiosqlite:///./data/knowcraft.db

# DeepSeek 配置
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

LLM_MAX_TOKENS=500
LLM_TEMPERATURE=0.8

DEBATE_MAX_ROUNDS=5
DEBATE_TURN_TIMEOUT=90
```

### 示例 2：使用 Qwen

```bash
# .env 文件
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=["*"]

DATABASE_URL=sqlite+aiosqlite:///./data/knowcraft.db

# Qwen 配置
LLM_PROVIDER=qwen
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
LLM_MODEL=qwen-plus

LLM_MAX_TOKENS=500
LLM_TEMPERATURE=0.8

DEBATE_MAX_ROUNDS=5
DEBATE_TURN_TIMEOUT=90
```

### 示例 3：开发测试（使用 Mock）

```bash
# .env 文件
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=["*"]

DATABASE_URL=sqlite+aiosqlite:///./data/knowcraft.db

# Mock 配置（无需 API 密钥）
LLM_PROVIDER=mock

LLM_MAX_TOKENS=500
LLM_TEMPERATURE=0.8

DEBATE_MAX_ROUNDS=5
DEBATE_TURN_TIMEOUT=90
```

## 参数说明

### LLM_PROVIDER
- **类型**: 字符串
- **可选值**: `deepseek` | `qwen` | `mock`
- **默认值**: `deepseek`
- **说明**: 选择使用哪个 LLM 提供商

### DEEPSEEK_API_KEY
- **类型**: 字符串
- **说明**: DeepSeek API 密钥
- **获取方式**: 访问 https://platform.deepseek.com 注册并创建 API Key

### DEEPSEEK_BASE_URL
- **类型**: 字符串
- **默认值**: `https://api.deepseek.com`
- **说明**: DeepSeek API 基础 URL，通常无需修改

### DEEPSEEK_MODEL
- **类型**: 字符串
- **默认值**: `deepseek-chat`
- **说明**: DeepSeek 模型名称，目前支持：
  - `deepseek-chat` - 通用对话模型
  - `deepseek-coder` - 代码生成模型

### DASHSCOPE_API_KEY
- **类型**: 字符串
- **说明**: 阿里云 DashScope API 密钥
- **获取方式**: 访问 https://dashscope.aliyun.com 注册并创建 API Key

### LLM_MODEL
- **类型**: 字符串
- **默认值**: `qwen-plus`
- **说明**: Qwen 模型名称，可选值：
  - `qwen-turbo` - 快速模型
  - `qwen-plus` - 平衡模型（推荐）
  - `qwen-max` - 最强模型

### LLM_MAX_TOKENS
- **类型**: 整数
- **默认值**: `500`
- **说明**: 单次生成的最大 token 数

### LLM_TEMPERATURE
- **类型**: 浮点数
- **默认值**: `0.8`
- **范围**: 0.0 - 1.0
- **说明**: 控制生成的随机性
  - 值越低（如 0.3）：更确定、更一致
  - 值越高（如 0.9）：更随机、更有创意

## 自动回退机制

系统实现了智能回退机制：

1. 如果 `LLM_PROVIDER=deepseek` 但未配置 `DEEPSEEK_API_KEY`，自动回退到 Mock 适配器
2. 如果 `LLM_PROVIDER=qwen` 但未配置 `DASHSCOPE_API_KEY`，自动回退到 Mock 适配器
3. 如果 `LLM_PROVIDER=mock`，直接使用 Mock 适配器

这样可以确保开发环境在没有 API 密钥的情况下也能正常运行。

## 验证配置

配置完成后，可以运行以下命令验证：

```bash
cd backend
./venv/bin/python -c "
from core import get_llm_adapter
from config import settings

print(f'LLM Provider: {settings.llm_provider}')
llm = get_llm_adapter()
print(f'Adapter type: {type(llm).__name__}')
print('✓ LLM adapter initialized successfully')
"
```

预期输出：
```
LLM Provider: deepseek
Adapter type: DeepSeekAdapter
✓ LLM adapter initialized successfully
```

## 常见问题

### Q: 如何切换不同的模型？
A: 修改 `.env` 文件中的 `LLM_PROVIDER` 和对应的 API 密钥，然后重启后端服务。

### Q: 为什么配置了 DeepSeek 但显示使用 Mock？
A: 检查是否正确设置了 `DEEPSEEK_API_KEY`，如果密钥为空或为 `"your_api_key_here"`，系统会自动回退到 Mock。

### Q: 可以同时使用多个模型吗？
A: 不可以，当前设计只支持一个活跃的 LLM 提供商。如需切换，修改 `.env` 文件并重启服务。

### Q: Mock 适配器有什么用？
A: Mock 适配器用于开发和测试环境，无需 API 密钥即可运行系统，返回预设的测试数据。

## 安全提示

⚠️ **重要**：
- 不要将 `.env` 文件提交到版本控制系统
- 确保 `.env` 已在 `.gitignore` 中
- 定期轮换 API 密钥
- 监控 API 使用量，避免超出预算

## 更多帮助

如需更多帮助，请参考：
- DeepSeek 官方文档：https://platform.deepseek.com/docs
- Qwen 官方文档：https://help.aliyun.com/zh/dashscope/
- 项目 README.md
