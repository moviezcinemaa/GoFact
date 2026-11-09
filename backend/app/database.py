from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,   # re-validates connections before use (prevents Neon idle-drop 500s)
    pool_recycle=300,     # recycle connections every 5 min (Neon serverless safe limit)
    connect_args={
        "timeout": 15,          # 15s connection timeout gives Neon time to wake up from scale-to-zero
        "command_timeout": 30,  # 30s query execution timeout
        "server_settings": {
            "tcp_keepalives_idle": "30",
            "tcp_keepalives_interval": "10",
            "tcp_keepalives_count": "5",
        },
    },
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
