import type { Metadata } from "next";
import "./globals.css";
import { Bricolage_Grotesque, Space_Grotesk, DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "REC AI & DS Opportunities Portal | Rajalakshmi Engineering College",
  description:
    "Official Hackathon, Workshop, Seminar & Internship Opportunities Portal for the Department of Artificial Intelligence and Data Science, Rajalakshmi Engineering College (Autonomous), Chennai.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        bricolage.variable,
        spaceGrotesk.variable,
        dmSans.variable,
        "font-body"
      )}
    >
      <body className="bg-[#FFF9E9] text-[#171717] selection:bg-[#F12D2D] selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
