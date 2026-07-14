export interface Participant {
  id: number;
  name: string;
  totalTickets: number;
}

export interface Winner {
  participant: Participant;
  place: number;
  prize: string;
  prizeAmount: number;
}

export type RaffleState = 'idle' | 'showing-participants' | 'drawing' | 'winner-reveal' | 'complete';
