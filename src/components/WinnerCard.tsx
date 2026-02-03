import { motion } from 'framer-motion';
import type { Winner } from '../types';

interface WinnerCardProps {
  winner: Winner;
  isRevealing: boolean;
}

const placeStyles = {
  1: {
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    textColor: 'text-yellow-900',
    ringColor: 'ring-yellow-400',
    label: '1st',
    emoji: '',
  },
  2: {
    gradient: 'from-slate-300 via-gray-400 to-slate-500',
    textColor: 'text-slate-900',
    ringColor: 'ring-slate-300',
    label: '2nd',
    emoji: '',
  },
  3: {
    gradient: 'from-amber-600 via-orange-700 to-amber-800',
    textColor: 'text-amber-100',
    ringColor: 'ring-amber-600',
    label: '3rd',
    emoji: '',
  },
};

export function WinnerCard({ winner, isRevealing }: WinnerCardProps) {
  const style = placeStyles[winner.place];

  return (
    <motion.div
      initial={{ scale: 0, rotateY: 180, opacity: 0 }}
      animate={{
        scale: isRevealing ? [1, 1.1, 1] : 1,
        rotateY: 0,
        opacity: 1
      }}
      transition={{
        duration: 0.8,
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${style.gradient}
        ring-4 ${style.ringColor} ring-offset-2 ring-offset-slate-900
        transform-gpu
      `}
    >
      {/* Shine effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
      />

      <div className="relative z-10 text-center">
        {/* Place badge */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mb-4"
        >
          <span className="text-5xl">{style.emoji}</span>
          <div className={`text-lg font-bold ${style.textColor} opacity-80 mt-1`}>
            {style.label} Place
          </div>
        </motion.div>

        {/* Winner name */}
        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          className={`text-3xl font-extrabold ${style.textColor} mb-3`}
        >
          {winner.participant.name}
        </motion.h2>

        {/* Prize */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`
            inline-block px-4 py-2 rounded-full
            bg-white/30 backdrop-blur-sm
            ${style.textColor} font-bold text-xl
          `}
        >
          {winner.prize}
        </motion.div>

        {/* Ticket count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className={`mt-4 text-sm ${style.textColor} opacity-70`}
        >
          Won with {winner.participant.totalTickets} tickets
        </motion.p>
      </div>
    </motion.div>
  );
}
