import asyncio
from sqlalchemy import select
from app.database import async_session
from app.models import Article

async def check():
    async with async_session() as db:
        result = await db.execute(select(Article).where(Article.original_headline.ilike('%Cramer%')).limit(5))
        articles = result.scalars().all()
        for a in articles:
            print(f"{a.original_headline} | ID: {str(a.id)} | Slug: {a.slug}")

if __name__ == "__main__":
    asyncio.run(check())
