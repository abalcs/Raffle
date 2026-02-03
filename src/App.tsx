import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { participants as initialParticipants, prizes } from './data';
import type { Participant, Winner, RaffleState } from './types';
import { ParticipantCard } from './components/ParticipantCard';
import { WinnerCard } from './components/WinnerCard';
import { DrawingWheel } from './components/DrawingWheel';
import { useConfetti } from './hooks/useConfetti';

function App() {
  const [state, setState] = useState<RaffleState>('idle');
  const [participants] = useState<Participant[]>(initialParticipants);
  const [remainingParticipants, setRemainingParticipants] = useState<Participant[]>(initialParticipants);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<{ place: 1 | 2 | 3; label: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const { fireConfetti, fireGrandFinale, fireStars } = useConfetti();

  const getTotalTickets = useCallback(() => {
    return participants.reduce((sum, p) => sum + p.totalTickets, 0);
  }, [participants]);

  const selectRandomWinner = useCallback((eligible: Participant[]): Participant => {
    // Create weighted selection based on ticket count
    const totalTickets = eligible.reduce((sum, p) => sum + p.totalTickets, 0);
    let random = Math.random() * totalTickets;

    for (const participant of eligible) {
      random -= participant.totalTickets;
      if (random <= 0) {
        return participant;
      }
    }
    return eligible[eligible.length - 1];
  }, []);

  const startRaffle = () => {
    setState('showing-participants');
    setRemainingParticipants([...participants]);
    setWinners([]);
    setCurrentDrawing(null);
    setCurrentWinner(null);
  };

  const drawNextWinner = async (place: 1 | 2 | 3) => {
    const prizeInfo = prizes[place];
    setCurrentDrawing({ place, label: prizeInfo.label });
    setState('drawing');
    setIsSpinning(true);
    setCurrentWinner(null);

    // Spin animation duration
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Select winner
    const winner = selectRandomWinner(remainingParticipants);
    setIsSpinning(false);
    setCurrentWinner(winner);
    setHighlightedId(winner.id);

    // Fire confetti based on place
    if (place === 1) {
      fireGrandFinale();
      fireStars();
    } else if (place === 2) {
      fireConfetti('large');
    } else {
      fireConfetti('medium');
    }

    // Small delay to show the winner
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add to winners and remove from remaining
    const newWinner: Winner = {
      participant: winner,
      place,
      prize: prizeInfo.description,
      prizeAmount: prizeInfo.amount,
    };

    setWinners(prev => [...prev, newWinner]);
    setRemainingParticipants(prev => prev.filter(p => p.id !== winner.id));
    setHighlightedId(null);
    setState('winner-reveal');

    if (place === 1) {
      setState('complete');
    }
  };

  const resetRaffle = () => {
    setState('idle');
    setRemainingParticipants([...participants]);
    setWinners([]);
    setCurrentDrawing(null);
    setCurrentWinner(null);
    setHighlightedId(null);
  };

  const eliminatedIds = winners.map(w => w.participant.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mb-2">
            Employee Incentive Raffle
          </h1>
          <p className="text-slate-400 text-lg">
            {getTotalTickets()} total tickets from {participants.length} participants
          </p>
        </motion.header>

        {/* Prize display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto"
        >
          {([3, 2, 1] as const).map((place) => (
            <div
              key={place}
              className={`
                text-center p-4 rounded-xl backdrop-blur-sm
                ${place === 1 ? 'bg-yellow-500/20 border-2 border-yellow-400/50' : ''}
                ${place === 2 ? 'bg-slate-400/20 border-2 border-slate-400/50' : ''}
                ${place === 3 ? 'bg-amber-700/20 border-2 border-amber-600/50' : ''}
              `}
            >
              <div className="text-2xl mb-1">
                {place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'}
              </div>
              <div className="text-white font-bold">{prizes[place].label}</div>
              <div className="text-xl font-bold text-green-400">${prizes[place].amount}</div>
              <div className="text-xs text-slate-400">Globe Vouchers</div>
            </div>
          ))}
        </motion.div>

        {/* Main content area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Participants grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TicketIcon />
              Participants
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {participants.map((participant, index) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  index={index}
                  isHighlighted={highlightedId === participant.id}
                  isEliminated={eliminatedIds.includes(participant.id)}
                />
              ))}
            </div>
          </div>

          {/* Drawing area */}
          <div className="space-y-6">
            {/* Control buttons */}
            <div className="space-y-3">
              {state === 'idle' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRaffle}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg
                    bg-gradient-to-r from-purple-600 to-pink-600
                    hover:from-purple-500 hover:to-pink-500
                    text-white shadow-lg shadow-purple-500/30
                    transition-all duration-300"
                >
                  Start Raffle
                </motion.button>
              )}

              {state === 'showing-participants' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => drawNextWinner(3)}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg
                    bg-gradient-to-r from-amber-600 to-orange-600
                    hover:from-amber-500 hover:to-orange-500
                    text-white shadow-lg shadow-amber-500/30
                    transition-all duration-300"
                >
                  🥉 Draw 3rd Place ($50)
                </motion.button>
              )}

              {state === 'winner-reveal' && winners.length === 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => drawNextWinner(2)}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg
                    bg-gradient-to-r from-slate-500 to-gray-600
                    hover:from-slate-400 hover:to-gray-500
                    text-white shadow-lg shadow-slate-500/30
                    transition-all duration-300"
                >
                  🥈 Draw 2nd Place ($100)
                </motion.button>
              )}

              {state === 'winner-reveal' && winners.length === 2 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => drawNextWinner(1)}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg
                    bg-gradient-to-r from-yellow-500 to-amber-500
                    hover:from-yellow-400 hover:to-amber-400
                    text-black shadow-lg shadow-yellow-500/30
                    transition-all duration-300"
                >
                  🥇 Draw 1st Place ($250)
                </motion.button>
              )}

              {state === 'complete' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetRaffle}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg
                    bg-gradient-to-r from-slate-700 to-slate-800
                    hover:from-slate-600 hover:to-slate-700
                    text-white border border-slate-600
                    transition-all duration-300"
                >
                  Reset & Start Over
                </motion.button>
              )}
            </div>

            {/* Drawing wheel */}
            <AnimatePresence>
              {(state === 'drawing' || currentWinner) && currentDrawing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <DrawingWheel
                    participants={remainingParticipants}
                    isDrawing={isSpinning}
                    winner={currentWinner}
                    placeLabel={currentDrawing.label}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Winners display */}
            {winners.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <TrophyIcon />
                  Winners
                </h2>
                <div className="space-y-4">
                  {[...winners].reverse().map((winner, index) => (
                    <motion.div
                      key={winner.participant.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <WinnerCard
                        winner={winner}
                        isRevealing={index === 0 && state !== 'complete'}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion celebration */}
        <AnimatePresence>
          {state === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setState('winner-reveal')}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl mx-4 border border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-6">
                  🎉 Congratulations to All Winners! 🎉
                </h2>
                <div className="space-y-4">
                  {winners.sort((a, b) => a.place - b.place).map((winner) => (
                    <div
                      key={winner.participant.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {winner.place === 1 ? '🥇' : winner.place === 2 ? '🥈' : '🥉'}
                        </span>
                        <span className="text-white font-semibold text-lg">
                          {winner.participant.name}
                        </span>
                      </div>
                      <span className="text-green-400 font-bold text-lg">
                        ${winner.prizeAmount}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-slate-400 mt-6">
                  Click anywhere to close
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TicketIcon() {
  return (
    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-1.17a3 3 0 01-2.83 2v2a1 1 0 11-2 0v-2a3 3 0 01-2.83-2H5a2 2 0 110-4h1.17A3 3 0 015 5zm5 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

export default App;
