import { easeInOut, motion } from "motion/react";

const HeroSection = () => {
  return (
    <div
      id="hero"
      className="relative grid grid-rows-[50vh_40vh] w-screen h-[90vh] mt-[8vh] z-0"
    >
      <div className="relative flex w-full h-full justify-center items-end text-responsive-sm/tight">
        <h1 className="relative md:w-[80vw] not-md:w-[70vw] text-center font-[inria-serif] text-white text-responsive-lg/tight">
          Find <span className="text-yellow-25">comfort</span> in familiar
          movies, every time
        </h1>
      </div>
      <div className="relative flex w-full h-full items-start justify-center text-center">
        <motion.button
          initial={{
            scale: 1,
          }}
          whileHover={{
            scale: 1.25,
            transition: { duration: 0.5, ease: easeInOut },
          }}
          className="personalize-button"
        >
          Personalize
        </motion.button>
      </div>
    </div>
  );
};

export default HeroSection;
