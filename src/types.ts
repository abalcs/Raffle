export interface Participant {
  id: number;
  name: string;
  totalTickets: number;
}

export interface Winner {
  participant: Participant;
  place: 1 | 2 | 3;
  prize: string;
  prizeAmount: number;
}

export type RaffleState = 'idle' | 'showing-participants' | 'drawing' | 'winner-reveal' | 'complete';
