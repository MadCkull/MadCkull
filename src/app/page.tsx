import { DynamicIdentity } from "@/components/hero/DynamicIdentity";
import { EditorialStatement } from "@/components/hero/EditorialStatement";
import { Portrait } from "@/components/hero/Portrait";
import { SocialIcons } from "@/components/hero/SocialIcons";
import { Greeting } from "@/components/hero/Greeting";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-black min-h-screen relative overflow-hidden selection:bg-zinc-800 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none z-0" />
      
      <Portrait />
      
      {/* 
        Top-Left Block 
        Uses absolute positioning to match the layout request.
      */}
      <div className="absolute left-[8vw] top-[20vh] z-20 pointer-events-auto">
        {/* Greeting positioned above the name */}
        <div className="absolute bottom-full mb-1 ml-1 w-max">
          <Greeting />
        </div>
        
        {/* Spacer mirroring the SVG text height so content below sits correctly */}
        <div className="h-[24px] sm:h-[30px] md:h-[38px] lg:h-[44px]" aria-hidden="true" />
        
        {/* 
          The width perfectly matches the SVG name's scaled right edge.
          Calculated as: 1vw (offset from 8vw to 9vw) + (SVG_Width * 0.85 visual scale)
        */}
        <div className="mt-2 w-[calc(1vw+216px)] sm:w-[calc(1vw+278px)] md:w-[calc(1vw+339px)] lg:w-[calc(1vw+401px)]">
          <DynamicIdentity />
        </div>
        <div className="ml-1 mt-6">
          <SocialIcons />
        </div>
      </div>

      {/* 
        Center-Bottom Block 
        Uses flex to center the editorial statement in the remaining space.
        Padding left avoids the absolute positioned elements above.
      */}
      <main className="relative z-10 flex-1 flex flex-col justify-center pl-[16vw] pr-6 pt-[35vh] pb-12 pointer-events-auto w-full md:w-3/4 lg:w-2/3">
        <EditorialStatement />
      </main>

      {/* Subtle ambient particles in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-white/[0.015] rounded-full blur-3xl mix-blend-screen" />
      </div>
    </div>
  );
}
