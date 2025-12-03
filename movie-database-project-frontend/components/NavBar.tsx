"use client";

import HamburgerButton from "./HamburgerButton";
import { FamiliarFrameLogo } from "./Familiar-Frame-Logo";

export const NavBar = () => {
  return (
    <div
      className={`fixed grid md:grid-cols-[10vw_10vw_16vw_52vw_12vw] not-md:grid-cols-[80vw_20vw] w-screen h-[8vh] z-10`}
    >
      <button className="navbar-text justify-end">Setup</button>
      <button className="navbar-text justify-center">Directors</button>
      <button className="navbar-text justify-start">Casts</button>
      <FamiliarFrameLogo />
      <button className="navbar-text justify-start">Personalize</button>
      <HamburgerButton />
    </div>
  );
};
