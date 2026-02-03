import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Participant } from '../types';

interface SlotMachineProps {
  participants: Participant[];
  isSpinning: boolean;
  winner: Participant | null;
  onTick?: () => void;
}

export function SlotMachine({ participants, isSpinning, winner, onTick }: SlotMachineProps) {
  const [displayNames, setDisplayNames] = useState<string[]>(['?', '?', '?']);
  const [speed, setSpeed] = useState(50);
  const [isRevealing, setIsRevealing] = useState(false);

  // Create weighted pool
  const getWeightedPool = useCallback(() => {
    const pool: Participant[] = [];
    participants.forEach(p => {
      for (let i = 0; i < p.totalTickets; i++) {
        pool.push(p);
      }
    });
    return pool;
  }, [participants]);

  useEffect(() => {
    if (!isSpinning || winner) return;

    const pool = getWeightedPool();

    const interval = setInterval(() => {
      const randomNames = [
        pool[Math.floor(Math.random() * pool.length)].name,
        pool[Math.floor(Math.random() * pool.length)].name,
        pool[Math.floor(Math.random() * pool.length)].name,
      ];
      setDisplayNames(randomNames);
      onTick?.();
    }, speed);

    // Gradually slow down
    const slowDown = setInterval(() => {
      setSpeed(prev => Math.min(prev + 20, 400));
    }, 300);

    return () => {
      clearInterval(interval);
      clearInterval(slowDown);
    };
  }, [isSpinning, winner, speed, getWeightedPool, onTick]);

  useEffect(() => {
    if (!isSpinning) {
      setSpeed(50);
    }
  }, [isSpinning]);

  useEffect(() => {
    if (winner && !isSpinning) {
      setIsRevealing(true);
      // Reveal animation - slot by slot
      setDisplayNames(['?', '?', '?']);

      setTimeout(() => setDisplayNames([winner.name[0], '?', '?']), 200);
      setTimeout(() => setDisplayNames([winner.name[0], winner.name[Math.floor(winner.name.length / 2)] || winner.name[0], '?']), 400);
      setTimeout(() => {
        setDisplayNames([winner.name, winner.name, winner.name]);
        setIsRevealing(false);
      }, 600);
    }
  }, [winner, isSpinning]);

  const showWinner = winner && !isSpinning && !isRevealing;

  return (
    <div className="relative">
      {/* Slot machine frame */}
      <div className="relative bg-gradient-to-b from-[#313131] to-slate-900 rounded-3xl p-2 shadow-2xl border-4 border-slate-600">
        {/* Top decoration */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#007bc7] to-sky-400 px-8 py-2 rounded-full shadow-lg">
          <span className="text-white font-bold text-sm tracking-wider">RAFFLE</span>
        </div>

        {/* Display window */}
        <div className="bg-black/80 rounded-2xl p-6 mt-4 overflow-hidden">
          {/* Slot reels */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((reelIndex) => (
              <motion.div
                key={reelIndex}
                className="w-20 h-24 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-slate-600 shadow-inner"
                animate={{
                  borderColor: showWinner ? '#007bc7' : '#475569',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayNames[reelIndex]}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: isSpinning ? 0.05 : 0.2 }}
                    className="text-2xl font-bold text-white text-center"
                  >
                    {isSpinning ? displayNames[reelIndex].charAt(0) : (showWinner ? '✓' : '?')}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Winner name display */}
          <AnimatePresence>
            {(isSpinning || winner) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-6 text-center"
              >
                <motion.div
                  animate={{
                    scale: showWinner ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.5, repeat: showWinner ? 2 : 0 }}
                  className={`text-4xl md:text-5xl font-extrabold ${
                    showWinner
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400'
                      : 'text-white'
                  }`}
                >
                  {showWinner ? winner.name : displayNames[0]}
                </motion.div>

                {showWinner && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-slate-400"
                  >
                    {winner.totalTickets} {winner.totalTickets === 1 ? 'entry' : 'entries'}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom lights */}
        <div className="flex justify-center gap-2 mt-3 pb-2">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor: isSpinning
                  ? ['#007bc7', '#38bdf8', '#007bc7']
                  : showWinner
                    ? ['#fbbf24', '#f59e0b', '#fbbf24']
                    : '#475569',
                scale: isSpinning || showWinner ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                repeat: isSpinning || showWinner ? Infinity : 0,
                delay: i * 0.1,
              }}
              className="w-3 h-3 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: isSpinning ? [0.3, 0.6, 0.3] : showWinner ? [0.4, 0.8, 0.4] : 0,
          scale: isSpinning ? [1, 1.05, 1] : showWinner ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className={`absolute inset-0 -z-10 rounded-3xl blur-xl ${
          showWinner
            ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500'
            : 'bg-gradient-to-r from-[#007bc7] via-sky-400 to-[#007bc7]'
        }`}
      />
    </div>
  );
}
