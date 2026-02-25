import { Card, Rank, Suit, SUITS, RANKS } from "../types";

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}-${Math.random().toString(36).substr(2, 9)}`,
      });
    });
  });
  return deck;
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const canPlay = (card: Card, base: Card): boolean => {
  return card.suit === base.suit || card.rank === base.rank;
};

export const getInitialState = () => {
  let deck: Card[] = [];
  let hand: Card[] = [];
  let baseCard: Card | null = null;
  let reshuffleCount = 0;

  while (true) {
    deck = shuffle(createDeck());
    hand = deck.splice(0, 5);
    baseCard = deck.pop()!;

    const playableCount = hand.filter((c) => canPlay(c, baseCard!)).length;
    if (playableCount >= 2) {
      break;
    }
    reshuffleCount++;
  }

  return { deck, hand, baseCard, reshuffleCount };
};
