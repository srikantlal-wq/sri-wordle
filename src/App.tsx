import { useState, useEffect, useCallback, useMemo } from 'react';
// IMPORT THE DICTIONARY FROM THE JSON FILE
import VALID_DICTIONARY from './data/dictionary.json';

// Curated words that can be the answer (Add your favorite 465 here)
const SOLUTION_WORDS: string[] = ["ABOUT", "ABOVE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "AWFUL", "BASIC", "BASIS", "BEACH", "BEARD", "BEAST", "BEGIN", "BEING", "BELOW", "BENCH", "BIRTH", "BLACK", "BLADE", "BLAME", "BLAST", "BLEND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CAMEL", "CANAL", "CANDY", "CANOE", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOIR", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "COUCH", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAWL", "CRAZY", "CREAM", "CREEK", "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CRUEL", "CRUSH", "CURVE", "CYCLE", "DAILY", "DANCE", "DEALT", "DEATH", "DELAY", "DELTA", "DENSE", "DEPTH", "DIARY", "DIGIT", "DIRTY", "DISCO", "DITCH", "DOUBT", "DOZEN", "DRAFT", "DRAIN", "DRAMA", "DREAD", "DREAM", "DRESS", "DRIFT", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "ESSAY", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FAVOR", "FEAST", "FIELD", "FIFTY", "FIGHT", "FINAL", "FIRST", "FLAME", "FLASH", "FLEET", "FLIGHT", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FROST", "FRUIT", "FUNNY", "GHOST", "GIANT", "GIVEN", "GLASS", "GLOVE", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRAPH", "GRASP", "GRASS", "GREAT", "GREEN", "GREET", "GRIEF", "GRIND", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH", "HEART", "HEAVY", "HELLO", "HENCE", "HONOR", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "JOINT", "JUDGE", "JUICE", "KNIFE", "KNOCK", "LABEL", "LABOR", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYRIC", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARRY", "MATCH", "MAYBE", "MAYOR", "MEDIA", "METAL", "METER", "MIGHT", "MINOR", "MINUS", "MODEL", "MODEM", "MOIST", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIVE", "NIGHT", "NOBLE", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "OUTER", "OWNER", "PANEL", "PAPER", "PARTY", "PEACE", "PHASE", "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT", "PITCH", "PIXEL", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "PROXY", "PULSE", "PUNCH", "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUITE", "QUOTE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", "REALM", "REBEL", "REFER", "RELAX", "REPLY", "RESET", "RESIN", "RETRO", "RIDER", "RIGHT", "RIVAL", "RIVER", "ROBOT", "ROCKY", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SALAD", "SALES", "SAUCE", "SCALE", "SCENE", "SCOPE", "SCORE", "SCRAP", "SENSE", "SERVE", "SETUP", "SEVEN", "SHADE", "SHAFT", "SHAKE", "SHALL", "SHAME", "SHAPE", "SHARE", "SHARP", "SHEEP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOUT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPICE", "SPIKE", "SPINE", "SPIRIT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAIR", "STAKE", "STAND", "STARE", "START", "STATE", "STEAK", "STEAL", "STEAM", "STEEL", "STEEP", "STEER", "STICK", "STIFF", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "SWIFT", "SWING", "TABLE", "TAKEN", "TALLY", "TASTE", "TAXES", "TEACH", "TEETH", "TERMS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOKEN", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIL", "TRAIN", "TREAD", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNCLE", "UNDER", "UNION", "UNITE", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "YOUTH", "ZEBRA"];

const MAX_GUESSES = 6;

// Optimize lookup speed with a Set
const DICTIONARY_SET = new Set([...SOLUTION_WORDS, ...VALID_DICTIONARY]);

interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalTime: number;
  currentStreak: number;
}

export default function App() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'finished'>('playing');
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timer, setTimer] = useState(0);
  const [definition, setDefinition] = useState('');
  const [stats, setStats] = useState<UserStats>({ gamesPlayed: 0, gamesWon: 0, totalTime: 0, currentStreak: 0 });
  const [revealingRow, setRevealingRow] = useState<number | null>(null);

  useEffect(() => {
    const savedStats = localStorage.getItem('sl-wordle-stats');
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  const updateStats = (won: boolean, time: number) => {
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
      totalTime: won ? stats.totalTime + time : stats.totalTime,
      currentStreak: won ? stats.currentStreak + 1 : 0
    };
    setStats(newStats);
    localStorage.setItem('sl-wordle-stats', JSON.stringify(newStats));
  };

  const fetchDefinition = async (word: string) => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      const data = await res.json();
      if (data[0]?.meanings[0]?.definitions[0]?.definition) {
        setDefinition(data[0].meanings[0].definitions[0].definition);
      }
    } catch { setDefinition("Definition unavailable."); }
  };

  const setupGame = useCallback((targetMode: 'daily' | 'practice') => {
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setShowModal(false);
    setMessage('');
    setStartTime(Date.now());
    setTimer(0);
    setDefinition('');
    setRevealingRow(null);

    if (targetMode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      const dailyKey = `daily-${today}`;
      const saved = localStorage.getItem(dailyKey);
      if (saved) {
        const data = JSON.parse(saved);
        setGuesses(data.guesses);
        setSolution(data.solution);
        setTimer(data.time || 0);
        setGameStatus('finished');
        fetchDefinition(data.solution);
        setShowModal(true);
      } else {
        const seed = today.split('-').join('');
        const index = parseInt(seed) % SOLUTION_WORDS.length;
        setSolution(SOLUTION_WORDS[index]);
      }
    } else {
      const newWord = SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)];
      setSolution(newWord);
    }
  }, []);

  useEffect(() => {
    setupGame(mode);
  }, [mode, setupGame]);

  useEffect(() => {
    let interval: any;
    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus, startTime]);

  const handleInput = useCallback(async (key: string) => {
    if (gameStatus !== 'playing' || revealingRow !== null) return;

    if (key === 'ENTER') {
      const word = currentGuess.toUpperCase();
      if (word.length !== 5) {
        showMessage("Too short");
        return;
      }
      
      if (!DICTIONARY_SET.has(word)) {
        showMessage("Not in word list");
        return;
      }

      setRevealingRow(guesses.length);
      
      // Delay state update for animation
      setTimeout(() => {
        const newGuesses = [...guesses, word];
        setGuesses(newGuesses);
        setCurrentGuess('');
        setRevealingRow(null);

        if (word === solution) {
          setGameStatus('won');
          updateStats(true, timer);
          fetchDefinition(solution);
          setShowModal(true);
        } else if (newGuesses.length >= MAX_GUESSES) {
          setGameStatus('lost');
          updateStats(false, timer);
          fetchDefinition(solution);
          setShowModal(true);
        }
      }, 1600);

    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, guesses, gameStatus, solution, timer, revealingRow]);

  const shareResults = () => {
    const emojiGrid = guesses.map(g => {
      const rowColors = getRowColors(g, solution);
      return rowColors.map(c => c === 'green' ? '🟩' : c === 'yellow' ? '🟨' : '⬛').join('');
    }).join('\n');
    const text = `SL Wordle v3.8\nTime: ${timer}s\nScore: ${guesses.length}/${MAX_GUESSES}\n\n${emojiGrid}`;
    navigator.clipboard.writeText(text);
    showMessage("Copied to clipboard!");
  };

  const analysis = useMemo(() => {
    if (gameStatus === 'playing' || guesses.length === 0) return null;
    const pace = timer / guesses.length;
    let feedback = "Systematic play! You're narrowing down patterns like a pro.";
    if (gameStatus === 'won') {
      if (guesses.length <= 2) feedback = "Absolute genius! This solve was pure intuition.";
      else if (pace < 12) feedback = "Blazing fast reflexes. Your brain processes letters at high speed.";
    } else {
      feedback = "Tough luck. Even top bots find these patterns tricky.";
    }
    return { feedback, pace: pace.toFixed(1) };
  }, [gameStatus, guesses, timer]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) handleInput(key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleInput]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-slate-900 p-2 font-sans select-none overflow-x-hidden">
      <header className="text-center py-4 w-full relative">
        <button onClick={() => setShowStats(true)} className="absolute left-4 top-6 text-xl">📊</button>
        <div className="flex items-center justify-center gap-2">
          <div className="bg-green-600 text-white px-2 py-1 rounded flex items-center justify-center font-black shadow-sm text-lg leading-tight">SL</div>
          <h1 className="text-3xl font-black tracking-tighter">WORDLE</h1>
        </div>
        <p className="text-[11px] mt-1 text-blue-600 font-bold uppercase tracking-widest">Version 3.8</p>
      </header>

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 flex rounded-lg p-1">
          <button onClick={() => setMode('daily')} className={`px-4 py-1 text-sm rounded-md font-bold transition ${mode === 'daily' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>Daily</button>
          <button onClick={() => setMode('practice')} className={`px-4 py-1 text-sm rounded-md font-bold transition ${mode === 'practice' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>Practice</button>
        </div>
        <div className="font-mono text-sm font-bold bg-slate-800 text-white px-3 py-1 rounded-full">⏱️ {timer}s</div>
      </div>

      <div className="grid grid-rows-6 gap-1.5 mb-6">
        {[...Array(6)].map((_, i) => (
          <Row 
            key={i} 
            guess={i === guesses.length ? currentGuess : (guesses[i] || '')} 
            isSubmitted={i < guesses.length} 
            isRevealing={revealingRow === i}
            solution={solution} 
          />
        ))}
      </div>

      <div className="mt-auto w-full max-w-md pb-4">
        <Keyboard guesses={guesses} solution={solution} onKey={handleInput} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-white/95 flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full my-auto relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-xl">✕</button>
            <h2 className="text-xl font-black mb-1">{gameStatus === 'won' ? 'VICTORY' : 'GAME OVER'}</h2>
            <p className="text-4xl font-black text-green-600 mb-4">{solution}</p>
            
            <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 mb-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🤖</span>
                <span className="font-black text-xs uppercase tracking-tighter text-blue-800">Bot Analysis</span>
              </div>
              <p className="text-[11px] font-bold text-blue-900 leading-tight mb-2">{analysis?.feedback}</p>
              <div className="flex justify-between text-[10px] font-black text-blue-400 uppercase">
                <span>Pace: {analysis?.pace}s / word</span>
                <span>Efficiency: {gameStatus === 'won' ? 'High' : 'Moderate'}</span>
              </div>
            </div>

            <div className="text-xs italic text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg leading-relaxed">
              "{definition || 'No definition found.'}"
            </div>
            
            <div className="flex flex-col gap-2">
              <button onClick={shareResults} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold active:scale-95 transition">Share Performance</button>
              {mode === 'practice' ? (
                <button onClick={() => setupGame('practice')} className="w-full bg-black text-white py-3 rounded-xl font-bold active:scale-95 transition">New Practice</button>
              ) : (
                <button onClick={() => setShowModal(false)} className="w-full bg-gray-100 text-black py-3 rounded-xl font-bold active:scale-95 transition">Review Board</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center relative">
            <button onClick={() => setShowStats(false)} className="absolute top-4 right-4 text-gray-400 font-bold">✕</button>
            <h2 className="text-2xl font-black mb-6 uppercase">My Stats</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-100 p-4 rounded-2xl">
                <p className="text-2xl font-black">{stats.gamesPlayed}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Played</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl">
                <p className="text-2xl font-black">{stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Win Rate</p>
              </div>
            </div>
            <button onClick={() => setShowStats(false)} className="w-full bg-black text-white py-4 rounded-2xl font-bold">Back to Game</button>
          </div>
        </div>
      )}

      {message && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[70]">{message}</div>}
    </div>
  );
}

// Internal Helper Functions
function getRowColors(guess: string, solution: string) {
  const colors = Array(5).fill('grey');
  const solutionArr = solution.split('');
  const guessArr = guess.split('');

  guessArr.forEach((char, i) => {
    if (char === solutionArr[i]) {
      colors[i] = 'green';
      solutionArr[i] = ''; 
      guessArr[i] = ''; 
    }
  });

  guessArr.forEach((char, i) => {
    if (char !== '' && solutionArr.includes(char)) {
      colors[i] = 'yellow';
      solutionArr[solutionArr.indexOf(char)] = ''; 
    }
  });
  return colors;
}

function Row({ guess, isSubmitted, isRevealing, solution }: any) {
  const letters = guess.padEnd(5, ' ').split('');
  const colors = (isSubmitted || isRevealing) ? getRowColors(guess, solution) : Array(5).fill('');

  return (
    <div className="flex gap-1.5">
      {letters.map((char, i) => {
        let style = "border-gray-300";
        if (isSubmitted || isRevealing) {
          if (colors[i] === 'green') style = "bg-green-600 border-green-600 text-white";
          else if (colors[i] === 'yellow') style = "bg-yellow-500 border-yellow-500 text-white";
          else style = "bg-gray-500 border-gray-500 text-white";
        } else if (char !== ' ') style = "border-gray-600 scale-105";

        return (
          <div 
            key={i} 
            style={{ transitionDelay: isRevealing ? `${i * 300}ms` : '0ms' }}
            className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-2xl font-black transition-all duration-500 ${style} ${isRevealing ? 'rotate-X-180' : ''}`}
          >
            {char.trim()}
          </div>
        );
      })}
    </div>
  );
}

function Keyboard({ guesses, solution, onKey }: any) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  const getKeyStyle = (key: string) => {
    if (key.length > 1) return 'bg-gray-200 text-black';
    let status = 'bg-gray-200 text-black';
    guesses.forEach(g => {
      const colors = getRowColors(g, solution);
      g.split('').forEach((char, i) => {
        if (char === key) {
          if (colors[i] === 'green') status = 'bg-green-600 text-white';
          else if (colors[i] === 'yellow' && status !== 'bg-green-600 text-white') status = 'bg-yellow-500 text-white';
          else if (status === 'bg-gray-200 text-black') status = 'bg-gray-400 text-white';
        }
      });
    });
    return status;
  };

  return (
    <div className="px-1">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 mb-2">
          {row.map(key => (
            <button key={key} onClick={() => onKey(key === 'BACK' ? 'BACKSPACE' : key)}
              className={`${getKeyStyle(key)} ${key.length > 1 ? 'px-2 text-[10px]' : 'flex-1'} h-14 rounded-md font-bold active:scale-90 transition-transform touch-manipulation`}
            >
              {key === 'BACK' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}