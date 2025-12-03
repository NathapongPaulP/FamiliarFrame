"use client";

import { useState } from "react";
import { Hamburger } from "./icons";

const HamburgerButton = () => {
  const [isOpenState, setIsOpenState] = useState(true);

  return (
    <button className="relative md:hidden not-md:inline flex justify-start">
      <Hamburger
        onClick={() => setIsOpenState((bool) => !bool)}
        fill="#fada93"
        style={{ width: "min(4vw, 50px)", height: "auto", display: "block" }}
        className="cursor-pointer"
      />
      <div
        className={`absolute -left-[80vw] top-0 w-screen h-[50vh] grid grid-rows-[10vw_10vh_10vh_10vh_10vh] bg-violet-1000 inder-yellow-50 text-responsive-sm items-center overflow-hidden transition-all duration-500 ${
          isOpenState ? "max-h-0" : "max-h-[500px]" 
        }`}
      >
        <div className="relative flex w-full h-full bg-violet-980 justify-end items-center ">
          <Hamburger
            onClick={() => setIsOpenState((bool) => !bool)}
            fill="#fada93"
            style={{
              width: "min(4vw, 50px)",
              height: "auto",
              display: "block",
            }}
            className="cursor-pointer mr-[5vw]"
          />
        </div>
        <div>Personalize</div>
        <div>Familiar</div>
        <div>Directors</div>
        <div>Casts</div>
      </div>
    </button>
  );
};

export default HamburgerButton;
