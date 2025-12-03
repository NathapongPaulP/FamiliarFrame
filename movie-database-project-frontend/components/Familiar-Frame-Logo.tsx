"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export const FamiliarFrameLogo = () => {
  const logoRef = useRef(null);

  useEffect(() => {
    if (logoRef.current) {
      logoRef.current.style.width = "min(4rem, 10vw)";
      logoRef.current.style.height = "auto";
      logoRef.current.style.display = "block";
    }
  }, []);

  return (
    <button className="relative grid grid-cols-[25%_75%]  inria-serif-yellow-50 w-full h-full">
      <div className="relative flex justify-end items-center lg:-top-1">
        <Image
          ref={logoRef}
          src={"/homepage/familiar-frame-no-bg.png"}
          alt="Familiar Frame Logo"
          width={50}
          height={50}
          className="absolute cursor-pointer"
        />
      </div>
      <div className="relative flex left-0 top-1/3 text-responsive-xs">
        <span className="cursor-pointer">Familiar Frame</span>
      </div>
    </button>
  );
};
