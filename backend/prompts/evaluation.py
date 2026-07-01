EVALUATION_PROMPT = """请作为辩论赛评委，分析以下辩论。评委需要以鼓励为主，同时指出改进空间。面对的是初中生，请用温暖专业的语气。

## 辩题
{topic_title}

## 学生立场
{user_stance}

## AI对手立场
{opponent_stance}

## 完整辩论记录
{conversation}

请从以下5个维度评分（每项1-10分）并给出分析：
1. 逻辑性：论点是否有清晰的因果链条？有无逻辑谬误？
2. 证据力：是否引用了事实、数据或案例来支撑观点？
3. 表达力：表述是否清晰有力？是否有说服力？
4. 反驳能力：能否有效回应对方的攻击？是否找到对方漏洞？
5. 多角度思考：是否展现了从不同角度看问题的能力？

请严格按照以下JSON格式输出，不要输出其他内容：
{{
  "scores": {{
    "logic": <1-10>,
    "evidence": <1-10>,
    "expression": <1-10>,
    "rebuttal": <1-10>,
    "perspective": <1-10>
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
