"use client";

import { ClustersIdsLabelsMovies } from "@/src/api/ClustersIdsLabelsMovies";
import { GetMovieDataFromIds } from "@/src/api/GetMovieDataFromIds";
import { MovieIds } from "@/src/api/MovieIds";
import cluster from "cluster";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { ElementType, useEffect, useRef, useState } from "react";

const Setup = () => {
  const setUpRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: setUpRef });
  const [content, setContent] = useState([]);
  const isInView = useInView(setUpRef, { amount: 0.31 });
  const [clusterIds, setClusterIds] = useState([]);
  const [clusterLabels, setClusterLabels] = useState([]);
  const [clusterMoviesIds, setClusterMoviesIds] = useState([]);
  const [dynamicKey, setDynamicKey] = useState([]);
  const [labelsList, setLabelsList] = useState([]);
  const [rawLabelList, setRawLabelList] = useState([]);
  const [setUpFixed, setSetUpFixed] = useState("");
  const [posterDisplay, setPosterDisplay] = useState("");

  useEffect(() => {
    async function fetchClustersIdsLabelsMovies() {
      const { ids, labels, movIds } = await ClustersIdsLabelsMovies();
      setClusterIds(ids);
      setClusterLabels(labels);
      setClusterMoviesIds(movIds);
      return { ids, labels, movIds };
    }
    if (isInView) {
      fetchClustersIdsLabelsMovies()
        .then(({ ids, labels, movIds }) => {
          console.log(ids);
          console.log(labels);
          console.log(movIds);
        })
        .catch((err) => err);

      setSetUpFixed("fixed");
      setPosterDisplay("flex");
    } else {
      setSetUpFixed("relative");
      setPosterDisplay("none");
    }
  }, [isInView]);

  useEffect(() => {
    async function fetchGetMovieDataFromIds() {
      const arrOfContents: string[][] = [];
      for (const ids of clusterMoviesIds) {
        const contents: string[] = [];
        for (const id of ids) {
          const getMovieDataFromIds = await GetMovieDataFromIds(id);
          contents.push(getMovieDataFromIds.movie.cluster_labels);
        }
        arrOfContents.push(contents);
      }
      setContent(arrOfContents);
      return arrOfContents;
    }

    if (clusterMoviesIds) {
      fetchGetMovieDataFromIds();
    }
  }, [clusterMoviesIds]);

  useEffect(() => {
    const labels = content.map((arr) => {
      const con = pickRandom(arr);
      return clusterLabels.includes(con) ? con : undefined;
    });

    setRawLabelList(labels);
    const setOfLabels = new Set(labels);
    setLabelsList([...setOfLabels]);
  }, [content]);

  useEffect(() => {
    const dk = labelsList.map((arr) => {
      return clusterIds[clusterLabels.indexOf(arr)];
    });
    setDynamicKey(dk);
  }, [labelsList]);

  useEffect(() => {
    const movIdsIdx = rawLabelList.map((label) => {
      return clusterMoviesIds[clusterLabels.indexOf(label)];
    });
    console.log(movIdsIdx);
  }, [rawLabelList]);

  return (
    <>
      <div
        ref={setUpRef}
        className="relative grid grid-cols-2 h-[300vh] w-screen z-1 bg-violet-1000"
      >
        <SetupText
          scrollYProgress={scrollYProgress}
          labelsList={labelsList}
          dynamicKey={dynamicKey}
          setUpFixed={setUpFixed}
        />
        <div className="w-[50vw] h-screen">
          <Poster setUpFixed={setUpFixed} posterDisplay={posterDisplay} />
        </div>
      </div>
    </>
  );
};

export default Setup;

const DynamicText = ({ scrollYProgress, content, index }) => {
  const yRange = [index * 0.1, index * 0.1 + 0.05, index * 0.1 + 0.1];
  const opacity = useTransform(scrollYProgress, yRange, [0.25, 1, 0.25]);

  return (
    <motion.div
      className="relative ml-[5vw] mb-[5vh] text-responsive-setup text-white"
      style={{ opacity }}
    >
      {content}
    </motion.div>
  );
};

const SetupText = ({ scrollYProgress, labelsList, dynamicKey, setUpFixed }) => {
  return (
    <div className="top-20 w-[50vw] h-full" style={{ position: setUpFixed }}>
      {labelsList.map((label, index) => {
        return (
          <DynamicText
            key={dynamicKey[index]}
            scrollYProgress={scrollYProgress}
            content={label}
            index={index}
          />
        );
      })}
    </div>
  );
};

const Poster = ({ setUpFixed, posterDisplay }) => {
  return (
    <>
      <motion.img
        className="top-[25vh] right-[20vw]"
        style={{
          display: posterDisplay,
          position: setUpFixed,
          height: "600px",
          width: "400px",
        }}
      ></motion.img>
    </>
  );
};

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}
