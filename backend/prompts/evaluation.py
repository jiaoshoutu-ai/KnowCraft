EVALUATION_PROMPT = """请作为辩论赛评委，分析以下辩论。评委需要以鼓励为主，同时指出改进空间。面对的是初中生，请用温暖专业的语气。

## 辩题
{topic_title}

## 学生立场
{user_stance}

## AI对手立场
{opponent_stance}

## 完整辩论记录
{conversation}

请从以下5个维度评分（每项1-10分）：
1. 逻辑性
2. 证据力
3. 表达力
4. 反驳能力
5. 批判性思维

输出要求：
- 只输出JSON，不要输出Markdown或解释
- strengths 输出2条，每条不超过30字
- improvements 输出2条，每条不超过30字
- summary 不超过50字
- 必须输出完整、可解析的JSON

JSON格式：
{{
  "scores": {{
    "logic": <1-10>,
    "evidence": <1-10>,
    "expression": <1-10>,
    "rebuttal": <1-10>,
    "critical_thinking": <1-10>
  }},
  "total_score": <总分>,
  "strengths": ["优点1", "优点2", "优点3"],
  "improvements": ["改进建议1", "改进建议2"],
  "summary": "总体评语（100字以内，鼓励为主）"
}}"""


def build_evaluation_prompt(
    topic_title: str,
    user_stance: str,
    opponent_stance: str,
    conversation: str,
) -> str:
    return EVALUATION_PROMPT.format(
        topic_title=topic_title,
        user_stance=user_stance,
        opponent_stance=opponent_stance,
        conversation=conversation,
    )
