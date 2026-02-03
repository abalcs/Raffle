import type { Participant } from './types';

// Employee Incentive Raffle - Bingo Ticket Data
export const participants: Participant[] = [
  // Alan's Team
  { id: 1, name: "Adrianna", totalTickets: 11 },
  { id: 2, name: "Rachael", totalTickets: 9 },
  { id: 3, name: "Paige", totalTickets: 19 },
  { id: 4, name: "Jack", totalTickets: 11 },
  { id: 5, name: "Peadar", totalTickets: 9 },
  { id: 6, name: "Mandy", totalTickets: 9 },
  { id: 7, name: "Emma", totalTickets: 9 },
  // Katie's Team
  { id: 8, name: "Katie", totalTickets: 10 },
  { id: 9, name: "Lexi", totalTickets: 3 },
  { id: 10, name: "Deanna", totalTickets: 3 },
  { id: 11, name: "Andrea", totalTickets: 3 },
  { id: 12, name: "Shannon", totalTickets: 3 },
  { id: 13, name: "Megan", totalTickets: 3 },
  { id: 14, name: "Lexie", totalTickets: 3 },
  // Bridget's Team
  { id: 15, name: "Sarah", totalTickets: 6 },
  { id: 16, name: "Alex", totalTickets: 6 },
  { id: 17, name: "Bit", totalTickets: 6 },
  { id: 18, name: "Delaney", totalTickets: 6 },
  { id: 19, name: "Grace", totalTickets: 6 },
  { id: 20, name: "Rachel", totalTickets: 7 },
];

export const prizes = {
  1: { label: "1st Place", amount: 250, description: "$250 in Globe Vouchers" },
  2: { label: "2nd Place", amount: 100, description: "$100 in Globe Vouchers" },
  3: { label: "3rd Place", amount: 50, description: "$50 in Globe Vouchers" },
} as const;
