"""
Data import script: migrate JSON topics to SQLite database.
"""
import asyncio
import json
import sys
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import async_session_maker, init_db
from models.db_models import (
    Topic, Video, DebateTopic
)


async def import_topic_from_json(json_path: Path, session: AsyncSession):
    """Import a single topic from JSON file."""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    topic_id = data.get('id', str(uuid4()))

    # Check if topic already exists
    result = await session.execute(
        select(Topic).where(Topic.id == topic_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        print(f"  ⚠️  Topic '{topic_id}' already exists, skipping...")
        return

    # Create topic
    topic = Topic(
        id=topic_id,
        title=data['title'],
        source=data['source'],
        summary=data['summary'],
        tags=data.get('tags', []),
        is_published=data.get('is_published', False),
        view_count=data.get('view_count', 0),
        debate_count=data.get('debate_count', 0),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    session.add(topic)

    # Create video
    video_data = data.get('video', {})
    video = Video(
        topic_id=topic_id,
        url=video_data.get('url', ''),
        duration=video_data.get('duration', ''),
        cover=video_data.get('cover', ''),
        transcript=video_data.get('transcript', '')
    )
    session.add(video)

    # Create debate topics
    for dt_data in data.get('debate_topics', []):
        debate_topic = DebateTopic(
            id=dt_data.get('id', str(uuid4())),
            topic_id=topic_id,
            title=dt_data['title'],
            pro_stance=dt_data['pro_stance'],
            con_stance=dt_data['con_stance'],
            participant_count=dt_data.get('participant_count', 0)
        )
        session.add(debate_topic)

    print(f"  ✅ Imported topic: {data['title']} ({len(data.get('debate_topics', []))} debate topics)")


async def main():
    """Main import function."""
    print("🚀 Starting data import...")

    # Initialize database
    print("📦 Initializing database...")
    await init_db()

    # Find all JSON files
    topics_dir = Path(__file__).parent / 'data' / 'topics'
    json_files = list(topics_dir.glob('*.json'))

    if not json_files:
        print("⚠️  No JSON files found in data/topics/")
        return

    print(f"📄 Found {len(json_files)} JSON file(s)")

    # Import each file
    async with async_session_maker() as session:
        for json_file in json_files:
            print(f"\n📥 Importing {json_file.name}...")
            try:
                await import_topic_from_json(json_file, session)
            except Exception as e:
                print(f"  ❌ Error importing {json_file.name}: {e}")
                await session.rollback()
                continue

        await session.commit()

    print("\n✅ Import completed!")


if __name__ == '__main__':
    asyncio.run(main())
