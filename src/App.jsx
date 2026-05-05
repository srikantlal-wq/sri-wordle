import React, { useState, useEffect, useCallback } from 'react';
// We import the main entry points, but we will handle the services safely
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const SOLUTION_WORDS = ["ABOUT", "ABOVE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "AISLE", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "AWFUL", "BASIC", "BASIS", "BEACH", "BEARD", "BEAST", "BEGIN", "BEING", "BELOW", "BENCH", "BIRTH", "BLACK", "BLADE", "BLAME", "BLAST", "BLEND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER"];

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [errorLog, setErrorLog] = useState(null);
  
  // Game Logic State
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); 
  const [toast, setToast] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // 1. Safe Initialization Logic
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        // Safe check for global variables
        const rawConfig = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-id';
        
        if (rawConfig) {
          const config = JSON.parse(rawConfig);
          const firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(config);
          const auth = getAuth(firebaseApp);
          
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }

          onAuthStateChanged(auth, (user) => {
            if (isMounted) setIsReady(true);
          });
        } else {
          if (isMounted) setIsReady(true);
        }
      } catch (e) {
        console.error("Setup Error:", e);
        if (isMounted) {
          setErrorLog(e.message);
          setIsReady(true); // Still show the game
        }
      }
    };

    setup();
    // Safety timeout: If Firebase hangs, show the game anyway after 2s
    const timeout = setTimeout(() => {
      if (isMounted) setIsReady(true);
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  // 2. Set Daily Word
  useEffect(() => {
    if (!isReady) return;
    const day = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 86400000);
    setSolution(SOLUTION_WORDS[day % SOLUTION_WORDS.length]);
  }, [isReady]);

  const onKeyPress = useCallback((key) => {
    if (gameStatus !== 'playing') return;
    
    const k = key.toUpperCase();
    if (k === 'BACKSPACE' || k === 'DELETE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (k === 'ENTER') {
      if (currentGuess.length < 5) {
        setToast("Too short");
        setTimeout(() => setToast(null), 1000);
        return;
      }
      const next = [...guesses, currentGuess];
      setGuesses(next);
      if (currentGuess === solution) setGameStatus('won');
      else if (next.length >= 6) setGameStatus('lost');
      setCurrentGuess('');
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(k)) {
      setCurrentGuess(prev => prev + k);
    }
  }, [currentGuess, guesses, gameStatus, solution]);

  // Global Keyboard Listener
  useEffect(() => {
    const handleDown = (e) => onKeyPress(e.key);
    window.addEventListener('keydown', handleDown);
    return () => window.removeEventListener('keydown', handleDown);
  }, [onKeyPress]);

  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-[#121213] flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="font-black uppercase tracking-widest text-sm">Loading Experience...</div>
        {errorLog && <div className="mt-4 text-red-500 font-mono text-[10px] opacity-50">{errorLog}</div>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#121213] text-white flex flex-col overflow-hidden touch-none select-none">
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="w-10"></div>
        <h1 className="text-xl font-black uppercase tracking-tighter">Wordle Pro</h1>
        <button onClick={() => setShowStats(true)} className="p-2 text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center overflow-hidden">
        <div className="grid grid-rows-6 gap-2">
          {Array.from({ length: 6 }).map((_, r) => (
            <div key={r} className="flex gap-2">
              {Array.from({ length: 5 }).map((_, c) => {
                const char = r < guesses.length ? guesses[r][c] : (r === guesses.length ? currentGuess[c] : '');
                let status = 'border-gray-700';
                if (r < guesses.length) {
                   if (guesses[r][c] === solution[c]) status = 'bg-emerald-600 border-emerald-600';
                   else if (solution.includes(guesses[r][c])) status = 'bg-yellow-600 border-yellow-600';
                   else status = 'bg-gray-700 border-gray-700';
                }
                return (
                  <div key={c} className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl font-black border-2 uppercase rounded-sm transition-all duration-500 ${status}`}>
                    {char}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      <footer className="p-2 pb-6 w-full max-w-md mx-auto shrink-0">
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
          ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
        ].map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5 mb-2">
            {row.map(k => (
              <button
                key={k}
                onClick={() => onKeyPress(k === 'DEL' ? 'BACKSPACE' : k)}
                className={`h-14 flex-1 flex items-center justify-center rounded font-bold uppercase active:bg-gray-500 touch-manipulation transition-colors ${k.length > 1 ? 'px-4 text-[10px] bg-gray-500' : 'bg-gray-600'}`}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </footer>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full font-black text-sm uppercase z-[2000] shadow-xl animate-bounce">
          {toast}
        </div>
      )}

      {showStats || gameStatus !== 'playing' ? (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-[3000] backdrop-blur-sm">
           <div className="bg-[#1e1e1f] w-full max-w-xs p-8 rounded-3xl text-center border border-gray-800 shadow-2xl">
              <h2 className="text-gray-500 text-xs font-black uppercase mb-4 tracking-widest">Game Over</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-tighter">The correct word was</p>
              <p className="text-4xl font-black text-emerald-500 mb-8 tracking-[0.2em]">{solution}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-emerald-600 py-4 rounded-xl font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Refresh Game
              </button>
           </div>
        </div>
      ) : null}
    </div>
  );
}