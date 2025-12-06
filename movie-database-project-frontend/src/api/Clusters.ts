import { Onest } from "next/font/google";

export async function Clusters() {
  const res = await fetch(`http://localhost:8000/keywords/clusters`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const clusters = await res.json();
  const clustersLength = Object.keys(clusters.clusters).length;
  return clustersLength;
}
