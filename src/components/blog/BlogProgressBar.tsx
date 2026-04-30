"use client";

import { useEffect, useState } from "react";

export function BlogProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollY = window.scrollY;
      
      const scrollPercent = (scrollY / (documentHeight - windowHeight)) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
      <div 
        className="h-full bg-[var(--accent)] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(26,94,63,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
