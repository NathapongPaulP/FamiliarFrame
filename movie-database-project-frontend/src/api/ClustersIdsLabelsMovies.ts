export async function ClustersIdsLabelsMovies() {
  const res = await fetch("http://localhost:8000/keywords/create_clusters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();

  const idsArr: string[] = [];
  const arrOfLabelsIdsIdx: number[] = [];

  const labelsToMovIds = Object.keys(data.existing_clusters_labels_movies_ids);
  const labelsToMovIdsValues = Object.values(
    data.existing_clusters_labels_movies_ids
  );
  const allIdsToLabels = Object.keys(data.existing_clusters_ids_labels);
  const allIdsToLabelsValues = Object.values(data.existing_clusters_ids_labels);

  for (const label of labelsToMovIds) {
    arrOfLabelsIdsIdx.push(allIdsToLabelsValues.indexOf(label));
  }

  arrOfLabelsIdsIdx.forEach((id) => {
    idsArr.push(allIdsToLabels[id]);
  });

  return { ids: idsArr, labels: labelsToMovIds, movIds: labelsToMovIdsValues };
}
