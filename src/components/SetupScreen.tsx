import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Participant } from '../types';

interface Prize {
  place: number;
  label: string;
  amount: number;
  description: string;
}

interface SetupScreenProps {
  participants: Participant[];
  prizes: Prize[];
  onUpdateParticipants: (participants: Participant[]) => void;
  onUpdatePrizes: (prizes: Prize[]) => void;
  onStartRaffle: () => void;
  onResetAll: () => void;
}

export function SetupScreen({
  participants,
  prizes,
  onUpdateParticipants,
  onUpdatePrizes,
  onStartRaffle,
  onResetAll,
}: SetupScreenProps) {
  const [newName, setNewName] = useState('');
  const [newTickets, setNewTickets] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editTickets, setEditTickets] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showPrizeEditor, setShowPrizeEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');

  const addParticipant = () => {
    if (!newName.trim() || !newTickets) return;

    const tickets = parseInt(newTickets);
    if (isNaN(tickets) || tickets < 1) return;

    const newId = participants.length > 0
      ? Math.max(...participants.map(p => p.id)) + 1
      : 1;

    onUpdateParticipants([
      ...participants,
      { id: newId, name: newName.trim(), totalTickets: tickets }
    ]);
    setNewName('');
    setNewTickets('');
  };

  const deleteParticipant = (id: number) => {
    onUpdateParticipants(participants.filter(p => p.id !== id));
  };

  const startEditing = (participant: Participant) => {
    setEditingId(participant.id);
    setEditName(participant.name);
    setEditTickets(participant.totalTickets.toString());
  };

  const saveEdit = () => {
    if (!editName.trim() || !editTickets || editingId === null) return;

    const tickets = parseInt(editTickets);
    if (isNaN(tickets) || tickets < 1) return;

    onUpdateParticipants(
      participants.map(p =>
        p.id === editingId
          ? { ...p, name: editName.trim(), totalTickets: tickets }
          : p
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to remove all participants?')) {
      onUpdateParticipants([]);
    }
  };

  const parseBulkInput = () => {
    const lines = bulkInput.trim().split('\n');
    const newParticipants: Participant[] = [];
    let nextId = participants.length > 0
      ? Math.max(...participants.map(p => p.id)) + 1
      : 1;

    for (const line of lines) {
      // Try different delimiters: tab, comma, multiple spaces
      const parts = line.split(/[\t,]|(?:\s{2,})/).map(s => s.trim()).filter(Boolean);

      if (parts.length >= 2) {
        const name = parts[0];
        const tickets = parseInt(parts[parts.length - 1]); // Take last number as tickets

        if (name && !isNaN(tickets) && tickets > 0) {
          newParticipants.push({
            id: nextId++,
            name,
            totalTickets: tickets,
          });
        }
      } else if (parts.length === 1) {
        // Try to parse "Name 5" or "Name: 5" format
        const match = parts[0].match(/^(.+?)[\s:]+(\d+)$/);
        if (match) {
          newParticipants.push({
            id: nextId++,
            name: match[1].trim(),
            totalTickets: parseInt(match[2]),
          });
        }
      }
    }

    if (newParticipants.length > 0) {
      onUpdateParticipants([...participants, ...newParticipants]);
      setBulkInput('');
      setActiveTab('manual');
    }
  };

  function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const updatePrize = (place: number, field: 'amount' | 'description' | 'label', value: string) => {
    onUpdatePrizes(
      prizes.map(p =>
        p.place === place
          ? {
              ...p,
              ...(field === 'amount'
                ? { amount: parseInt(value) || 0 }
                : field === 'label'
                ? { label: value }
                : { description: value }),
            }
          : p
      )
    );
  };

  const addPrize = () => {
    const nextPlace = prizes.length + 1;
    const label = `${getOrdinal(nextPlace)} Place`;
    onUpdatePrizes([
      ...prizes,
      { place: nextPlace, label, amount: 0, description: 'Prize' },
    ]);
  };

  const removePrize = (place: number) => {
    if (prizes.length <= 1) return;
    const filtered = prizes.filter(p => p.place !== place);
    // Re-number places sequentially
    const renumbered = filtered
      .sort((a, b) => a.place - b.place)
      .map((p, i) => ({
        ...p,
        place: i + 1,
        label: `${getOrdinal(i + 1)} Place`,
      }));
    onUpdatePrizes(renumbered);
  };

  const totalTickets = participants.reduce((sum, p) => sum + p.totalTickets, 0);
  const canStart = participants.length >= prizes.length && prizes.length >= 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#313131] via-slate-800 to-[#313131] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-[#007bc7] to-sky-400 mb-2">
            Raffle Setup
          </h1>
          <p className="text-slate-400 text-lg">
            Add participants and customize your raffle
          </p>
        </motion.header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column - Add participants */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'manual'
                    ? 'bg-[#007bc7] text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Add Manually
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'bulk'
                    ? 'bg-[#007bc7] text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Bulk Import
              </button>
            </div>

            {activeTab === 'manual' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              >
                <h2 className="text-xl font-bold text-white mb-4">Add Participant</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                      placeholder="Enter name"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-[#007bc7] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Number of Tickets/Entries</label>
                    <input
                      type="number"
                      min="1"
                      value={newTickets}
                      onChange={(e) => setNewTickets(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                      placeholder="Enter ticket count"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-[#007bc7] transition-colors"
                    />
                  </div>
                  <button
                    onClick={addParticipant}
                    disabled={!newName.trim() || !newTickets}
                    className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-[#007bc7] to-sky-600 hover:from-sky-500 hover:to-sky-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Participant
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              >
                <h2 className="text-xl font-bold text-white mb-4">Bulk Import</h2>
                <p className="text-sm text-slate-400 mb-4">
                  Paste data with names and ticket counts. Accepts tab-separated, comma-separated, or "Name: Count" format.
                </p>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={`John Smith, 10\nJane Doe\t15\nBob Wilson: 8`}
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-[#007bc7] transition-colors font-mono text-sm"
                />
                <button
                  onClick={parseBulkInput}
                  disabled={!bulkInput.trim()}
                  className="w-full mt-4 py-3 rounded-lg font-bold bg-gradient-to-r from-[#007bc7] to-sky-600 hover:from-sky-500 hover:to-sky-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import Participants
                </button>
              </motion.div>
            )}

            {/* Prize customization */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <button
                onClick={() => setShowPrizeEditor(!showPrizeEditor)}
                className="w-full flex items-center justify-between text-white"
              >
                <h2 className="text-xl font-bold">Customize Prizes</h2>
                <span className="text-2xl">{showPrizeEditor ? '−' : '+'}</span>
              </button>

              <AnimatePresence>
                {showPrizeEditor && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 mt-4">
                      {[...prizes].sort((a, b) => a.place - b.place).map((prize) => (
                        <div key={prize.place} className="flex items-center gap-3">
                          <span className="text-2xl">
                            {prize.place === 1 ? '🥇' : prize.place === 2 ? '🥈' : prize.place === 3 ? '🥉' : '🏅'}
                          </span>
                          <div className="flex-1">
                            <label className="block text-xs text-slate-400">{prize.label}</label>
                            <input
                              type="text"
                              value={prize.description}
                              onChange={(e) => updatePrize(prize.place, 'description', e.target.value)}
                              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-[#007bc7]"
                            />
                          </div>
                          <div className="w-24">
                            <label className="block text-xs text-slate-400">Amount</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                              <input
                                type="number"
                                value={prize.amount}
                                onChange={(e) => updatePrize(prize.place, 'amount', e.target.value)}
                                className="w-full pl-7 pr-3 py-2 rounded bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-[#007bc7]"
                              />
                            </div>
                          </div>
                          {prizes.length > 1 && (
                            <button
                              onClick={() => removePrize(prize.place)}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              title="Remove prize"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addPrize}
                        className="w-full py-2 rounded-lg font-medium text-sm bg-slate-700 hover:bg-slate-600 text-white transition-colors border border-dashed border-slate-500"
                      >
                        + Add Prize
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right column - Participant list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Participants ({participants.length})
              </h2>
              {participants.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              {participants.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="text-4xl mb-2">🎟️</div>
                  <p>No participants yet</p>
                  <p className="text-sm">Add participants to get started</p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex items-center gap-3 p-3 ${
                        index !== participants.length - 1 ? 'border-b border-slate-700' : ''
                      }`}
                    >
                      {editingId === participant.id ? (
                        <>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-[#007bc7]"
                          />
                          <input
                            type="number"
                            value={editTickets}
                            onChange={(e) => setEditTickets(e.target.value)}
                            className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-[#007bc7]"
                          />
                          <button
                            onClick={saveEdit}
                            className="p-1 text-green-400 hover:text-green-300"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className="text-white">{participant.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <span className="text-yellow-400">🎟️</span>
                            <span>{participant.totalTickets}</span>
                          </div>
                          <button
                            onClick={() => startEditing(participant)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteParticipant(participant.id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {participants.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex justify-between text-slate-400 mb-2">
                  <span>Total Participants:</span>
                  <span className="text-white font-bold">{participants.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Entries:</span>
                  <span className="text-white font-bold">{totalTickets}</span>
                </div>
              </div>
            )}

            {/* Start button */}
            <motion.button
              whileHover={{ scale: canStart ? 1.02 : 1 }}
              whileTap={{ scale: canStart ? 0.98 : 1 }}
              onClick={onStartRaffle}
              disabled={!canStart}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                canStart
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {canStart ? '🎰 Start Raffle' : `Need at least ${prizes.length} participants (${participants.length}/${prizes.length})`}
            </motion.button>

            {/* Reset button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 rounded-xl font-medium text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/50 border border-slate-700 hover:border-red-500/50 transition-all"
            >
              🗑️ Reset All Data
            </button>
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-white mb-2">Reset All Data?</h3>
                <p className="text-slate-400">
                  This will permanently delete all participants, reset prizes to defaults, and clear your raffle title. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetAll();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
