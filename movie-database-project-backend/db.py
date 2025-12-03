from collections.abc import AsyncGenerator
import uuid

from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Text, Boolean, DateTime

import os
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("MYSQL_USER")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD")
DB_HOST = os.getenv("MYSQL_HOST")
DB_NAME = os.getenv("MYSQL_DB")

DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"


class Base(DeclarativeBase):
    pass


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    overview: Mapped[str | None] = mapped_column(Text, nullable=True)
    adult: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    poster_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    backdrop_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    release_date: Mapped[str | None] = mapped_column(DateTime, nullable=True)

    genres: Mapped[list["MovieGenres"]] = relationship(
        "MovieGenres", back_populates="movie", cascade="all, delete-orphan"
    )

    keywords: Mapped[list["MovieKeywords"]] = relationship(
        "MovieKeywords", back_populates="movie", cascade="all, delete-orphan"
    )

    movie_credits: Mapped[list["MovieCredits"]] = relationship(
        "MovieCredits", back_populates="movie", cascade="all, delete-orphan"
    )


class MovieGenres(Base):
    __tablename__ = "movie_genres"

    genre_id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    genre_name: Mapped[str] = mapped_column(String(50), nullable=False)
    movie_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("movies.id"))

    movie: Mapped["Movie"] = relationship("Movie", back_populates="genres")


class MovieKeywords(Base):
    __tablename__ = "movie_keywords"

    keyword_id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    keyword_name: Mapped[str] = mapped_column(String(100), nullable=False)
    movie_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("movies.id"))

    movie: Mapped["Movie"] = relationship("Movie", back_populates="keywords")
    keyword_clusters: Mapped[list["KeywordClusters"]] = relationship(
        "KeywordClusters", back_populates="keyword", cascade="all, delete-orphan"
    )


class MovieCredits(Base):
    __tablename__ = "movie_credits"

    movie_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("movies.id"), primary_key=True
    )
    person_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("persons.id"), primary_key=True
    )

    movie: Mapped["Movie"] = relationship("Movie", back_populates="movie_credits")
    person: Mapped["Person"] = relationship("Person", back_populates="movie_credits")


class Person(Base):
    __tablename__ = "persons"

    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    job_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("job_roles.id"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    movie_credits: Mapped[list["MovieCredits"]] = relationship(
        "MovieCredits", back_populates="person"
    )

    job_role: Mapped["JobRole"] = relationship("JobRole", back_populates="persons")


class JobRole(Base):
    __tablename__ = "job_roles"

    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(30), nullable=False)

    persons: Mapped[list["Person"]] = relationship("Person", back_populates="job_role")


engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


class KeywordClusters(Base):
    __tablename__ = "keyword_clusters"

    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    cluster_label: Mapped[int] = mapped_column(nullable=False)
    keyword_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("movie_keywords.keyword_id")
    )

    keyword: Mapped["MovieKeywords"] = relationship(
        "MovieKeywords", back_populates="keyword_clusters"
    )


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
