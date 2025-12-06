from fastapi import APIRouter, Depends
from movies_data_router import get_specific_movie

from db import MovieKeywords, get_async_session, KeywordClusters
from schema import KeywordClustersSchema

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from sentence_transformers import SentenceTransformer

import numpy as np

from sklearn.cluster import HDBSCAN
from sklearn.preprocessing import normalize
from sklearn.decomposition import PCA

router = APIRouter(prefix="/keywords", tags=["keywords"])

model = SentenceTransformer("all-MiniLM-L6-v2")


@router.get("/")
async def get_movie_keywords(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(MovieKeywords))
    movie_keywords = result.scalars().all()

    # label keywords by movie_id
    movie_keywords_dict = {kw.movie_id: [] for kw in movie_keywords}
    for kw in movie_keywords:
        movie_keywords_dict[kw.movie_id].append(kw.keyword_name)

    return {"movie_keywords": movie_keywords_dict}


@router.get("/by_movie_id")
async def get_specific_movie_keywords(
    movie_id: str, session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(KeywordClusters)
        .where(KeywordClusters.movie_id == movie_id)
        .options(selectinload(KeywordClusters.keyword))
    )

    result_2 = await session.execute(
        select(MovieKeywords).where(MovieKeywords.movie_id == movie_id)
    )

    keywords = result_2.scalars().all()

    keyword_clusters = result.scalars().all()
    cluster_labels = set([kc.cluster_label for kc in keyword_clusters])
    keywords = {k.keyword_id: k.keyword_name for k in keywords}

    return {
        "movie_id": movie_id,
        "cluster_labels": list(cluster_labels)[0] if cluster_labels else None,
        "keywords": keywords,
    }


@router.get("/clusters")
async def get_keyword_clusters(
    session: AsyncSession = Depends(get_async_session),
):
    # LOAD KEYWORDS
    keywords = await get_movie_keywords(session=session)

    cluster_labels, noise_keywords = clusterKeywords(keywords)
    # Return clean response
    return {
        "clusters": cluster_labels,
        "noise_keywords": noise_keywords,
    }


@router.post("/create_clusters")
async def post_keyword_clusers(session: AsyncSession = Depends(get_async_session)):
    keywordClusters = await session.execute(
        select(KeywordClusters).options(
            selectinload(KeywordClusters.movie),
            selectinload(KeywordClusters.keyword),
        )
    )
    keywordClusters = keywordClusters.scalars().all()
    keyword_cluster_id_dict = {kc.id: kc.cluster_label for kc in keywordClusters}
    keyword_clusters_dict = {kc.cluster_label: set() for kc in keywordClusters}

    for kc in keywordClusters:
        for label in keyword_clusters_dict:
            if kc.cluster_label == label:
                keyword_clusters_dict[kc.cluster_label].add(kc.movie_id)

    if not list(keyword_clusters_dict.keys()):
        movie_keywords = await get_movie_keywords(session=session)
        cluster_labels = await get_keyword_clusters(session=session)
        cluster_labels_dict = {
            label: set()
            for i in cluster_labels["clusters"]
            for key, label in cluster_labels["clusters"][i].items()
            if key == "label"
        }

        for movie_id in movie_keywords["movie_keywords"]:
            for keyword in movie_keywords["movie_keywords"][movie_id]:
                for cluster_id in cluster_labels["clusters"]:
                    if keyword in cluster_labels["clusters"][cluster_id]["keywords"]:
                        cluster_labels_dict[
                            cluster_labels["clusters"][cluster_id]["label"]
                        ].add(movie_id)

        for label, movies in cluster_labels_dict.items():
            movies = list(movies)
            for movie_id in movies:
                movie = await get_specific_movie_keywords(movie_id, session)
                for keyword_id, keyword in movie["keywords"].items():
                    keyword_cluster = KeywordClusters(
                        cluster_label=label, keyword_id=keyword_id, movie_id=movie_id
                    )
                    session.add(keyword_cluster)
        await session.commit()
        await session.flush()
        return post_keyword_clusers(session)

    return {
        "status": "clusters already exist",
        "existing_clusters_ids_labels": keyword_cluster_id_dict,
        "existing_clusters_labels_movies_ids": {
            k: list(v) for k, v in keyword_clusters_dict.items()
        },
    }


def clusterKeywords(keywords: dict) -> dict:

    keyword_names = list(
        {
            kw
            for movie in keywords["movie_keywords"]
            for kw in keywords["movie_keywords"][movie]
        }
    )  # dedupe

    # map each keyword to an index (prevents O(n²) lookup later)
    name_to_index = {name: i for i, name in enumerate(keyword_names)}

    # EMBEDDINGS
    embeddings = model.encode(keyword_names, batch_size=32, show_progress_bar=True)

    # Optional dimensionality reduction
    pca = PCA(n_components=256)
    embeddings = pca.fit_transform(embeddings)

    # Normalize for cosine
    embeddings = normalize(embeddings, norm="l2")

    # HDBSCAN CLUSTERING
    clusterer = HDBSCAN(
        min_cluster_size=5, metric="cosine", cluster_selection_method="eom"
    )

    labels = clusterer.fit_predict(embeddings)

    # ASSIGN KEYWORDS TO CLUSTERS (noise handled properly)
    clustered_keywords = {}
    noise_keywords = []

    for idx, label in enumerate(labels):
        word = keyword_names[idx]
        if label == -1:
            noise_keywords.append(word)
            continue
        clustered_keywords.setdefault(int(label), []).append(word)

    # HUMAN-READABLE CLUSTER LABELING
    # Select top 3 most representative keywords
    cluster_labels = {}

    for label, words in clustered_keywords.items():
        # get embedding indices fast
        idxs = [name_to_index[w] for w in words]
        cluster_embeds = embeddings[idxs]

        # centroid of this cluster
        centroid = np.mean(cluster_embeds, axis=0, keepdims=True)

        # cosine similarity to centroid
        sims = (cluster_embeds @ centroid.T).ravel()

        # pick top 3 representative words
        top_indices = sims.argsort()[::-1][:3]
        top_keywords = [words[i] for i in top_indices]

        # readable label
        readable_label = ", ".join(top_keywords)

        # Final structured cluster object
        cluster_labels[int(label)] = {"label": readable_label, "keywords": words}

    return cluster_labels, noise_keywords
