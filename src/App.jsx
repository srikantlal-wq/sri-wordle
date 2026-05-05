import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { Settings, BarChart2, Share2, X, Sun, Moon, Info } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Word list remains consistent
const SOLUTION_WORDS = ["ABOUT", "ABOVE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "AWFUL", "BADGE", "BAKER", "BASIC", "BASIS", "BEACH", "BEARD", "BEAST", "BEGIN", "BEING", "BELOW", "BENCH", "BIBLE", "BIRTH", "BLACK", "BLADE", "BLAME", "BLAST", "BLEND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CAMEL", "CANAL", "CANDY", "CANOE", "CARDS", "CARRY", "CARVE", "CASEY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOIR", "CHOSE", "CHUCK", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "COUCH", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAWL", "CRAZY", "CREAM", "CREEK", "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CRUEL", "CRUSH", "CURVE", "CYCLE", "DAILY", "DANCE", "DEALT", "DEATH", "DEBUG", "DELAY", "DELTA", "DENSE", "DEPTH", "DERBY", "DIARY", "DIGIT", "DIRTY", "DISCO", "DITCH", "DIVID", "DOGMA", "DOUBT", "DOZEN", "DRAFT", "DRAIN", "DRAMA", "DREAD", "DREAM", "DRESS", "DRIFT", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "ESSAY", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FAVOR", "FEAST", "FIELD", "FIFTY", "FIGHT", "FINAL", "FIRST", "FLAME", "FLASH", "FLEET", "FLIGHT", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FROST", "FRUIT", "FUNNY", "GHOST", "GIANT", "GIVEN", "GLASS", "GLOVE", "GLYPH", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRAPH", "GRASP", "GRASS", "GREAT", "GREEN", "GREET", "GRIEF", "GRIND", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH", "HEART", "HEAVY", "HELLO", "HENCE", "HONOR", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "IRONIC", "ISSUE", "ITSELF", "JACKS", "JOINT", "JUDGE", "JUICE", "KNIFE", "KNOCK", "LABEL", "LABOR", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LINUX", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYRIC", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARRY", "MATCH", "MAYBE", "MAYOR", "MEDIA", "METAL", "METER", "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MODEM", "MOIST", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIVE", "NAKED", "NIGHT", "NOBLE", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "OUTER", "OWNER", "PANEL", "PAPER", "PARTY", "PEACE", "PHASE", "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT", "PITCH", "PIXEL", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "PROXY", "PULSE", "PUNCH", "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUITE", "QUOTE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", "REALM", "REBEL", "REFER", "RELAX", "REPLY", "RESET", "RESIN", "RETRO", "RIDER", "RIGHT", "RIVAL", "RIVER", "ROBOT", "ROCKY", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SALAD", "SALES", "SAUCE", "SCALE", "SCENE", "SCOPE", "SCORE", "SCRAP", "SENSE", "SERVE", "SETUP", "SEVEN", "SHADE", "SHAFT", "SHAKE", "SHALL", "SHAME", "SHAPE", "SHARE", "SHARP", "SHEEP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOUT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPERM", "SPICE", "SPIKE", "SPINE", "SPIRIT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAIR", "STAKE", "STAND", "STARE", "START", "STATE", "STEAK", "STEAL", "STEAM", "STEEL", "STEEP", "STEER", "STICK", "STIFF", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "SWIFT", "SWING", "TABLE", "TAKEN", "TALLY", "TASTE", "TAXES", "TEACH", "TEETH", "TERMS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOKEN", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIL", "TRAIN", "TREAD", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNCLE", "UNDER", "UNION", "UNITE", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "YOUTH", "ZEBRA"];
const VALID_GUESSES = new Set([...SOLUTION_WORDS, "WHOMP", "CRWTH", "FJORD", "QUIRK", "ZIBET"]); 

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const START_DATE = new Date('2024-01-01').getTime();

const App = () => {
  const [user, setUser] = useState(null);
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');
  const [toast, setToast] = useState(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [gameMode, setGameMode] = useState('daily');
  const [gameNumber, setGameNumber] = useState(0);
  
  // Settings & Stats
  const [isHardMode, setIsHardMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  });

  // --- Auth ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  const getDailyInfo = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diff = today - START_DATE;
    const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));
    return { word: SOLUTION_WORDS[dayIndex % SOLUTION_WORDS.length], number: dayIndex };
  }, []);

  // --- Firestore Data Sync ---
  useEffect(() => {
    if (!user) return;
    const gameId = gameMode === 'daily' ? `daily-${gameNumber}` : 'random-session';
    const gameRef = doc(db, 'artifacts', appId, 'users', user.uid, 'games', gameId);
    const statsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'stats');

    const unsubGame = onSnapshot(gameRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.solution === solution || gameMode === 'daily') {
          setGuesses(data.guesses || []);
          setGameStatus(data.status || 'playing');
          if (data.solution) setSolution(data.solution);
        }
      }
    });

    const unsubStats = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) setStats(snap.data());
    });

    return () => { unsubGame(); unsubStats(); };
  }, [user, gameMode, gameNumber, solution]);

  const saveStats = async (won, numGuesses) => {
    if (!user) return;
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    if (won) {
      newStats.gamesWon += 1;
      newStats.currentStreak += 1;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      newStats.guessDistribution[numGuesses] += 1;
    } else {
      newStats.currentStreak = 0;
    }
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'stats'), newStats);
  };

  const saveGame = async (newGuesses, newStatus, sol) => {
    if (!user) return;
    const gameId = gameMode === 'daily' ? `daily-${gameNumber}` : 'random-session';
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'games', gameId), {
      guesses: newGuesses, status: newStatus, solution: sol
    });
  };

  // --- Helper: Get Colors ---
  const getLetterStatus = (guess, sol) => {
    const result = Array(5).fill('absent');
    const solArr = sol.split('');
    const guessArr = guess.split('');

    // Greens first
    guessArr.forEach((char, i) => {
      if (char === solArr[i]) {
        result[i] = 'correct';
        solArr[i] = null;
      }
    });
    // Yellows second
    guessArr.forEach((char, i) => {
      if (result[i] !== 'correct' && solArr.includes(char)) {
        result[i] = 'present';
        solArr[solArr.indexOf(char)] = null;
      }
    });
    return result;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const onKeyPress = useCallback((key) => {
    if (gameStatus !== 'playing') return;

    if (key === 'BACKSPACE') {
      setCurrentGuess(p => p.slice(0, -1));
      return;
    }

    if (key === 'ENTER') {
      if (currentGuess.length < 5) return showToast("Not enough letters");
      if (!VALID_GUESSES.has(currentGuess)) {
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
        return showToast("Not in word list");
      }

      // Hard Mode check
      if (isHardMode && guesses.length > 0) {
        const lastGuess = guesses[guesses.length - 1];
        const status = getLetterStatus(lastGuess, solution);
        for (let i = 0; i < 5; i++) {
          if (status[i] === 'correct' && currentGuess[i] !== lastGuess[i]) {
            return showToast(`${i+1}th letter must be ${lastGuess[i]}`);
          }
        }
      }

      const newGuesses = [...guesses, currentGuess];
      let status = 'playing';
      if (currentGuess === solution) status = 'won';
      else if (newGuesses.length === 6) status = 'lost';

      setGuesses(newGuesses);
      setGameStatus(status);
      setCurrentGuess('');
      saveGame(newGuesses, status, solution);
      if (status !== 'playing') {
        saveStats(status === 'won', newGuesses.length);
        setTimeout(() => setShowStats(true), 1500);
      }
      return;
    }

    if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(p => p + key);
    }
  }, [currentGuess, gameStatus, guesses, solution, isHardMode, stats, user]);

  useEffect(() => {
    const { word, number } = getDailyInfo();
    setSolution(word);
    setGameNumber(number);
  }, [getDailyInfo]);

  const handleShare = () => {
    const grid = guesses.map(g => {
      return getLetterStatus(g, solution).map(s => {
        if (s === 'correct') return isHighContrast ? '🟧' : '🟩';
        if (s === 'present') return isHighContrast ? '🟦' : '🟨';
        return '⬛';
      }).join('');
    }).join('\n');
    const text = `*SL* Wordle ${gameMode === 'daily' ? gameNumber : 'Random'} ${gameStatus === 'won' ? guesses.length : 'X'}/6\n\n${grid}`;
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast("Copied to clipboard!");
  };

  const keyboardColors = useMemo(() => {
    const colors = {};
    guesses.forEach(g => {
      const status = getLetterStatus(g, solution);
      g.split('').forEach((char, i) => {
        if (!colors[char] || status[i] === 'correct' || (status[i] === 'present' && colors[char] !== 'correct')) {
          colors[char] = status[i];
        }
      });
    });
    return colors;
  }, [guesses, solution]);

  const getTileColor = (status) => {
    if (status === 'correct') return isHighContrast ? 'bg-orange-500' : 'bg-emerald-600';
    if (status === 'present') return isHighContrast ? 'bg-sky-400' : 'bg-yellow-500';
    if (status === 'absent') return 'bg-gray-700';
    return 'bg-gray-900 border-2 border-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center">
      <header className="w-full max-w-lg flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex gap-2">
          <Info className="w-6 h-6 cursor-pointer" onClick={() => showToast("Guess the 5-letter word!")} />
          <Settings className="w-6 h-6 cursor-pointer" onClick={() => setShowSettings(true)} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">*SL* Wordle</h1>
        <div className="flex gap-2">
          <BarChart2 className="w-6 h-6 cursor-pointer" onClick={() => setShowStats(true)} />
        </div>
      </header>

      {/* Grid */}
      <div className="flex-grow flex flex-col justify-center gap-2 py-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex gap-2 ${shakeRow && i === guesses.length ? 'animate-shake' : ''}`}>
            {Array.from({ length: 5 }).map((_, j) => {
              const char = i < guesses.length ? guesses[i][j] : (i === guesses.length ? currentGuess[j] : '');
              const status = i < guesses.length ? getLetterStatus(guesses[i], solution)[j] : null;
              return (
                <div key={j} className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl font-bold uppercase rounded-sm transition-all duration-500 ${getTileColor(status)} ${i === guesses.length && char ? 'border-gray-400 scale-105' : ''}`}>
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-lg px-2 pb-8">
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
          ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ].map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5 mb-2">
            {row.map(k => {
              const status = keyboardColors[k];
              const colorClass = k === 'ENTER' || k === 'BACKSPACE' ? 'bg-gray-500 w-16' : (getTileColor(status) || 'bg-gray-500');
              return (
                <button key={k} onClick={() => onKeyPress(k)} className={`h-14 flex-1 rounded font-bold text-xs sm:text-sm uppercase ${colorClass} active:scale-95 transition-transform`}>
                  {k === 'BACKSPACE' ? '⌫' : k}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-xl p-6 relative">
            <X className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowSettings(false)} />
            <h2 className="text-xl font-bold mb-6 uppercase tracking-wider">Settings</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">Hard Mode</div>
                  <div className="text-xs text-gray-400">Any revealed hints must be used in guesses</div>
                </div>
                <button onClick={() => setIsHardMode(!isHardMode)} className={`w-12 h-6 rounded-full transition-colors relative ${isHardMode ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHardMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">High Contrast Mode</div>
                  <div className="text-xs text-gray-400">For improved color vision</div>
                </div>
                <button onClick={() => setIsHighContrast(!isHighContrast)} className={`w-12 h-6 rounded-full transition-colors relative ${isHighContrast ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHighContrast ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-xl p-8 relative flex flex-col items-center">
            <X className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowStats(false)} />
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Statistics</h2>
            <div className="flex justify-around w-full mb-8 text-center">
              <div><div className="text-3xl font-bold">{stats.gamesPlayed}</div><div className="text-[10px] uppercase">Played</div></div>
              <div><div className="text-3xl font-bold">{Math.round((stats.gamesWon / (stats.gamesPlayed || 1)) * 100)}</div><div className="text-[10px] uppercase">Win %</div></div>
              <div><div className="text-3xl font-bold">{stats.currentStreak}</div><div className="text-[10px] uppercase">Current Streak</div></div>
              <div><div className="text-3xl font-bold">{stats.maxStreak}</div><div className="text-[10px] uppercase">Max Streak</div></div>
            </div>
            
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 w-full text-left">Guess Distribution</h2>
            <div className="w-full space-y-1 mb-8">
              {[1, 2, 3, 4, 5, 6].map(num => {
                const count = stats.guessDistribution[num];
                const max = Math.max(...Object.values(stats.guessDistribution), 1);
                return (
                  <div key={num} className="flex items-center gap-2">
                    <div className="text-xs font-bold w-2">{num}</div>
                    <div className={`text-xs font-bold px-2 py-0.5 min-w-[20px] transition-all duration-1000 ${count > 0 ? (isHighContrast ? 'bg-orange-500' : 'bg-emerald-600') : 'bg-gray-700'}`} style={{ width: `${(count / max) * 100}%` }}>
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>

            {gameStatus !== 'playing' && (
              <div className="flex gap-4 w-full">
                <div className="flex-1 text-center border-r border-gray-800">
                  <div className="text-xs uppercase font-bold mb-1">Next *SL* Wordle</div>
                  <div className="text-2xl font-mono">DAILY ONLY</div>
                </div>
                <button onClick={handleShare} className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded flex items-center justify-center gap-2 font-bold py-3 transition-colors uppercase text-sm">
                  Share <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black font-bold py-2 px-4 rounded shadow-2xl z-[100] animate-bounce">
          {toast}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default App;