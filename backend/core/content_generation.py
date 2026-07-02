"""AI-powered content generation for debate topics."""
import json
import re
from typing import List, Dict

from config import settings
from models.debate import Stance
from core import get_llm_adapter

# Get configured LLM adapter
llm = get_llm_adapter()

CONTENT_GENERATION_PROMPT = """你是一个专业的辩论话题策划专家。请根据提供的视频转录文本，生成适合中学生批判性思维训练的辩论话题。

## 视频转录文本
{transcript}

## 要求
1. 生成2-3个辩论话题，每个话题应该有不同的焦点
2. 每个话题必须包含正方和反方两个立场
3. 话题应该具有争议性，能够激发深入思考
4. 立场描述要具体、清晰，便于中学生理解和辩论
5. 话题应该与视频内容紧密相关，但不要简单重复视频观点

## 输出格式
请严格按照以下JSON格式输出，不要输出其他内容：
{{
  "debate_topics": [
    {{
      "title": "辩题标题（疑问句形式）",
      "pro_stance": "正方立场描述（50-80字，清晰表达正方观点）",
      "con_stance": "反方立场描述（50-80字，清晰表达反方观点）"
    }},
    ...
  ]
}}

注意：
- title 必须是疑问句形式，例如"短视频平台是否应该为青少年沉迷承担主要责任？"
- pro_stance 和 con_stance 必须立场鲜明、对立明确
- 不要使用"有人认为...有人认为..."这种模糊表述
- 每个立场都要有具体的论点支撑
"""


async def generate_debate_topics_from_transcript(
    transcript: str,
    num_topics: int = 3,
) -> List[Dict[str, str]]:
    """
    Generate debate topics from video transcript using AI.

    Args:
        transcript: The video transcript text
        num_topics: Number of topics to generate (2-3)

    Returns:
        List of debate topic dictionaries with title, pro_stance, con_stance
    """
    prompt = CONTENT_GENERATION_PROMPT.format(transcript=transcript)

    raw = await llm.chat([], prompt, max_tokens=1500, temperature=0.7)

    # Parse JSON from response (handle markdown code blocks)
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse AI response as JSON: {e}\nResponse: {text}")

    if "debate_topics" not in data:
        raise ValueError(f"AI response missing 'debate_topics' field: {data}")

    topics = data["debate_topics"]

    # Validate structure
    for i, topic in enumerate(topics):
        if not all(key in topic for key in ["title", "pro_stance", "con_stance"]):
            raise ValueError(f"Topic {i} missing required fields: {topic}")

        # Ensure title is a question
        if not topic["title"].strip().endswith("？") and not topic["title"].strip().endswith("?"):
            topic["title"] = topic["title"].rstrip("。.") + "？"

    return topics[:num_topics]
