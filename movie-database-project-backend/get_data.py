import numpy as np


def getMovieDataFromMovieList(movieListsData: np.ndarray, dataType: str) -> np.ndarray:
    movieListsData_ = np.array(movieListsData)

    results = np.empty((movieListsData_.shape[0], 20), dtype=dict)
    for i, val in enumerate(movieListsData):
        for j, val2 in enumerate(val["results"]):
            results[i][j] = val2[dataType]
    return results


def getCasts(moviesCreditData: list) -> np.ndarray:
    casts = [
        [[subObj["original_name"] for subObj in obj["cast"]] for obj in arr]
        for arr in moviesCreditData
    ]
    return casts


def getCrews(moviesCreditData: list) -> np.ndarray:
    crews = [
        [
            [
                {subObj["job"]: subObj["original_name"]}
                for subObj in obj["crew"]
                if subObj["job"] == "Director" or subObj["job"] == "Writer"
            ]
            for obj in arr
        ]
        for arr in moviesCreditData
    ]
    return crews


def getGenre(movieDetailsData: list) -> list:
    movieGenres = [
        [[subDict["name"] for subDict in dict_["genres"]] for dict_ in arr]
        for arr in movieDetailsData
    ]
    return movieGenres


def getKeywords(movieKeywordsData: list) -> list[np.ndarray]:
    movieKeywords = [
        [[subDict["name"] for subDict in dict_["keywords"]] for dict_ in arr]
        for arr in movieKeywordsData
    ]
    return movieKeywords


def getDirectors(directorsAndWritersData: list[list]) -> list:
    movieDirectors = [
        [
            [dict_["Director"] for dict_ in subArr if "Director" in list(dict_.keys())]
            for subArr in arr
        ]
        for arr in directorsAndWritersData
    ]
    return movieDirectors


def getWriter(directorsAndWritersData: list[list]) -> list:
    movieWriters = [
        [
            [dict_["Writer"] for dict_ in subArr if "Writer" in list(dict_.keys())]
            for subArr in arr
        ]
        for arr in directorsAndWritersData
    ]
    return movieWriters
