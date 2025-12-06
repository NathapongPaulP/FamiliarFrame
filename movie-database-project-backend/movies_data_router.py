from fastapi import Depends, APIRouter
from schema import MovieListsWithNumPage, getMovieOutput
from db import (
    Movie,
    Person,
    JobRole,
    MovieGenres,
    MovieKeywords,
    MovieCredits,
    get_async_session,
)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from async_fetch_data import asyncFetchMovies


router = APIRouter(prefix="/movies", tags=["movies"])


async def get_or_create_job(name: str, session: AsyncSession):
    result = await session.execute(select(JobRole).where(JobRole.name == name))
    role = result.scalar_one_or_none()
    if not role:
        role = JobRole(name=name)
        session.add(role)
        await session.flush()
    return role.id


async def ifExists(movieData: list, session: AsyncSession):
    movieIds = {str(movie["id"]) for movie in movieData}
    results = await session.execute(select(Movie.id))
    results = results.scalars().all()
    existedMovieIds = {existed for existed in results}
    existedMovieIds = existedMovieIds & movieIds
    return existedMovieIds


@router.post("/create_movie")
async def create_movie(
    numPageAndHeaders: MovieListsWithNumPage,
    session: AsyncSession = Depends(get_async_session),
):
    numPage = numPageAndHeaders.numPage
    headers = numPageAndHeaders.headers
    listUrl = numPageAndHeaders.listUrl
    movie_datas = await asyncFetchMovies(numPage, headers, listUrl)

    moviesToSkip = await ifExists(movie_datas, session)

    for movie_data in movie_datas:
        if str(movie_data["id"]) in moviesToSkip:
            continue

        new_movie = Movie(
            id=movie_data["id"],
            title=movie_data["title"],
            overview=movie_data["overview"],
            adult=movie_data["adult"],
            poster_path=movie_data["poster_path"],
            backdrop_path=movie_data["backdrop_path"],
            release_date=movie_data["release_date"],
        )
        session.add(new_movie)
        await session.flush()

        for genre_name in movie_data["genres"]:
            new_genre = MovieGenres(
                genre_id=None, genre_name=genre_name, movie_id=new_movie.id
            )
            session.add(new_genre)

        for keyword_name in movie_data["keywords"]:
            new_keyword = MovieKeywords(
                keyword_id=None, keyword_name=keyword_name, movie_id=new_movie.id
            )
            session.add(new_keyword)

        director_id = await get_or_create_job("Director", session)
        writer_id = await get_or_create_job("Writer", session)
        cast_id = await get_or_create_job("Cast", session)

        for director_name in movie_data["directors"]:
            new_person = Person(id=None, job_id=director_id, name=director_name)
            session.add(new_person)
            await session.flush()
            session.add(MovieCredits(movie_id=new_movie.id, person_id=new_person.id))

        for writer_name in movie_data["writers"]:
            new_person = Person(id=None, job_id=writer_id, name=writer_name)
            session.add(new_person)
            await session.flush()
            session.add(MovieCredits(movie_id=new_movie.id, person_id=new_person.id))

        for cast_name in movie_data["casts"]:
            new_person = Person(id=None, job_id=cast_id, name=cast_name)
            session.add(new_person)
            await session.flush()
            session.add(MovieCredits(movie_id=new_movie.id, person_id=new_person.id))

        moviesToSkip.add(str(movie_data["id"]))

    await session.commit()
    return {"message": "Movies created"}


@router.get("/")
async def get_movies(page: int = 1, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(
        select(Movie)
        .options(
            selectinload(Movie.genres),
            selectinload(Movie.keywords_clusters),
            selectinload(Movie.keywords),
            selectinload(Movie.movie_credits)
            .selectinload(MovieCredits.person)
            .selectinload(Person.job_role),
        )
        .limit(20)
        .offset((page - 1) * 20)
    )

    movies = result.scalars().all()

    return {"movies": [getMovieOutput(movie) for movie in movies]}


@router.get("/by_id")
async def get_specific_movie(
    movie_id: str, session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(Movie)
        .where(Movie.id == movie_id)
        .options(
            selectinload(Movie.genres),
            selectinload(Movie.keywords_clusters),
            selectinload(Movie.keywords),
            selectinload(Movie.movie_credits)
            .selectinload(MovieCredits.person)
            .selectinload(Person.job_role),
        )
    )
    movie = result.scalar_one_or_none()
    if not movie:
        return {"error": "Movie not found"}

    return {"movie": getMovieOutput(movie)}
