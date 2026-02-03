import type { Participant } from './types';

// PLACEHOLDER DATA - Replace with actual employee data
export const participants: Participant[] = [
  { id: 1, name: "John Smith", totalTickets: 15 },
  { id: 2, name: "Sarah Johnson", totalTickets: 23 },
  { id: 3, name: "Michael Chen", totalTickets: 8 },
  { id: 4, name: "Emily Davis", totalTickets: 31 },
  { id: 5, name: "David Wilson", totalTickets: 12 },
  { id: 6, name: "Jessica Brown", totalTickets: 19 },
  { id: 7, name: "Robert Taylor", totalTickets: 27 },
  { id: 8, name: "Amanda Martinez", totalTickets: 14 },
  { id: 9, name: "Christopher Lee", totalTickets: 22 },
  { id: 10, name: "Ashley Garcia", totalTickets: 9 },
];

export const prizes = {
  1: { label: "1st Place", amount: 250, description: "$250 in Globe Vouchers" },
  2: { label: "2nd Place", amount: 100, description: "$100 in Globe Vouchers" },
  3: { label: "3rd Place", amount: 50, description: "$50 in Globe Vouchers" },
} as const;
