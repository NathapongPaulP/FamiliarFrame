export async function MovieIds() {
  let allData;
  let collectedMovieIds: number[] = [];

  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`http://localhost:8000/movies?page=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    allData = await res.json();
    allData.movies.forEach((movie) => {
      collectedMovieIds.push(movie.id);
    });
  }
  return collectedMovieIds;
}
