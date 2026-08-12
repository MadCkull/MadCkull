"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, animate, MotionValue } from "motion/react";
import { interpolate } from "flubber";
import { LETTER_DATA } from "./letters";
import { useLoadingState } from "./useLoadingState";
import { ParticleField } from "./ParticleField";
import { LOADING } from "@/lib/constants";

// ----- Types & Constants -----

type AnimationPhase =
  | "black" // pitch black, nothing visible
  | "fadeIn" // MadCkull fading in
  | "breathing" // MadCkull visible, glow + breathe loop
  | "transitioning" // crossfading to Hassan Ali + position shift
  | "dissolving" // particle dissolution, revealing page
  | "done"; // removed overlay, logo stays

const FROM_WORD = ["M", "A", "D", "C", "K", "U", null, null, "L", "L"];
const TO_WORD = ["H", "A", "S", "S", "A", "N", " ", "A", "L", "I"];

const LETTER_GAP_RATIO = 0.08;
const SPACE_WIDTH_RATIO = 0.45;

// ----- Layout Helper -----

function getLayout(word: (string | null)[], height: number) {
  const layout = [];
  let currentX = 0;
  const scale = height / 976.15;

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (char === null) {
      layout.push({ char: null, x: currentX, width: 0 });
    } else if (char === " ") {
      const w = height * SPACE_WIDTH_RATIO;
      layout.push({ char: " ", x: currentX, width: w });
      currentX += w;
    } else {
      const data = LETTER_DATA[char];
      const w = data ? data.width * scale : 0;
      layout.push({ char, x: currentX, width: w });
      currentX += w + height * LETTER_GAP_RATIO;
    }
  }
  return { layout, totalWidth: currentX > 0 ? currentX - height * LETTER_GAP_RATIO : 0 };
}

// ----- Morphing Letter Component -----

interface MorphingLetterProps {
  fromChar: string | null;
  toChar: string | null;
  fromX: number;
  toX: number;
  progress: MotionValue<number>;
  height: number;
  className?: string;
}

function MorphingLetter({
  fromChar,
  toChar,
  fromX,
  toX,
  progress,
  height,
  className,
}: MorphingLetterProps) {
  const fromData = fromChar && fromChar !== " " ? LETTER_DATA[fromChar] : null;
  const toData = toChar && toChar !== " " ? LETTER_DATA[toChar] : null;

  const pathInterpolator = useMemo(() => {
    if (fromData && toData && fromData.path !== toData.path) {
      return interpolate(fromData.path, toData.path, { maxSegmentLength: 15 });
    }
    return null;
  }, [fromData, toData]);

  const pathD = useTransform(progress, [0, 1], [0, 1], {
    mixer: () => (t: number) => {
      if (pathInterpolator) return pathInterpolator(t);
      if (toData && t > 0.5) return toData.path;
      if (fromData) return fromData.path;
      return "";
    },
  });

  const scale = height / 976.15;
  const fromWidth = fromData ? fromData.width * scale : 0;
  const toWidth = toData ? toData.width * scale : 0;

  const width = useTransform(progress, [0, 1], [fromWidth, toWidth]);
  const x = useTransform(progress, [0, 1], [fromX, toX]);

  const opacity = useTransform(progress, (v) => {
    if (fromChar === null) return v;
    if (toChar === null) return 1 - v;
    return 1;
  });

  const isSpace = toChar === " " && fromChar === null;
  if (isSpace || (!fromData && !toData)) {
    return null;
  }

  return (
    <motion.svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        x,
        width,
        height,
        opacity,
      }}
      overflow="visible"
      className={className}
    >
      <g transform={`scale(${scale})`}>
        <motion.path d={pathD} fill="currentColor" />
      </g>
    </motion.svg>
  );
}

// Wrapper for useTransform that checks if progress exists (motion/react v13 syntax)
import { useTransform } from "motion/react";

// ----- Main Component -----

export function LoadingScreen() {
  const [phase, setPhase] = useState<AnimationPhase>("black");
  const { isPageLoaded } = useLoadingState();
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

  const morphProgress = useMotionValue(0);

  // Phase progression
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setPhase("fadeIn");
    }, LOADING.FADE_IN_DELAY);

    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    if (phase !== "fadeIn") return;

    const breatheTimer = setTimeout(() => {
      setPhase("breathing");
    }, LOADING.FADE_IN_DURATION);

    return () => clearTimeout(breatheTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "breathing") return;

    // Start the minimum display timer only once MadCkull is fully visible
    const minDisplayTimer = setTimeout(() => {
      setHasMinTimeElapsed(true);
    }, LOADING.MIN_DISPLAY_TIME);

    return () => clearTimeout(minDisplayTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "breathing" || !isPageLoaded || !hasMinTimeElapsed) return;

    const transTimer = setTimeout(() => {
      setPhase("transitioning");
    }, 300);

    return () => clearTimeout(transTimer);
  }, [phase, isPageLoaded, hasMinTimeElapsed]);

  useEffect(() => {
    if (phase !== "transitioning") return;

    // Trigger the morphing algorithm via motion value
    animate(morphProgress, 1, {
      duration: LOADING.TRANSITION_DURATION / 1000,
      ease: [0.25, 0.46, 0.45, 0.94],
    });

    const dissolveTimer = setTimeout(() => {
      setPhase("dissolving");
    }, LOADING.TRANSITION_DURATION);

    return () => clearTimeout(dissolveTimer);
  }, [phase, morphProgress]);

  const handleDissolveComplete = useCallback(() => {
    setPhase("done");
  }, []);

  const [letterHeight, setLetterHeight] = useState(48);
  useEffect(() => {
    const vw = window.innerWidth;
    if (vw < 480) setLetterHeight(28);
    else if (vw < 768) setLetterHeight(36);
    else if (vw < 1024) setLetterHeight(44);
    else setLetterHeight(52);
  }, []);

  const fromLayout = useMemo(() => getLayout(FROM_WORD, letterHeight), [letterHeight]);
  const toLayout = useMemo(() => getLayout(TO_WORD, letterHeight), [letterHeight]);

  const containerWidth = useTransform(
    morphProgress,
    [0, 1],
    [fromLayout.totalWidth, toLayout.totalWidth]
  );

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[9999]"
        style={{
          background: "#000",
          pointerEvents: phase === "done" ? "none" : "auto",
        }}
        animate={{
          backgroundColor:
            phase === "dissolving" || phase === "done"
              ? "rgba(0, 0, 0, 0)"
              : "rgba(0, 0, 0, 1)",
        }}
        transition={{
          duration: LOADING.DISSOLVE_DURATION / 1000,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className={`absolute text-white ${
            phase === "breathing" ? "loading-neon-glow loading-breathe" : ""
          }`}
          initial={{
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
            scale: 1,
            opacity: 0,
          }}
          animate={{
            left:
              phase === "transitioning" || phase === "dissolving" || phase === "done"
                ? "5vw"
                : "50%",
            top:
              phase === "transitioning" || phase === "dissolving" || phase === "done"
                ? "5vh"
                : "50%",
            x:
              phase === "transitioning" || phase === "dissolving" || phase === "done"
                ? "0%"
                : "-50%",
            y:
              phase === "transitioning" || phase === "dissolving" || phase === "done"
                ? "0%"
                : "-50%",
            scale:
              phase === "transitioning" || phase === "dissolving" || phase === "done"
                ? 0.85
                : 1,
            opacity: phase === "black" ? 0 : 1,
          }}
          transition={{
            duration:
              phase === "fadeIn"
                ? LOADING.FADE_IN_DURATION / 1000
                : LOADING.TRANSITION_DURATION / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ width: containerWidth, height: letterHeight, pointerEvents: "auto" }}
        >
          {phase !== "black" &&
            FROM_WORD.map((char, i) => (
              <MorphingLetter
                key={i}
                fromChar={FROM_WORD[i]}
                toChar={TO_WORD[i]}
                fromX={fromLayout.layout[i].x}
                toX={toLayout.layout[i].x}
                progress={morphProgress}
                height={letterHeight}
              />
            ))}
        </motion.div>
      </motion.div>

      <ParticleField
        active={phase === "dissolving"}
        onComplete={handleDissolveComplete}
      />
    </>
  );
}
