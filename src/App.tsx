import { useState, useEffect, useCallback } from 'react';

// --- Constants ---
const SOLUTION_WORDS: string[] = ["ABOUT", "ABOVE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "AWFUL", "BASIC", "BASIS", "BEACH", "BEARD", "BEAST", "BEGIN", "BEING", "BELOW", "BENCH", "BIRTH", "BLACK", "BLADE", "BLAME", "BLAST", "BLEND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CAMEL", "CANAL", "CANDY", "CANOE", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOIR", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "COUCH", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAWL", "CRAZY", "CREAM", "CREEK", "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CRUEL", "CRUSH", "CURVE", "CYCLE", "DAILY", "DANCE", "DEALT", "DEATH", "DELAY", "DELTA", "DENSE", "DEPTH", "DIARY", "DIGIT", "DIRTY", "DISCO", "DITCH", "DOUBT", "DOZEN", "DRAFT", "DRAIN", "DRAMA", "DREAD", "DREAM", "DRESS", "DRIFT", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "ESSAY", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FAVOR", "FEAST", "FIELD", "FIFTY", "FIGHT", "FINAL", "FIRST", "FLAME", "FLASH", "FLEET", "FLIGHT", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FROST", "FRUIT", "FUNNY", "GHOST", "GIANT", "GIVEN", "GLASS", "GLOVE", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRAPH", "GRASP", "GRASS", "GREAT", "GREEN", "GREET", "GRIEF", "GRIND", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH", "HEART", "HEAVY", "HELLO", "HENCE", "HONOR", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "JOINT", "JUDGE", "JUICE", "KNIFE", "KNOCK", "LABEL", "LABOR", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYRIC", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARRY", "MATCH", "MAYBE", "MAYOR", "MEDIA", "METAL", "METER", "MIGHT", "MINOR", "MINUS", "MODEL", "MODEM", "MOIST", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIVE", "NIGHT", "NOBLE", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "OUTER", "OWNER", "PANEL", "PAPER", "PARTY", "PEACE", "PHASE", "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT", "PITCH", "PIXEL", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "PROXY", "PULSE", "PUNCH", "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUITE", "QUOTE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", "REALM", "REBEL", "REFER", "RELAX", "REPLY", "RESET", "RESIN", "RETRO", "RIDER", "RIGHT", "RIVAL", "RIVER", "ROBOT", "ROCKY", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SALAD", "SALES", "SAUCE", "SCALE", "SCENE", "SCOPE", "SCORE", "SCRAP", "SENSE", "SERVE", "SETUP", "SEVEN", "SHADE", "SHAFT", "SHAKE", "SHALL", "SHAME", "SHAPE", "SHARE", "SHARP", "SHEEP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOUT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPICE", "SPIKE", "SPINE", "SPIRIT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAIR", "STAKE", "STAND", "STARE", "START", "STATE", "STEAK", "STEAL", "STEAM", "STEEL", "STEEP", "STEER", "STICK", "STIFF", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "SWIFT", "SWING", "TABLE", "TAKEN", "TALLY", "TASTE", "TAXES", "TEACH", "TEETH", "TERMS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOKEN", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIL", "TRAIN", "TREAD", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNCLE", "UNDER", "UNION", "UNITE", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "YOUTH", "ZEBRA"];
const MAX_GUESSES = 6;

export default function App() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'finished'>('playing');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (mode === 'daily') {
      const dailyKey = `daily-${today}`;
      const saved = localStorage.getItem(dailyKey);
      if (saved) {
        const data = JSON.parse(saved);
        setGuesses(data.guesses);
        setSolution(data.solution);
        setTimer(data.time || 0);
        setGameStatus('finished');
        setShowModal(true);
      } else {
        const seed = today.split('-').join('');
        const index = parseInt(seed) % SOLUTION_WORDS.length;
        setSolution(SOLUTION_WORDS[index]);
        resetGameState();
      }
    } else {
      setSolution(SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)]);
      resetGameState();
    }
  }, [mode]);

  const resetGameState = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setShowModal(false);
    setMessage('');
    setStartTime(Date.now());
    setTimer(0);
  };

  useEffect(() => {
    let interval: any;
    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus, startTime]);

  const validateWord = async (word: string) => {
    if (SOLUTION_WORDS.includes(word)) return true;
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      return res.ok;
    } catch { return false; }
  };

  const handleInput = useCallback(async (key: string) => {
    if (gameStatus !== 'playing') return;
    if (key === 'ENTER') {
      if (currentGuess.length !== 5) { showMessage("Too short"); return; }
      const isValid = await validateWord(currentGuess);
      if (!isValid) { showMessage("Not a valid word"); return; }
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');
      if (currentGuess === solution) {
        setGameStatus('won');
        setShowModal(true);
        if (mode === 'daily') saveDaily(newGuesses, 'won', timer);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameStatus('lost');
        setShowModal(true);
        if (mode === 'daily') saveDaily(newGuesses, 'lost', timer);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, guesses, gameStatus, solution, mode, timer]);

  const saveDaily = (finalGuesses: string[], status: string, finalTime: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`daily-${today}`, JSON.stringify({
      guesses: finalGuesses,
      solution,
      status,
      time: finalTime
    }));
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const shareResults = () => {
    const emojiGrid = guesses.map(g => {
      return g.split('').map((char, i) => {
        if (solution[i] === char) return '🟩';
        if (solution.includes(char)) return '🟨';
        return '⬛';
      }).join('');
    }).join('\n');
    
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const timeText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    const text = `Wordle SL Beta Version 1.9\nTime: ${timeText}\nScore: ${guesses.length}/${MAX_GUESSES}\n\n${emojiGrid}`;
    
    if (navigator.share) {
      navigator.share({ text }).catch(() => copyFallback(text));
    } else {
      copyFallback(text);
    }
  };

  const copyFallback = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage("Copied to clipboard!");
  };

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
      <header className="text-center py-4">
        <div className="flex items-center justify-center gap-2">
            <div className="bg-green-600 text-white w-8 h-8 rounded flex items-center justify-center font-black shadow-sm">W</div>
            <h1 className="text-3xl font-black tracking-tighter">WORDLE</h1>
        </div>
        <p className="text-sm mt-1 text-blue-600 font-medium tracking-tight" style={{ fontFamily: 'cursive' }}>
            SL Beta Version 1.9
        </p>
      </header>

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 flex rounded-lg p-1">
          <button onClick={() => setMode('daily')} className={`px-4 py-1 text-sm rounded-md font-bold transition ${mode === 'daily' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Daily</button>
          <button onClick={() => setMode('practice')} className={`px-4 py-1 text-sm rounded-md font-bold transition ${mode === 'practice' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Practice</button>
        </div>
        <div className="font-mono text-sm font-bold bg-slate-800 text-white px-3 py-1 rounded-full">⏱️ {timer}s</div>
      </div>

      <div className="grid grid-rows-6 gap-1.5 mb-6 max-h-[45vh]">
        {[...Array(6)].map((_, i) => (
          <Row key={i} guess={guesses[i] || (i === guesses.length ? currentGuess : '')} isSubmitted={i < guesses.length} solution={solution} />
        ))}
      </div>

      <div className="mt-auto w-full max-w-md pb-4">
        <Keyboard guesses={guesses} solution={solution} onKey={handleInput} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-2xl text-center max-w-xs w-full relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl font-bold"
            >✕</button>
            
            <h2 className="text-2xl font-black mb-2">
              {gameStatus === 'won' ? 'SPLENDID!' : gameStatus === 'lost' ? 'BUMMER!' : 'ALREADY PLAYED'}
            </h2>
            <p className="text-gray-600 mb-4">Word: <span className="font-bold text-black">{solution}</span></p>
            <p className="text-lg font-mono font-bold mb-6">Time: {timer}s</p>
            
            <div className="flex flex-col gap-3">
              <button onClick={shareResults} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg active:scale-95 transition">Share Results</button>
              {mode === 'practice' ? (
                <button onClick={resetGameState} className="w-full bg-black text-white py-3 rounded-xl font-bold active:scale-95 transition">New Practice</button>
              ) : (
                <button onClick={() => setShowModal(false)} className="w-full bg-gray-200 text-black py-3 rounded-xl font-bold active:scale-95 transition">Close Board</button>
              )}
            </div>
          </div>
        </div>
      )}

      {message && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[60] animate-bounce">{message}</div>}
    </div>
  );
}

function Row({ guess, isSubmitted, solution }: { guess: string, isSubmitted: boolean, solution: string }) {
  const letters = guess.padEnd(5, ' ').split('');
  return (
    <div className="flex gap-1.5">
      {letters.map((char, i) => {
        let style = "border-gray-300 text-black";
        if (isSubmitted) {
          if (solution[i] === char) style = "bg-green-600 border-green-600 text-white";
          else if (solution.includes(char)) style = "bg-yellow-500 border-yellow-500 text-white";
          else style = "bg-gray-500 border-gray-500 text-white";
        } else if (char !== ' ') style = "border-gray-600 scale-105";

        return (
          <div key={i} className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-2xl sm:text-3xl font-black transition-all duration-500 ${style}`}>
            {char.trim()}
          </div>
        );
      })}
    </div>
  );
}

function Keyboard({ guesses, solution, onKey }: { guesses: string[], solution: string, onKey: (k: string) => void }) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  const getKeyStyle = (key: string) => {
    if (key.length > 1) return 'bg-gray-200 text-black';
    let status = 'bg-gray-200 text-black';
    guesses.forEach(g => {
      g.split('').forEach((char, i) => {
        if (char !== key) return;
        if (solution[i] === key) status = 'bg-green-600 text-white';
        else if (solution.includes(key) && status !== 'bg-green-600 text-white') status = 'bg-yellow-500 text-white';
        else if (status === 'bg-gray-200 text-black') status = 'bg-gray-400 text-white';
      });
    });
    return status;
  };

  return (
    <div className="px-1">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 mb-2">
          {row.map(key => (
            <button
              key={key}
              onClick={() => onKey(key === 'BACK' ? 'BACKSPACE' : key)}
              className={`${getKeyStyle(key)} ${key.length > 1 ? 'px-2 text-[10px]' : 'flex-1'} h-14 rounded-md font-bold uppercase active:scale-90 transition-transform touch-manipulation`}
            >
              {key === 'BACK' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}