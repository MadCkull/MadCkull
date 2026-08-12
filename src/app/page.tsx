export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-black min-h-screen relative overflow-hidden">
      {/* Hero section placeholder — this is what gets revealed after loading screen dissolves */}
      <main className="flex flex-1 w-full flex-col items-center justify-center relative z-10">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

        {/* Content placeholder */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-8">
          <p className="text-zinc-500 text-lg tracking-widest uppercase font-light">
            Portfolio Coming Soon
          </p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
          <p className="text-zinc-700 text-sm tracking-wider">
            Data Science &bull; AI &bull; Software Engineering
          </p>
        </div>
      </main>

      {/* Subtle ambient particles in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-white/[0.015] rounded-full blur-3xl" />
      </div>
    </div>
  );
}
