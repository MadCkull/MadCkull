"use client";

import { DynamicIdentity } from "@/components/hero/DynamicIdentity";
import { EditorialStatement } from "@/components/hero/EditorialStatement";
import { Portrait } from "@/components/hero/Portrait";
import { SocialIcons } from "@/components/hero/SocialIcons";
import { Greeting } from "@/components/hero/Greeting";
import { Threadrift, useThreadriftStore } from "@/systems/threadrift";

export default function Home() {
  const scrollCurrent = useThreadriftStore((s) => s.scrollCurrent);

  // Parallax Math for Hero
  // scrollCurrent goes from -1 (Top) to 0 (Threadrift Start)
  const heroProgress = Math.max(0, Math.min(1, scrollCurrent + 1));
  const heroTranslateY = heroProgress * -50; // Translates UP by 50vh as we scroll down
  const heroOpacity = 1 - Math.min(1, heroProgress * 1.5); // Fades out completely by 66% progress

  return (
    <div className="flex flex-col flex-1 bg-black w-full selection:bg-zinc-800 selection:text-white overflow-hidden relative">
      
      {/* HERO SECTION */}
      {heroProgress < 0.99 && (
        <section 
          className="absolute inset-0 w-full h-screen overflow-hidden flex flex-col flex-1 z-10 bg-black will-change-transform"
          style={{
            transform: `translateY(${heroTranslateY}vh)`,
            opacity: heroOpacity,
          }}
        >
          <Portrait />
          
          {/* Top-Left Block */}
          <div className="absolute left-[8vw] top-[20vh] z-20 pointer-events-auto">
            <div className="absolute bottom-full mb-1 ml-1 w-max">
              <Greeting />
            </div>
            <div className="h-[24px] sm:h-[30px] md:h-[38px] lg:h-[44px]" aria-hidden="true" />
            <div className="mt-2 w-[calc(1vw+216px)] sm:w-[calc(1vw+278px)] md:w-[calc(1vw+339px)] lg:w-[calc(1vw+401px)]">
              <DynamicIdentity />
            </div>
            <div className="ml-1 mt-6">
              <SocialIcons />
            </div>
          </div>

          {/* Center-Bottom Block */}
          <main className="relative z-10 flex-1 flex flex-col justify-center pl-[16vw] pr-6 pt-[35vh] pb-12 pointer-events-auto w-full md:w-3/4 lg:w-2/3">
            <EditorialStatement />
          </main>
        </section>
      )}

      {/* THREADRIFT SYSTEM */}
      <Threadrift />

    </div>
  );
}

