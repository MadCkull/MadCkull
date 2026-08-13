"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const STATEMENTS = [
  "I build things\nto understand\nhow they work.",
  "I like taking complicated things apart.\nAnd putting them back together differently.",
  "Somewhere between the question and the answer,\nthere is usually something worth building.",
  "Data rarely gives you the answer.\nIt gives you a better question.",
  "I make computers do things\nthey probably weren't asked to do.",
];

export function EditorialStatement() {
  const [statement, setStatement] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 3-day rotation
    const daysSinceEpoch = Math.floor(Date.now() / 86400000);
    const rotationPeriod = Math.floor(daysSinceEpoch / 3);
    const index = rotationPeriod % STATEMENTS.length;
    
    setStatement(STATEMENTS[index]);
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="max-w-2xl mt-12 md:mt-0">
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-zinc-100 leading-tight md:leading-[1.1] tracking-tight whitespace-pre-line">
        {statement}
      </h2>
    </div>
  );
}
