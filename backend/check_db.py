import asyncio
from sqlalchemy import select, desc
from app.database import async_session
from app.models import Article

async def check():
    async with async_session() as db:
        result = await db.execute(select(Article).order_by(desc(Article.published_at)).limit(3))
        articles = result.scalars().all()
        for a in articles:
            print(f"{a.published_at} | {a.original_headline[:50]}")

if __name__ == "__main__":
    asyncio.run(check())
