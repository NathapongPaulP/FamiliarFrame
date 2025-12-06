export async function GetMovieDataFromIds(movieId: number) {
  const res = await fetch(
    `http://localhost:8000/movies/by_id?movie_id=${movieId}`,
    { method: "GET", headers: { "Content-Type": "application/json" } }
  );
  const data = await res.json();
  return data;
}
