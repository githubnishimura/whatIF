export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const getRankName = (rank: Rank): string => {
  const names: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
  return names[rank] || rank.toString();
};

export const getSuitColor = (suit: Suit): string => {
  return suit === "♥" || suit === "♦" ? "text-rose-500" : "text-zinc-100";
};
