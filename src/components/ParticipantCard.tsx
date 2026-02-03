import { motion } from 'framer-motion';
import type { Participant } from '../types';

interface ParticipantCardProps {
  participant: Participant;
  index: number;
  isHighlighted?: boolean;
  isEliminated?: boolean;
}

export function ParticipantCard({
  participant,
  index,
  isHighlighted = false,
  isEliminated = false
}: ParticipantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: isEliminated ? 0.3 : 1,
        y: 0,
        scale: isHighlighted ? 1.05 : 1,
        borderColor: isHighlighted ? '#fbbf24' : 'transparent'
      }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        type: "spring",
        stiffness: 300
      }}
      className={`
        relative overflow-hidden rounded-xl p-4
        ${isHighlighted
          ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-400 animate-pulse-glow'
          : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700'
        }
        ${isEliminated ? 'grayscale' : ''}
        transition-all duration-300
      `}
    >
      {isHighlighted && (
        <div className="absolute inset-0 animate-shimmer" />
      )}

      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-white mb-2 truncate">
          {participant.name}
        </h3>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <TicketIcon />
            <motion.span
              key={participant.totalTickets}
              initial={{ scale: 1.5, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#94a3b8' }}
              className="text-2xl font-bold text-slate-300"
            >
              {participant.totalTickets}
            </motion.span>
          </div>
          <span className="text-sm text-slate-500">
            {participant.totalTickets === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>

        {/* Ticket visualization */}
        <div className="mt-3 flex flex-wrap gap-1">
          {Array.from({ length: Math.min(participant.totalTickets, 10) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.05 + i * 0.02 }}
              className="w-2 h-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500"
            />
          ))}
          {participant.totalTickets > 10 && (
            <span className="text-xs text-slate-500">+{participant.totalTickets - 10}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TicketIcon() {
  return (
    <svg
      className="w-5 h-5 text-yellow-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
    </svg>
  );
}
