"use client";

import { ClustersIdsLabelsMovies } from "@/src/api/ClustersIdsLabelsMovies";
import { GetMovieDataFromIds } from "@/src/api/GetMovieDataFromIds";
import { MovieIds } from "@/src/api/MovieIds";
import cluster from "cluster";
import { read } from "fs";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
  const [rawLabelObj, setRawLabelObj] = useState({});
  const [setUpFixed, setSetUpFixed] = useState("");
  const [posterDisplay, setPosterDisplay] = useState("");
  const [movIdsToDisplay, setMovIdsToDisplay] = useState([]);
  const [posterPath, setPosterPath] = useState([]);
  const [backdropPath, setBackdropPath] = useState([]);
  const [onHoverImage, setOnHoverImage] = useState(true);
  const [ready, setReady] = useState(false);

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
      if (clusterLabels.includes(con)) return con;
    });

    const labelsObj = content.map((arr) => {
      const con = arr[Math.floor(Math.random() * arr.length)];
      return { label: con, idx: clusterLabels.indexOf(con) };
    });

    console.log(content);
    setRawLabelObj(labelsObj);
    const setOfLabels = new Set(labels);
    setLabelsList([...setOfLabels]);
  }, [content]);

  useEffect(() => {
    if (labelsList.length === 0) {
      return;
    }
    const dk = labelsList.map((arr) => {
      return clusterIds[clusterLabels.indexOf(arr)];
    });
    setDynamicKey(dk);
  }, [isInView, clusterMoviesIds, content, labelsList]);

  useEffect(() => {
    const movIds = Object.keys(rawLabelObj).map((key, index) => {
      const { label, idx } = rawLabelObj[key];
      return clusterMoviesIds[index][idx];
    });

    const filteredMovIds = movIds.filter((x) => x !== undefined);

    setMovIdsToDisplay(filteredMovIds);
    console.log(filteredMovIds);
    console.log(rawLabelObj);
  }, [isInView, clusterMoviesIds, content, labelsList, rawLabelObj]);

  useEffect(() => {
    async function fetchMoviesToDisplay() {
      const moviePosterDatas = [];
      const movieBackdropDatas = [];
      for (const id of movIdsToDisplay) {
        const data = await GetMovieDataFromIds(id);
        const dataKey = Object.keys(data.movie);
        for (const key of dataKey) {
          if (key === "poster_path") {
            moviePosterDatas.push(data.movie[key]);
          } else if (key === "backdrop_path") {
            movieBackdropDatas.push(data.movie[key]);
          }
        }
      }
      setPosterPath(moviePosterDatas);
      setBackdropPath(movieBackdropDatas);
      return { moviePosterDatas, movieBackdropDatas };
    }
    fetchMoviesToDisplay();
  }, [movIdsToDisplay]);

  return (
    <>
      <div
        ref={setUpRef}
        className="relative flex h-[300vh] w-screen z-1 bg-violet-1000"
      >
        <SetupText
          scrollYProgress={scrollYProgress}
          labelsList={labelsList}
          dynamicKey={dynamicKey}
          ready={ready}
        />
        <div className="w-[50vw] h-screen">
          <Poster
            setUpFixed={setUpFixed}
            posterDisplay={posterDisplay}
            posterPath={posterPath}
            scrollYProgress={scrollYProgress}
            onHoverImage={onHoverImage}
            setOnHoverImage={setOnHoverImage}
            backdropPath={backdropPath}
            ready={ready}
          />
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
      className="relative ml-[5vw] mb-[5vh] max-[1921px]:text-responsive-xs min-[2560]:text-responsive-sm text-white"
      style={{ opacity }}
    >
      {content}
    </motion.div>
  );
};

const SetupText = ({ scrollYProgress, labelsList, dynamicKey, ready }) => {
  if (!ready)
    return (
      <div className="sticky top-[15vh] mt-20 w-[50vw] h-screen">
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

const Poster = ({
  setUpFixed,
  posterDisplay,
  posterPath,
  scrollYProgress,
  onHoverImage,
  setOnHoverImage,
  backdropPath,
  ready,
}) => {
  if (!ready)
    return posterPath.map((path, index) => {
      return (
        <DynamicPoster
          key={index}
          scrollYProgress={scrollYProgress}
          path={path}
          index={index}
          posterDisplay={posterDisplay}
          setUpFixed={setUpFixed}
          onHoverImage={onHoverImage}
          setOnHoverImage={setOnHoverImage}
          backdropPath={backdropPath}
        />
      );
    });
};

const DynamicPoster = ({
  scrollYProgress,
  path,
  index,
  posterDisplay,
  setUpFixed,
  onHoverImage,
  setOnHoverImage,
  backdropPath,
}) => {
  const yRange = [
    index * 0.1,
    index * 0.1 + 0.01,
    index * 0.1 + 0.05,
    index * 0.1 + 0.099,
    index * 0.1 + 0.1,
  ];
  const display = useTransform(scrollYProgress, yRange, [
    "none",
    "flex",
    "flex",
    "flex",
    "none",
  ]);

  return (
    <motion.div
      className="flex top-[20vh] left-[64vw] justify-center align-middle"
      key={index}
      style={{
        display: posterDisplay,
        position: setUpFixed,
        width: "auto",
        height: "50vh",
      }}
      whileHover={{ width: "75vh", height: "50vh", left: "51vw" }}
    >
      <motion.img
        src={onHoverImage ? path : backdropPath[index]}
        style={{
          height: "100%",
          width: "auto",
          display,
        }}
        whileHover={{ width: "150%", height: "auto" }}
        onHoverStart={() => setOnHoverImage(false)}
        onHoverEnd={() => setOnHoverImage(true)}
        transition={{duration: 0.1}}
      ></motion.img>
    </motion.div>
  );
};

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}
