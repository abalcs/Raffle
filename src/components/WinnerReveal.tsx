import { motion } from 'framer-motion';
import type { Winner } from '../types';

interface WinnerRevealProps {
  winner: Winner;
  isNew: boolean;
}

const placeConfig = {
  1: {
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    bgGradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    textColor: 'text-yellow-900',
    glowColor: 'shadow-yellow-500/50',
    emoji: '🥇',
    label: '1ST PLACE',
    subtitle: 'GRAND PRIZE WINNER',
  },
  2: {
    gradient: 'from-slate-300 via-gray-400 to-slate-500',
    bgGradient: 'from-slate-400/20 via-gray-400/10 to-transparent',
    textColor: 'text-slate-900',
    glowColor: 'shadow-slate-400/50',
    emoji: '🥈',
    label: '2ND PLACE',
    subtitle: 'RUNNER UP',
  },
  3: {
    gradient: 'from-amber-600 via-orange-600 to-amber-700',
    bgGradient: 'from-amber-600/20 via-orange-500/10 to-transparent',
    textColor: 'text-amber-100',
    glowColor: 'shadow-amber-500/50',
    emoji: '🥉',
    label: '3RD PLACE',
    subtitle: 'BRONZE WINNER',
  },
};

export function WinnerReveal({ winner, isNew }: WinnerRevealProps) {
  const config = placeConfig[winner.place];

  return (
    <motion.div
      initial={isNew ? { scale: 0, rotateY: 180 } : false}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative"
    >
      {/* Spotlight rays */}
      {isNew && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, times: [0, 0.3, 1] }}
          className={`absolute inset-0 bg-gradient-radial ${config.bgGradient} rounded-2xl`}
        />
      )}

      {/* Card */}
      <motion.div
        animate={isNew ? {
          boxShadow: [
            '0 0 0 0 rgba(0,123,199,0)',
            '0 0 60px 10px rgba(251,191,36,0.4)',
            '0 0 30px 5px rgba(251,191,36,0.2)',
          ],
        } : {}}
        transition={{ duration: 1.5 }}
        className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br ${config.gradient}
          shadow-2xl ${config.glowColor}
        `}
      >
        {/* Animated shine */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatDelay: 4 }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
        />

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <motion.div
                initial={isNew ? { x: -20, opacity: 0 } : false}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-xs font-bold tracking-widest ${config.textColor} opacity-70`}
              >
                {config.subtitle}
              </motion.div>
              <motion.div
                initial={isNew ? { x: -20, opacity: 0 } : false}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-extrabold ${config.textColor}`}
              >
                {config.label}
              </motion.div>
            </div>
            <motion.div
              initial={isNew ? { scale: 0, rotate: -180 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.4 }}
              className="text-5xl"
            >
              {config.emoji}
            </motion.div>
          </div>

          {/* Winner name */}
          <motion.div
            initial={isNew ? { scale: 0.5, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            className={`text-3xl md:text-4xl font-extrabold ${config.textColor} mb-3`}
          >
            {winner.participant.name}
          </motion.div>

          {/* Prize */}
          <motion.div
            initial={isNew ? { y: 20, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-white/30 backdrop-blur-sm
              ${config.textColor} font-bold text-lg
            `}>
              <span>🎁</span>
              {winner.prize}
            </div>
            <div className={`text-sm ${config.textColor} opacity-70`}>
              {winner.participant.totalTickets} {winner.participant.totalTickets === 1 ? 'entry' : 'entries'}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
