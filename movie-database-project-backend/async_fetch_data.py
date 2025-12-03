import httpx, asyncio
import numpy as np
from helper_functions import getUrls
from get_data import (
    getCasts,
    getCrews,
    getMovieDataFromMovieList,
    getGenre,
    getKeywords,
    getDirectors,
    getWriter,
)

semaphore = asyncio.Semaphore(50)


async def limited_fetch(url, client):
    async with semaphore:
        resp = await client.get(url)
        return resp.json()


async def asyncFetchMovieData(
    urls: np.ndarray, client: httpx.AsyncClient
) -> list[dict]:

    try:
        async with asyncio.TaskGroup() as tg:
            tasks = [
                [tg.create_task(limited_fetch(url, client)) for url in arr]
                for arr in urls
            ]
        return [[t.result() for t in arr] for arr in tasks]
    except httpx.HTTPError as e:
        print(f"An error occurred: {e}")
        return []


async def asyncFetchMovieLists(
    urls: np.ndarray, client: httpx.AsyncClient
) -> list[dict]:

    try:
        tasks = [limited_fetch(str(url), client) for url in urls]
        res = await asyncio.gather(*tasks)
        data = np.array([r for r in res])
        return data
    except httpx.HTTPError as e:
        print(f"An error occurred: {e}")
        return []


async def asyncFetchMovies(numPage: int, headers: dict, listUrls: str) -> dict:
    async with httpx.AsyncClient(headers=headers) as client:
        movieListUrls = getUrls(listUrls, numPage)
        movieListData = await asyncFetchMovieLists(
            urls=movieListUrls,
            client=client,
        )
        movieIds = getMovieDataFromMovieList(movieListData, "id")
        moviesOriginalTitle = getMovieDataFromMovieList(
            movieListsData=movieListData, dataType="original_title"
        )
        moviesOverview = getMovieDataFromMovieList(
            movieListsData=movieListData, dataType="overview"
        )
        moviesIsAdult = getMovieDataFromMovieList(
            movieListsData=movieListData, dataType="adult"
        )
        moviesPosterPath = getMovieDataFromMovieList(
            movieListsData=movieListData, dataType="poster_path"
        )
        moviesBackdropPath = getMovieDataFromMovieList(
            movieListsData=movieListData, dataType="backdrop_path"
        )
        moviesReleaseDate = getMovieDataFromMovieList(
            movieListsData=movieListData, dataType="release_date"
        )
        movieGenresUrls = getUrls(
            "https://api.themoviedb.org/3/movie/{}?language=en-US", numPage, movieIds
        )
        movieDetailsData = await asyncFetchMovieData(movieGenresUrls, client)
        movieGenres = getGenre(movieDetailsData)
        movieKeywordsUrls = getUrls(
            "https://api.themoviedb.org/3/movie/{}/keywords",
            numPage=numPage,
            movieId=movieIds,
        )
        movieKeywordsData = await asyncFetchMovieData(movieKeywordsUrls, client)
        movieKeywords = getKeywords(movieKeywordsData)
        movieCreditUrls = getUrls(
            "https://api.themoviedb.org/3/movie/{}/credits?language=en-US",
            numPage=numPage,
            movieId=movieIds,
        )
        moviesCreditData = await asyncFetchMovieData(movieCreditUrls, client=client)
        movieCasts = getCasts(moviesCreditData)
        directorsAndWritersData = getCrews(moviesCreditData)
        movieDirectors = getDirectors(directorsAndWritersData)
        movieWriters = getWriter(directorsAndWritersData)

        movies = []
        for i in range(numPage):
            for j in range(20):
                movieBase = {}
                movieBase["id"] = movieIds[i][j]
                movieBase["title"] = moviesOriginalTitle[i][j]
                movieBase["overview"] = moviesOverview[i][j]
                movieBase["adult"] = moviesIsAdult[i][j]
                movieBase["poster_path"] = (
                    f"https://image.tmdb.org/t/p/w300/{moviesPosterPath[i][j]}"
                )
                movieBase["backdrop_path"] = (
                    f"https://image.tmdb.org/t/p/w300/{moviesBackdropPath[i][j]}"
                )
                movieBase["release_date"] = moviesReleaseDate[i][j]
                movieBase["genres"] = movieGenres[i][j]
                movieBase["keywords"] = movieKeywords[i][j]
                movieBase["directors"] = movieDirectors[i][j]
                movieBase["writers"] = movieWriters[i][j]
                movieBase["casts"] = movieCasts[i][j]
                movies.append(movieBase)
        return movies
