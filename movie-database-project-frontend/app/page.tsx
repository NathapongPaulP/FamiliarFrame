"use client";

import { useEffect, useRef, useState } from "react";
import HeroSection from "@/components/Hero-Section";
import { NavBar } from "@/components/NavBar";
import Setup from "@/components/Setup";

const HomePage = () => {
  return (
    <>
      <main className="bg-familiar-frame overflow-x-hidden">
        <div className="relative grid grid-rows-[10vh 90vh] w-screen h-screen">
          <NavBar />
          <HeroSection />
        </div>
      </main>
      <div className="relative flex justify-center items-center w-screen h-[30vh] bg-violet-980 overflow-x-hidden"></div>
      <Setup />
    </>
  );
};

export default HomePage;
