import csv
from sqlalchemy import select
from sqlalchemy.orm import DeclarativeBase
from db import (
    Movie,
    MovieGenres,
    MovieKeywords,
    MovieCredits,
    Person,
    JobRole,
    KeywordClusters,
    async_session_maker,
)
import asyncio
from typing import List


async def export_to_csv(
    table_name: DeclarativeBase,
    file_name: str = "output.csv",
):

    async with async_session_maker() as session:
        result = await session.execute(select(table_name))
        rows = result.scalars().all()

        with open(file_name, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)

            # Write header automatically using model attributes
            header = [c.name for c in table_name.__table__.columns]
            writer.writerow(header)

            # Write rows
            for r in rows:
                writer.writerow([getattr(r, col) for col in header])


table = [
    Movie,
    MovieGenres,
    MovieKeywords,
    MovieCredits,
    Person,
    JobRole,
    KeywordClusters,
]


async def export_all(table: List[DeclarativeBase]):
    for t in table:
        await export_to_csv(t, file_name=f"{t.__tablename__}.csv")


asyncio.run(export_all(table))
