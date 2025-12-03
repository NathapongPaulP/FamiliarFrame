from pydantic import BaseModel
from typing import List, Optional, Dict
from db import Movie, MovieKeywords, KeywordClusters


class MovieOutput(BaseModel):
    id: str
    title: str
    overview: Optional[str]
    adult: bool
    poster_path: Optional[str]
    backdrop_path: Optional[str]
    release_date: Optional[str]
    genres: List[str]
    cluster_labels: Optional[str]
    keywords: List[str]
    directors: List[str]
    casts: List[str]


class MovieListsWithNumPage(BaseModel):
    numPage: int
    headers: Dict[str, str]
    listUrl: str


class KeywordClustersSchema(BaseModel):
    cluster_label: str
    keywords: List[str]
    movie_id: str


def getMovieOutput(movie: Movie) -> MovieOutput:
    return MovieOutput(
        id=movie.id,
        title=movie.title,
        overview=movie.overview,
        adult=movie.adult,
        poster_path=movie.poster_path,
        backdrop_path=movie.backdrop_path,
        release_date=str(movie.release_date),
        genres=[g.genre_name for g in movie.genres],
        cluster_labels=[kc.cluster_label for kc in movie.keywords_clusters][0],
        keywords=[k.keyword_name for k in movie.keywords],
        directors=[
            m.person.name
            for m in movie.movie_credits
            if m.person.job_role.name == "Director"
        ],
        casts=[
            m.person.name
            for m in movie.movie_credits
            if m.person.job_role.name == "Cast"
        ],
    )
