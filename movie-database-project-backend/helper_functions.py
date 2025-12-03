import numpy as np


def getAcceptableUrls(numPage: int) -> list[str]:
    if numPage < 1:
        raise ValueError("numPage must be at least 1.")

    acceptableUrls = [
        "https://api.themoviedb.org/3/movie/{}/credits?language=en-US",
        "https://api.themoviedb.org/3/movie/{}?language=en-US",
        "https://api.themoviedb.org/3/movie/{}/keywords",
        "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page={}",
        "https://api.themoviedb.org/3/movie/popular?language=en-US&page={}",
        "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page={}",
        "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page={}",
    ]

    return acceptableUrls


def getUrls(
    url: str,
    numPage: int,
    movieId: np.ndarray = np.array([]),
) -> np.ndarray:
    if not (1 <= numPage <= 500):
        raise ValueError(f"Page number {numPage} is not between 1-500")

    acceptableUrls = getAcceptableUrls(numPage)

    if url not in acceptableUrls:
        print(url)
        raise ValueError("Invalid url provided.")

    if url[-7:] == "page={}":
        urls = np.array([url.format(i + 1) for i in range(numPage)])
        return urls
    else:
        urls = np.array([[url.format(id) for id in subArray] for subArray in movieId])
        return urls