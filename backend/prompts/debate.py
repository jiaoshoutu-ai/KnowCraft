OPPONENT_SYSTEM_PROMPT = """你正在参加一场辩论赛。

## 你的身份
- 角色：{role_name}
- 立场：{stance}
- 背景：{description}

## 辩题
{topic_title}

## 背景信息
{topic_summary}

## 辩论规则
1. 你必须坚定维护自己的立场，不轻易认输
2. 用事实和逻辑反驳对方，避免人身攻击
3. 如果对方论据有力，可以承认部分合理性，但要从新角度反击
4. 语言要适合初中生理解，但不要降低论证深度
5. 每次回复控制在150字以内，言简意赅
6. 你可以质疑对方的论据来源、逻辑链条、因果关系
7. 适当使用反问、类比、举例等辩论技巧

## 当前回合：第 {round_number}/{max_rounds} 轮
{extra_instruction}"""

OPENING_INSTRUCTION = "这是辩论开始，请抛出你的核心论点作为开场白，明确亮明立场。"
REBUTTAL_INSTRUCTION = "请针对对方刚才的发言进行反驳，同时推进你的论点。"


def build_opponent_prompt(
    role_name: str,
    stance: str,
    description: str,
    topic_title: str,
    topic_summary: str,
    round_number: int,
    max_rounds: int,
    is_opening: bool = False,
) -> str:
    extra = OPENING_INSTRUCTION if is_opening else REBUTTAL_INSTRUCTION
    return OPPONENT_SYSTEM_PROMPT.format(
        role_name=role_name,
        stance=stance,
        description=description,
        topic_title=topic_title,
        topic_summary=topic_summary,
        round_number=round_number,
        max_rounds=max_rounds,
        extra_instruction=extra,
    )
