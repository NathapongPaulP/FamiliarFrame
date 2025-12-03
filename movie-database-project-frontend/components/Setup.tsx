import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
const Setup = () => {
  const setupRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: setupRef });

  const imageUrl = [
    "/movie-setup/crazy-in-love-modified.png",
    "/movie-setup/hidden-magical-world-modified.png",
    "/movie-setup/time-traveling-modified.png",
    "/movie-setup/second-chances-modified.png",
    "/movie-setup/alien-modified.png",
    "/movie-setup/faith-modified.png",
    "/movie-setup/greek-mythology-modified.png",
    "/movie-setup/mystery-modified.png",
    "/movie-setup/ghost-modified.png",
    "/movie-setup/bestfriend-modified.png",
  ];

  return (
    <motion.div
      ref={setupRef}
      className="relative w-screen bg-violet-1000"
      style={{
        height: "300vh",
      }}
    >
      <SetUpBG scrollYProgress={scrollYProgress} imageUrl={imageUrl} />
      <div className="sticky top-0 grid grid-cols-2 w-screen h-screen">
        <SetUpText scrollYProgress={scrollYProgress} />
        <div className="relative grid grid-rows-[15vh_45vh_40vh]">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </motion.div>
  );
};

export default Setup;

const DynamicText = ({ scrollYProgress, size, opac, tf, content }) => {
  const { from1, between1, to1 } = size;
  const { from2, between2, to2 } = opac;
  const { tf1, tf2, tf3 } = tf;
  const textSize = useTransform(
    scrollYProgress,
    [tf1, tf2, tf3],
    [from1, between1, to1]
  );
  const textOpac = useTransform(
    scrollYProgress,
    [tf1, tf2, tf3],
    [from2, between2, to2]
  );

  return (
    <motion.h1
      style={{
        fontSize: textSize,
        opacity: textOpac,
      }}
    >
      {content}
    </motion.h1>
  );
};

const SetUpText = ({ scrollYProgress }) => {
  const isMobile = window.matchMedia("(max-width: 1024px)").matches;
  const focusSize = isMobile ? "2rem" : "6rem";
  const hiddenSize = isMobile ? "1rem" : "5rem";

  return (
    <div className="relative grid grid-rows-5 text-white items-center ml-[5vw] font-bold">
      <DynamicText
        scrollYProgress={scrollYProgress}
        size={{ from1: hiddenSize, between1: focusSize, to1: hiddenSize }}
        opac={{ from2: 0.5, between2: 1, to2: 0.5 }}
        tf={{ tf1: 0, tf2: 0.1, tf3: 0.2 }}
        content={"Carzy In Love"}
      />
      <DynamicText
        scrollYProgress={scrollYProgress}
        size={{ from1: hiddenSize, between1: focusSize, to1: hiddenSize }}
        opac={{ from2: 0.5, between2: 1, to2: 0.5 }}
        tf={{ tf1: 0.2, tf2: 0.3, tf3: 0.4 }}
        content={"Hidden Magical World"}
      />
      <DynamicText
        scrollYProgress={scrollYProgress}
        size={{ from1: hiddenSize, between1: focusSize, to1: hiddenSize }}
        opac={{ from2: 0.5, between2: 1, to2: 0.5 }}
        tf={{ tf1: 0.4, tf2: 0.5, tf3: 0.6 }}
        content={"Time Travelling"}
      />
      <DynamicText
        scrollYProgress={scrollYProgress}
        size={{ from1: hiddenSize, between1: focusSize, to1: hiddenSize }}
        opac={{ from2: 0.5, between2: 1, to2: 0.5 }}
        tf={{ tf1: 0.6, tf2: 0.7, tf3: 0.8 }}
        content={"Alien"}
      />
      <DynamicText
        scrollYProgress={scrollYProgress}
        size={{ from1: hiddenSize, between1: focusSize, to1: hiddenSize }}
        opac={{ from2: 0.5, between2: 1, to2: 0.5 }}
        tf={{ tf1: 0.8, tf2: 0.9, tf3: 1 }}
        content={"Mystery"}
      />
    </div>
  );
};

const BackgroundTrans = ({ scrollYProgress, opac, tf, image }) => {
  const { from, between1, between2, between3, to } = opac;
  const { tf1, tf2, tf3, tf4, tf5 } = tf;
  const { imageUrl, idx } = image;

  const backgroundTrans = useTransform(
    scrollYProgress,
    [tf1, tf2, tf3, tf4, tf5],
    [from, between1, between2, between3, to]
  );
  return (
    <motion.div
      className="absolute w-screen bg-contain bg-center blur-2xl"
      style={{
        backgroundImage: `url(${imageUrl[idx]})`,
        height: "300vh",
        opacity: backgroundTrans,
      }}
    ></motion.div>
  );
};

const SetUpBG = ({ scrollYProgress, imageUrl }) => {
  return (
    <>
      <BackgroundTrans
        scrollYProgress={scrollYProgress}
        opac={{ from: 1, between1: 1, between2: 1, between3: 1, to: 0 }}
        tf={{ tf1: 0, tf2: 0.01, tf3: 0.1, tf4: 0.19, tf5: 0.2 }}
        image={{ imageUrl: imageUrl, idx: 0 }}
      />
      <BackgroundTrans
        scrollYProgress={scrollYProgress}
        opac={{ from: 0, between1: 1, between2: 1, between3: 1, to: 0 }}
        tf={{ tf1: 0.2, tf2: 0.21, tf3: 0.3, tf4: 0.39, tf5: 0.4 }}
        image={{ imageUrl: imageUrl, idx: 1 }}
      />
      <BackgroundTrans
        scrollYProgress={scrollYProgress}
        opac={{ from: 0, between1: 1, between2: 1, between3: 1, to: 0 }}
        tf={{ tf1: 0.4, tf2: 0.41, tf3: 0.5, tf4: 0.59, tf5: 0.6 }}
        image={{ imageUrl: imageUrl, idx: 2 }}
      />
      <BackgroundTrans
        scrollYProgress={scrollYProgress}
        opac={{ from: 0, between1: 1, between2: 1, between3: 1, to: 0 }}
        tf={{ tf1: 0.6, tf2: 0.61, tf3: 0.7, tf4: 0.79, tf5: 0.8 }}
        image={{ imageUrl: imageUrl, idx: 4 }}
      />
      <BackgroundTrans
        scrollYProgress={scrollYProgress}
        opac={{ from: 0, between1: 1, between2: 1, between3: 1, to: 1 }}
        tf={{ tf1: 0.8, tf2: 0.81, tf3: 0.9, tf4: 0.99, tf5: 1 }}
        image={{ imageUrl: imageUrl, idx: 7 }}
      />
    </>
  );
};
