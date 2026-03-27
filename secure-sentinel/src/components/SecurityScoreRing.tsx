import { getScoreColor, getScoreLabel } from "@/lib/mock-data";
import { motion } from "framer-motion";

interface SecurityScoreRingProps {
  score: number;
  size?: "sm" | "lg";
}

export function SecurityScoreRing({ score, size = "lg" }: SecurityScoreRingProps) {
  const dimension = size === "lg" ? 220 : 130;
  const strokeWidth = size === "lg" ? 10 : 7;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const strokeColor =
    score >= 80 ? "hsl(160 100% 45%)" : score >= 60 ? "hsl(38 100% 55%)" : "hsl(0 85% 60%)";

  const glowColor =
    score >= 80 ? "160, 100%, 45%" : score >= 60 ? "38, 100%, 55%" : "0, 85%, 60%";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: dimension + 20,
          height: dimension + 20,
          background: `radial-gradient(circle, hsla(${glowColor}, 0.1) 0%, transparent 70%)`,
        }}
      />
      <svg width={dimension} height={dimension} className="-rotate-90">
        {/* Track */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="hsl(225 20% 14%)"
          strokeWidth={strokeWidth}
        />
        {/* Dashed track markers */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="hsl(225 20% 18%)"
          strokeWidth={1}
          strokeDasharray="4 8"
        />
        {/* Progress */}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 8px ${strokeColor}60) drop-shadow(0 0 20px ${strokeColor}30)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className={`font-display font-bold ${size === "lg" ? "text-5xl" : "text-2xl"} ${getScoreColor(score)}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}
