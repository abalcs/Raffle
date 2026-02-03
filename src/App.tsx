import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Participant, Winner, RaffleState } from './types';
import { ParticipantCard } from './components/ParticipantCard';
import { SlotMachine } from './components/SlotMachine';
import { WinnerReveal } from './components/WinnerReveal';
import { SetupScreen } from './components/SetupScreen';
import { useConfetti } from './hooks/useConfetti';
import { useSoundEffects } from './hooks/useSoundEffects';

interface Prize {
  place: 1 | 2 | 3;
  label: string;
  amount: number;
  description: string;
}

const defaultPrizes: Prize[] = [
  { place: 1, label: '1st Place', amount: 250, description: '$250 Prize' },
  { place: 2, label: '2nd Place', amount: 100, description: '$100 Prize' },
  { place: 3, label: '3rd Place', amount: 50, description: '$50 Prize' },
];

// LocalStorage keys
const STORAGE_KEYS = {
  participants: 'raffle_participants',
  prizes: 'raffle_prizes',
  raffleTitle: 'raffle_title',
};

function App() {
  const [mode, setMode] = useState<'setup' | 'raffle'>('setup');
  const [state, setState] = useState<RaffleState>('idle');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>(defaultPrizes);
  const [remainingParticipants, setRemainingParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<{ place: 1 | 2 | 3; label: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newWinnerId, setNewWinnerId] = useState<number | null>(null);
  const [raffleTitle, setRaffleTitle] = useState('Raffle');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const { fireConfetti, fireGrandFinale, fireStars } = useConfetti();
  const { playDrumRoll, playWinnerReveal, playCelebration, playTick, playCountdown } = useSoundEffects();

  // Track if initial load is complete to prevent overwriting saved data
  const isInitialLoad = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedParticipants = localStorage.getItem(STORAGE_KEYS.participants);
    const savedPrizes = localStorage.getItem(STORAGE_KEYS.prizes);
    const savedTitle = localStorage.getItem(STORAGE_KEYS.raffleTitle);

    if (savedParticipants) {
      try {
        const parsed = JSON.parse(savedParticipants);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setParticipants(parsed);
        }
      } catch (e) {
        console.error('Failed to load participants:', e);
      }
    }

    if (savedPrizes) {
      try {
        const parsed = JSON.parse(savedPrizes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPrizes(parsed);
        }
      } catch (e) {
        console.error('Failed to load prizes:', e);
      }
    }

    if (savedTitle) {
      setRaffleTitle(savedTitle);
    }

    // Mark initial load as complete after a short delay
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 100);
  }, []);

  // Save to localStorage when data changes (skip initial mount)
  useEffect(() => {
    if (!isInitialLoad.current) {
      localStorage.setItem(STORAGE_KEYS.participants, JSON.stringify(participants));
    }
  }, [participants]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      localStorage.setItem(STORAGE_KEYS.prizes, JSON.stringify(prizes));
    }
  }, [prizes]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      localStorage.setItem(STORAGE_KEYS.raffleTitle, raffleTitle);
    }
  }, [raffleTitle]);

  const getTotalTickets = useCallback(() => {
    return participants.reduce((sum, p) => sum + p.totalTickets, 0);
  }, [participants]);

  const selectRandomWinner = useCallback((eligible: Participant[]): Participant => {
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

  const getPrize = (place: 1 | 2 | 3) => {
    return prizes.find(p => p.place === place) || defaultPrizes.find(p => p.place === place)!;
  };

  const startRaffleMode = () => {
    setMode('raffle');
    setState('idle');
    setRemainingParticipants([...participants]);
    setWinners([]);
    setCurrentDrawing(null);
    setCurrentWinner(null);
    setNewWinnerId(null);
  };

  const backToSetup = () => {
    setMode('setup');
    setState('idle');
    setWinners([]);
    setCurrentDrawing(null);
    setCurrentWinner(null);
    setNewWinnerId(null);
  };

  const startDrawing = () => {
    setState('showing-participants');
    setRemainingParticipants([...participants]);
    setWinners([]);
    setCurrentDrawing(null);
    setCurrentWinner(null);
    setNewWinnerId(null);
  };

  const drawNextWinner = async (place: 1 | 2 | 3) => {
    const prizeInfo = getPrize(place);
    setCurrentDrawing({ place, label: prizeInfo.label });
    setCurrentWinner(null);
    setNewWinnerId(null);

    // Countdown
    if (soundEnabled) playCountdown(3);
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(null);

    // Start spinning
    setState('drawing');
    setIsSpinning(true);
    if (soundEnabled) playDrumRoll();

    // Spin duration
    await new Promise(resolve => setTimeout(resolve, 3500));

    // Select winner
    const winner = selectRandomWinner(remainingParticipants);
    setIsSpinning(false);
    setCurrentWinner(winner);
    setHighlightedId(winner.id);

    // Sound and confetti based on place
    if (soundEnabled) {
      playWinnerReveal(place === 1);
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    if (place === 1) {
      fireGrandFinale();
      fireStars();
      if (soundEnabled) playCelebration();
    } else if (place === 2) {
      fireConfetti('large');
    } else {
      fireConfetti('medium');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newWinner: Winner = {
      participant: winner,
      place,
      prize: prizeInfo.description,
      prizeAmount: prizeInfo.amount,
    };

    setWinners(prev => [...prev, newWinner]);
    setRemainingParticipants(prev => prev.filter(p => p.id !== winner.id));
    setHighlightedId(null);
    setNewWinnerId(winner.id);
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
    setNewWinnerId(null);
  };

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    if (!isPresentationMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const resetAllData = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.participants);
    localStorage.removeItem(STORAGE_KEYS.prizes);
    localStorage.removeItem(STORAGE_KEYS.raffleTitle);

    // Reset state to defaults
    setParticipants([]);
    setPrizes(defaultPrizes);
    setRaffleTitle('Raffle');
    setWinners([]);
    setRemainingParticipants([]);
    setCurrentDrawing(null);
    setCurrentWinner(null);
    setNewWinnerId(null);
  };

  // Show setup screen
  if (mode === 'setup') {
    return (
      <SetupScreen
        participants={participants}
        prizes={prizes}
        onUpdateParticipants={setParticipants}
        onUpdatePrizes={setPrizes}
        onStartRaffle={startRaffleMode}
        onResetAll={resetAllData}
      />
    );
  }

  const eliminatedIds = winners.map(w => w.participant.id);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#313131] via-slate-800 to-[#313131] ${isPresentationMode ? 'p-12' : 'py-8 px-4'}`}>
      <div className={`mx-auto ${isPresentationMode ? 'max-w-6xl' : 'max-w-7xl'}`}>
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center items-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-5xl"
            >
              🎰
            </motion.div>
            {isEditingTitle ? (
              <input
                type="text"
                value={raffleTitle}
                onChange={(e) => setRaffleTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className={`${isPresentationMode ? 'text-6xl md:text-7xl' : 'text-5xl md:text-6xl'} font-extrabold bg-transparent text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-[#007bc7] to-sky-400 focus:outline-none border-b-2 border-sky-400`}
                style={{ width: `${Math.max(raffleTitle.length, 10)}ch` }}
              />
            ) : (
              <h1
                onClick={() => !isPresentationMode && setIsEditingTitle(true)}
                className={`${isPresentationMode ? 'text-6xl md:text-7xl' : 'text-5xl md:text-6xl cursor-pointer hover:opacity-80'} font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-[#007bc7] to-sky-400`}
              >
                {raffleTitle}
              </h1>
            )}
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-5xl"
            >
              🎰
            </motion.div>
          </div>
          <p className={`text-slate-400 ${isPresentationMode ? 'text-xl' : 'text-lg'}`}>
            {getTotalTickets()} total entries from {participants.length} participants
          </p>

          {/* Controls */}
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <button
              onClick={backToSetup}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              ← Back to Setup
            </button>
            <button
              onClick={togglePresentationMode}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isPresentationMode ? '⊙ Exit Fullscreen' : '⛶ Presentation Mode'}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
            </button>
          </div>
        </motion.header>

        {/* Prize display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`grid grid-cols-3 gap-4 mb-8 mx-auto ${isPresentationMode ? 'max-w-3xl' : 'max-w-2xl'}`}
        >
          {([3, 2, 1] as const).map((place) => {
            const prize = getPrize(place);
            const isWon = winners.some(w => w.place === place);
            return (
              <motion.div
                key={place}
                animate={{
                  scale: isWon ? 0.95 : 1,
                  opacity: isWon ? 0.5 : 1,
                }}
                className={`
                  text-center p-4 rounded-xl backdrop-blur-sm relative overflow-hidden
                  ${place === 1 ? 'bg-yellow-500/20 border-2 border-yellow-400/50' : ''}
                  ${place === 2 ? 'bg-slate-400/20 border-2 border-slate-400/50' : ''}
                  ${place === 3 ? 'bg-amber-700/20 border-2 border-amber-600/50' : ''}
                  ${isWon ? 'grayscale' : ''}
                `}
              >
                {isWon && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-white font-bold">CLAIMED</span>
                  </div>
                )}
                <div className={`${isPresentationMode ? 'text-4xl' : 'text-2xl'} mb-1`}>
                  {place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'}
                </div>
                <div className={`text-white font-bold ${isPresentationMode ? 'text-lg' : ''}`}>{prize.label}</div>
                <div className={`font-bold text-green-400 ${isPresentationMode ? 'text-2xl' : 'text-xl'}`}>${prize.amount}</div>
                <div className={`text-slate-400 ${isPresentationMode ? 'text-sm' : 'text-xs'} truncate`}>{prize.description.replace(/^\$\d+\s*/, '')}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-[200px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#007bc7] to-sky-400"
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <div className={`grid ${isPresentationMode ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
          {/* Participants grid - hidden in presentation mode during draw */}
          {(!isPresentationMode || state === 'idle' || state === 'showing-participants') && (
            <div className={isPresentationMode ? 'lg:col-span-1' : 'lg:col-span-2'}>
              <h2 className={`font-bold text-white mb-4 flex items-center gap-2 ${isPresentationMode ? 'text-3xl' : 'text-2xl'}`}>
                <span className="text-2xl">🎟️</span>
                Participants
              </h2>
              <div className={`grid ${isPresentationMode ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-3 gap-4'} max-h-[600px] overflow-y-auto`}>
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
          )}

          {/* Drawing area */}
          <div className={`space-y-6 ${isPresentationMode && (state === 'drawing' || state === 'winner-reveal' || state === 'complete') ? 'lg:col-span-2' : ''}`}>
            {/* Control buttons */}
            <div className="space-y-3">
              {state === 'idle' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startDrawing}
                  className={`w-full rounded-xl font-bold bg-gradient-to-r from-[#007bc7] to-sky-600 hover:from-sky-500 hover:to-sky-400 text-white shadow-lg shadow-sky-500/30 transition-all duration-300 ${isPresentationMode ? 'py-6 px-8 text-2xl' : 'py-4 px-6 text-lg'}`}
                >
                  🎰 Begin Drawing
                </motion.button>
              )}

              {state === 'showing-participants' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => drawNextWinner(3)}
                  className={`w-full rounded-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 ${isPresentationMode ? 'py-6 px-8 text-2xl' : 'py-4 px-6 text-lg'}`}
                >
                  🥉 Draw {getPrize(3).label} - ${getPrize(3).amount}
                </motion.button>
              )}

              {state === 'winner-reveal' && winners.length === 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => drawNextWinner(2)}
                  className={`w-full rounded-xl font-bold bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-400 hover:to-gray-500 text-white shadow-lg shadow-slate-500/30 transition-all duration-300 ${isPresentationMode ? 'py-6 px-8 text-2xl' : 'py-4 px-6 text-lg'}`}
                >
                  🥈 Draw {getPrize(2).label} - ${getPrize(2).amount}
                </motion.button>
              )}

              {state === 'winner-reveal' && winners.length === 2 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => drawNextWinner(1)}
                  className={`w-full rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-500/30 transition-all duration-300 ${isPresentationMode ? 'py-6 px-8 text-2xl' : 'py-4 px-6 text-lg'}`}
                >
                  🥇 Draw {getPrize(1).label} - ${getPrize(1).amount}
                </motion.button>
              )}

              {state === 'complete' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetRaffle}
                  className={`w-full rounded-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border border-slate-600 transition-all duration-300 ${isPresentationMode ? 'py-6 px-8 text-2xl' : 'py-4 px-6 text-lg'}`}
                >
                  🔄 Reset & Draw Again
                </motion.button>
              )}
            </div>

            {/* Slot Machine */}
            <AnimatePresence>
              {(state === 'drawing' || currentWinner) && currentDrawing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={isPresentationMode ? 'max-w-lg mx-auto' : ''}
                >
                  <div className="text-center mb-4">
                    <span className={`text-slate-400 ${isPresentationMode ? 'text-xl' : 'text-lg'}`}>Drawing for</span>
                    <h2 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#007bc7] ${isPresentationMode ? 'text-4xl' : 'text-3xl'}`}>
                      {currentDrawing.label}
                    </h2>
                  </div>
                  <SlotMachine
                    participants={remainingParticipants}
                    isSpinning={isSpinning}
                    winner={currentWinner}
                    onTick={soundEnabled ? playTick : undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Winners display */}
            {winners.length > 0 && (
              <div className="space-y-4">
                <h2 className={`font-bold text-white flex items-center gap-2 ${isPresentationMode ? 'text-3xl' : 'text-2xl'}`}>
                  <span className="text-2xl">🏆</span>
                  Winners
                </h2>
                <div className={`${isPresentationMode ? 'grid grid-cols-3 gap-4' : 'space-y-4'}`}>
                  {[...winners].sort((a, b) => a.place - b.place).map((winner) => (
                    <motion.div
                      key={winner.participant.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <WinnerReveal
                        winner={winner}
                        isNew={newWinnerId === winner.participant.id}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setState('winner-reveal')}
            >
              <motion.div
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 max-w-3xl mx-4 border border-slate-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">🎉🏆🎉</div>
                  <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 mb-8">
                    Congratulations!
                  </h2>
                </motion.div>

                <div className="space-y-4">
                  {winners.sort((a, b) => a.place - b.place).map((winner, index) => (
                    <motion.div
                      key={winner.participant.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-center justify-between p-5 rounded-xl bg-slate-800/50 border border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">
                          {winner.place === 1 ? '🥇' : winner.place === 2 ? '🥈' : '🥉'}
                        </span>
                        <div>
                          <div className="text-white font-bold text-2xl">
                            {winner.participant.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {winner.participant.totalTickets} entries
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-2xl">
                          ${winner.prizeAmount}
                        </div>
                        <div className="text-slate-400 text-sm">{winner.prize.replace(/^\$\d+\s*/, '')}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center text-slate-400 mt-8 text-lg"
                >
                  Click anywhere to close
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
