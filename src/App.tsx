import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, 
  History, 
  LayoutGrid, 
  Trophy, 
  AlertCircle,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Card, Suit, Rank, SUITS, RANKS, getRankName, getSuitColor } from './types';
import { canPlay, getInitialState, shuffle } from './utils/gameLogic';

const CardComponent = ({ 
  card, 
  onClick, 
  isPlayable = false, 
  isBase = false,
  className = ""
}: { 
  card: Card; 
  onClick?: () => void; 
  isPlayable?: boolean;
  isBase?: boolean;
  className?: string;
  key?: React.Key;
}) => {
  const colorClass = getSuitColor(card.suit);
  
  return (
    <motion.div
      layoutId={card.id}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`
        relative w-24 h-36 sm:w-28 sm:h-40 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col justify-between p-3 cursor-pointer select-none card-shadow
        ${isPlayable ? 'ring-2 ring-emerald-500/50 ring-offset-4 ring-offset-zinc-950' : ''}
        ${isBase ? 'ring-2 ring-zinc-500/50 ring-offset-4 ring-offset-zinc-950' : ''}
        ${className}
      `}
    >
      <div className={`flex flex-col items-start leading-none ${colorClass}`}>
        <span className="text-xl font-bold font-mono tracking-tighter">{getRankName(card.rank)}</span>
        <span className="text-sm opacity-80">{card.suit}</span>
      </div>
      
      <div className={`flex justify-center items-center text-4xl drop-shadow-sm ${colorClass}`}>
        {card.suit}
      </div>
      
      <div className={`flex flex-col items-end leading-none rotate-180 ${colorClass}`}>
        <span className="text-xl font-bold font-mono tracking-tighter">{getRankName(card.rank)}</span>
        <span className="text-sm opacity-80">{card.suit}</span>
      </div>
    </motion.div>
  );
};

const CardStatusTable = ({ 
  discarded, 
  hand, 
  baseCard 
}: { 
  discarded: Set<string>; 
  hand: Card[];
  baseCard: Card | null;
}) => {
  const handSet = React.useMemo(() => new Set(hand.map(c => `${c.suit}-${c.rank}`)), [hand]);
  
  return (
    <div className="glass rounded-2xl p-4 overflow-x-auto">
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid className="w-4 h-4 text-emerald-500" />
        <h2 className="text-xs uppercase tracking-widest font-mono text-zinc-500">Card Tracker</h2>
      </div>
      
      <div className="min-w-[500px] grid grid-cols-14 gap-1 relative">
        {/* Vertical Highlight Bar */}
        {baseCard && (
          <div 
            className="absolute inset-0 pointer-events-none z-0 grid grid-cols-14 gap-1"
          >
            <div 
              className="bg-emerald-500/5 border-x border-emerald-500/20 transition-all duration-300"
              style={{ gridColumn: baseCard.rank + 1 }}
            />
          </div>
        )}

        {/* Column Headers */}
        <div className="w-8"></div>
        {RANKS.map(r => (
          <div 
            key={r} 
            className={`
              text-[10px] font-mono text-center uppercase transition-colors duration-300 z-10
              ${baseCard?.rank === r ? 'text-emerald-400 font-bold' : 'text-zinc-500'}
            `}
          >
            {getRankName(r)}
          </div>
        ))}
        
        {/* Grid Rows */}
        {SUITS.map(suit => {
          const isTargetSuit = baseCard?.suit === suit;
          return (
            <React.Fragment key={suit}>
              {/* Suit Label */}
              <div 
                className={`
                  text-center text-lg transition-all duration-300 z-10 flex items-center justify-center
                  ${getSuitColor(suit)} 
                  ${isTargetSuit ? 'scale-125 font-bold bg-emerald-500/10 rounded-l-sm' : 'opacity-60'}
                `}
              >
                {suit}
              </div>

              {/* Rank Cells */}
              {RANKS.map(rank => {
                const cardKey = `${suit}-${rank}`;
                const isDiscarded = discarded.has(cardKey);
                const isInHand = handSet.has(cardKey);
                const isTargetRank = baseCard?.rank === rank;
                
                return (
                  <div 
                    key={rank} 
                    className={`
                      h-6 rounded-sm flex items-center justify-center transition-all duration-300 relative z-10
                      ${isDiscarded ? 'bg-zinc-800/50 text-zinc-700' : isInHand ? 'bg-amber-500/30 text-amber-400 ring-1 ring-amber-500/50' : 'bg-emerald-500/10 text-emerald-400/40'}
                      ${isTargetSuit ? 'bg-emerald-500/10' : ''}
                      ${isTargetSuit && isTargetRank ? 'ring-2 ring-emerald-500/60 bg-emerald-500/20' : ''}
                    `}
                    title={`${suit}${getRankName(rank)}${isInHand ? ' (In Hand)' : isDiscarded ? ' (Discarded)' : ''}`}
                  >
                    {isDiscarded ? '□' : isInHand ? 'H' : '■'}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500/20 rounded-sm"></span> Deck
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-amber-500/40 ring-1 ring-amber-500/50 rounded-sm"></span> Hand (H)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-zinc-800 rounded-sm"></span> Discarded (□)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 border border-emerald-500/40 bg-emerald-500/10 rounded-sm"></span> Playable
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState(() => getInitialState());
  const [discardedCount, setDiscardedCount] = useState(0);
  const [history, setHistory] = useState<Card[]>([]);
  const [discardedSet, setDiscardedSet] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [reshufflesLeft, setReshufflesLeft] = useState(3);
  const [message, setMessage] = useState<string | null>(null);

  const startNewGame = useCallback(() => {
    const initial = getInitialState();
    setGameState(initial);
    setDiscardedCount(0);
    setHistory([initial.baseCard]);
    setDiscardedSet(new Set([`${initial.baseCard.suit}-${initial.baseCard.rank}`]));
    setIsGameOver(false);
    setReshufflesLeft(3);
    setMessage(initial.reshuffleCount > 0 ? `Reshuffled ${initial.reshuffleCount} times to find a playable start.` : null);
  }, []);

  const reshuffleHand = () => {
    setGameState(prev => {
      if (reshufflesLeft <= 0 || prev.deck.length === 0) return prev;

      const fullPool = [...prev.deck, ...prev.hand];
      const shuffledPool = shuffle(fullPool);
      const newHand = shuffledPool.splice(0, 5);
      const newDeck = shuffledPool;

      return {
        ...prev,
        hand: newHand,
        deck: newDeck,
      };
    });
    setReshufflesLeft(prev => prev - 1);
    setMessage("Hand reshuffled!");
  };

  const endGame = () => {
    setIsGameOver(true);
  };

  useEffect(() => {
    // Check for game over
    const playable = gameState.hand.some(c => canPlay(c, gameState.baseCard!));
    if (!playable && gameState.hand.length > 0 && (reshufflesLeft === 0 || gameState.deck.length === 0)) {
      setIsGameOver(true);
    }
  }, [gameState.hand, gameState.baseCard, reshufflesLeft, gameState.deck.length]);

  const playCard = (index: number) => {
    const card = gameState.hand[index];
    if (!canPlay(card, gameState.baseCard!)) return;

    setGameState(prev => {
      const newHand = [...prev.hand];
      newHand.splice(index, 1);

      const newDeck = [...prev.deck];
      if (newDeck.length > 0) {
        newHand.push(newDeck.pop()!);
      }

      return {
        ...prev,
        hand: newHand,
        deck: newDeck,
        baseCard: card
      };
    });

    setDiscardedCount(prev => prev + 1);
    setHistory(prev => [...prev, card]);
    setDiscardedSet(prev => {
      const next = new Set(prev);
      next.add(`${card.suit}-${card.rank}`);
      return next;
    });
    setMessage(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif italic tracking-tight text-white mb-1">What If Solitaire</h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Strategic Card Elimination</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Discarded</span>
            <span className="text-3xl font-mono font-medium text-emerald-500">{discardedCount + 1}</span>
          </div>
          <div className="h-10 w-px bg-zinc-800"></div>
          <button 
            onClick={startNewGame}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Game Board */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          
          {/* Table Center */}
          <div className="relative flex flex-col items-center justify-center py-12 bg-zinc-900/50 rounded-[3rem] border border-zinc-800/50">
            <div className="flex gap-8 items-center">
              {/* Deck */}
              <div className="relative">
                <div className="w-24 h-36 sm:w-28 sm:h-40 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center card-shadow">
                  <div className="text-zinc-600 font-mono text-sm rotate-90 uppercase tracking-widest">
                    {gameState.deck.length} Cards
                  </div>
                </div>
                {gameState.deck.length > 1 && (
                  <div className="absolute -top-1 -left-1 w-24 h-36 sm:w-28 sm:h-40 bg-zinc-800 rounded-xl border border-zinc-700 -z-10"></div>
                )}
              </div>

              <ChevronRight className="w-6 h-6 text-zinc-700" />

              {/* Base Pile */}
              <AnimatePresence mode="wait">
                <CardComponent 
                  key={gameState.baseCard?.id}
                  card={gameState.baseCard!} 
                  isBase 
                />
              </AnimatePresence>
            </div>
            
            <div className="absolute bottom-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              Current Base Pile
            </div>
          </div>

          {/* Player Hand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Your Hand</span>
                {gameState.hand.length > 0 && !gameState.hand.some(c => canPlay(c, gameState.baseCard!)) && reshufflesLeft > 0 && gameState.deck.length > 0 && (
                  <div className="flex gap-2">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={reshuffleHand}
                      className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-full transition-all text-[10px] font-mono uppercase tracking-wider"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Stuck? Reshuffle Hand ({reshufflesLeft} left)
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={endGame}
                      className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-full transition-all text-[10px] font-mono uppercase tracking-wider"
                    >
                      End Game
                    </motion.button>
                  </div>
                )}
              </div>
              {message && (
                <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {message}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <AnimatePresence>
                {gameState.hand.map((card, idx) => (
                  <CardComponent 
                    key={card.id}
                    card={card}
                    isPlayable={canPlay(card, gameState.baseCard!)}
                    onClick={() => playCard(idx)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <CardStatusTable 
            discarded={discardedSet} 
            hand={gameState.hand}
            baseCard={gameState.baseCard}
          />

          {/* Play History */}
          <div className="glass rounded-2xl p-6 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-zinc-500" />
              <h2 className="text-xs uppercase tracking-widest font-mono text-zinc-500">Play History</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[400px]">
              {history.slice().reverse().map((card, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-600">#{history.length - i}</span>
                    <span className={`text-lg ${getSuitColor(card.suit)}`}>{card.suit}</span>
                    <span className="font-mono font-medium">{getRankName(card.rank)}</span>
                  </div>
                  {i === 0 && (
                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded">Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-emerald-500" />
              </div>
              
              <h2 className="text-3xl font-serif italic text-white mb-2">Game Over</h2>
              <p className="text-zinc-400 mb-8">No more playable cards in your hand.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-800/50 p-4 rounded-2xl">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Discarded</div>
                  <div className="text-2xl font-mono text-white">{discardedCount + 1}</div>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-2xl">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Remaining</div>
                  <div className="text-2xl font-mono text-white">{gameState.deck.length + gameState.hand.length}</div>
                </div>
              </div>
              
              <button 
                onClick={startNewGame}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-zinc-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto pt-8 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
        <div>© 2024 What If Solitaire</div>
        <div className="flex gap-4">
          <span>Rules: Match Suit or Rank</span>
          <span>•</span>
          <span>Goal: Clear the Deck</span>
        </div>
      </footer>
    </div>
  );
}
