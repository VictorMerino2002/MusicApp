"use client";
import { useState } from "react";
import Track from "./types";
import SearchPage from "./pages/Search";
import { PageSelector } from "./components/PageSelector";

export default function Home() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPage, setCurrentPage] = useState(<SearchPage setCurrentTrack={setCurrentTrack}/>)

  return (
    <PageSelector />
  );
}
