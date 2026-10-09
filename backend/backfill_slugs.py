import asyncio
from sqlalchemy import select
from app.database import async_session
from app.models import Article
from app.utils.slugify import generate_article_slug

async def backfill():
    async with async_session() as db:
        result = await db.execute(select(Article).where(Article.slug.is_(None)))
        articles = result.scalars().all()
        print(f"Found {len(articles)} articles missing slugs.")
        
        for art in articles:
            art.slug = generate_article_slug(art.original_headline, art.id)
        
        await db.commit()
        print("Slugs backfilled successfully.")

if __name__ == "__main__":
    asyncio.run(backfill())
