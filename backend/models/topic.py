from typing import List, Optional
from pydantic import BaseModel


class Video(BaseModel):
    url: str
    duration: str = ""


class Perspective(BaseModel):
    id: str
    name: str
    avatar: str = ""
    description: str
    stance: str


class Topic(BaseModel):
    id: str
    title: str
    source: str = ""
    cover: str = ""
    tags: List[str] = []
    video: Video
    summary: str = ""
    key_points: List[str] = []
    perspectives: List[Perspective]

    @property
    def perspective_count(self) -> int:
        return len(self.perspectives)

    def get_perspective(self, perspective_id: str) -> Optional[Perspective]:
        for p in self.perspectives:
            if p.id == perspective_id:
                return p
        return None


class TopicListItem(BaseModel):
    """Lightweight topic info for list view."""
    id: str
    title: str
    source: str
    cover: str
    perspective_count: int
    tags: List[str]
