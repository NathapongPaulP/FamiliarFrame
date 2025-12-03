import type { SVGProps } from "react";
const SvgHamburger = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 50 50"
    {...props}
  >
    <path d="M5 8a2 2 0 1 0 0 4h40a2 2 0 1 0 0-4zm0 15a2 2 0 1 0 0 4h40a2 2 0 1 0 0-4zm0 15a2 2 0 1 0 0 4h40a2 2 0 1 0 0-4z" />
  </svg>
);
export default SvgHamburger;
