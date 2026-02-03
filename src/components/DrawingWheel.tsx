import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Participant } from '../types';

interface DrawingWheelProps {
  participants: Participant[];
  isDrawing: boolean;
  winner: Participant | null;
  placeLabel: string;
}

export function DrawingWheel({
  participants,
  isDrawing,
  winner,
  placeLabel
}: DrawingWheelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(50);

  useEffect(() => {
    if (!isDrawing) return;

    // Create weighted array for fair selection during animation
    const weightedParticipants: number[] = [];
    participants.forEach((p, idx) => {
      for (let i = 0; i < p.totalTickets; i++) {
        weightedParticipants.push(idx);
      }
    });

    const interval = setInterval(() => {
      const randomWeightedIndex = weightedParticipants[
        Math.floor(Math.random() * weightedParticipants.length)
      ];
      setCurrentIndex(randomWeightedIndex);
    }, speed);

    // Slow down gradually
    const slowDown = setInterval(() => {
      setSpeed((prev) => Math.min(prev + 15, 300));
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(slowDown);
    };
  }, [isDrawing, participants, speed]);

  useEffect(() => {
    if (!isDrawing) {
      setSpeed(50);
    }
  }, [isDrawing]);

  const displayParticipant = winner || participants[currentIndex];

  return (
    <div className="relative">
      {/* Glowing background */}
      <motion.div
        animate={{
          scale: isDrawing ? [1, 1.1, 1] : 1,
          opacity: isDrawing ? [0.5, 0.8, 0.5] : 0.3
        }}
        transition={{ duration: 0.5, repeat: isDrawing ? Infinity : 0 }}
        className="absolute inset-0 bg-gradient-to-r from-[#007bc7] via-sky-400 to-[#007bc7] rounded-3xl blur-xl"
      />

      <div className="relative bg-slate-900/90 backdrop-blur-lg rounded-3xl p-8 border border-slate-700">
        {/* Header */}
        <motion.div
          animate={{ opacity: isDrawing ? [0.5, 1, 0.5] : 1 }}
          transition={{ duration: 0.3, repeat: isDrawing ? Infinity : 0 }}
          className="text-center mb-6"
        >
          <span className="text-lg text-slate-400">Drawing for</span>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#007bc7]">
            {placeLabel}
          </h2>
        </motion.div>

        {/* Name display */}
        <div className="min-h-[120px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayParticipant?.id}
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -50, opacity: 0, rotateX: 90 }}
              transition={{ duration: isDrawing ? 0.05 : 0.3 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: winner ? [1, 1.2, 1] : 1,
                  textShadow: winner
                    ? '0 0 30px rgba(250, 204, 21, 0.8)'
                    : '0 0 0px transparent'
                }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-white mb-2"
              >
                {displayParticipant?.name}
              </motion.div>
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <TicketIcon />
                <span className="text-lg">{displayParticipant?.totalTickets} tickets</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Spinning indicator */}
        {isDrawing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 right-4"
          >
            <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TicketIcon() {
  return (
    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
    </svg>
  );
}
