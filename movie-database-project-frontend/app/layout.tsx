import type { Metadata } from "next";
import { Inria_Serif, Inder } from "next/font/google";
import "./globals.css";

const inriaSerif = Inria_Serif({
  variable: "--font-inria-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700"]
});

const inder = Inder({
  variable: "--font-inder",
  subsets: ["latin"],
  weight: ["400"]
});

export const metadata: Metadata = {
  title: "PickyWathcer",
  description: "Can't find a movie to watch? Let's go through your past favorite and find similar new movies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inriaSerif.variable} ${inder.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
