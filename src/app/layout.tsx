import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "REC AI & DS Opportunities Portal | Rajalakshmi Engineering College",
  description:
    "Official Hackathon, Workshop, Seminar & Internship Opportunities Portal for the Department of Artificial Intelligence and Data Science, Rajalakshmi Engineering College (Autonomous), Chennai.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
