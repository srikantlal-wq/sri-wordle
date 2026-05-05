import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { Settings, BarChart2, Share2, X, Sun, Moon, Info } from 'lucide-react';

// --- Manual Environment Overrides ---
if (typeof __firebase_config === 'undefined') {
  window.__firebase_config = JSON.stringify({
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-app-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  });
}

if (typeof __app_id === 'undefined') {
  window.__app_id = 'my-custom-wordle';
}

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const SOLUTION_WORDS = ["ABOUT", "ABOVE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "AISLE", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "AWFUL", "BASIC", "BASIS", "BEACH", "BEARD", "BEAST", "BEGIN", "BEING", "BELOW", "BENCH", "BIRTH", "BLACK", "BLADE", "BLAME", "BLAST", "BLEND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CAMEL", "CANAL", "CANDY", "CANOE", "CARDS", "CARRY", "CARVE", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOIR", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "COUCH", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAWL", "CRAZY", "CREAM", "CREEK", "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CRUEL", "CRUSH", "CURVE", "CYCLE", "DAILY", "DANCE", "DEALT", "DEATH", "DEBUG", "DELAY", "DELTA", "DENSE", "DEPTH", "DERBY", "DIARY", "DIGIT", "DIRTY", "DISCO", "DITCH", "DOUBT", "DOZEN", "DRAFT", "DRAIN", "DRAMA", "DREAD", "DREAM", "DRESS", "DRIFT", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "ESSAY", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FAVOR", "FEAST", "FIELD", "FIFTY", "FIGHT", "FINAL", "FIRST", "FLAME", "FLASH", "FLEET", "FLIGHT", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FROST", "FRUIT", "FUNNY", "GHOST", "GIANT", "GIVEN", "GLASS", "GLOVE", "GLYPH", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRAPH", "GRASP", "GRASS", "GREAT", "GREEN", "GREET", "GRIEF", "GRIND", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH", "HEART", "HEAVY", "HELLO", "HENCE", "HONOR", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "ITALY", "ITEMS", "ITSELF", "JACKS", "JOINT", "JUDGE", "JUICE", "KNACK", "KNIFE", "KNOCK", "LABEL", "LABOR", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYRIC", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARRY", "MATCH", "MAYBE", "MAYOR", "MEDIA", "METAL", "METER", "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MODEM", "MOIST", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIVE", "NAKED", "NIGHT", "NOBLE", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "OUTER", "OWNER", "PANEL", "PAPER", "PARTY", "PEACE", "PHASE", "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT", "PITCH", "PIXEL", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "PROXY", "PULSE", "PUNCH", "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUITE", "QUOTE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", "REALM", "REBEL", "REFER", "RELAX", "REPLY", "RESET", "RESIN", "RETRO", "RIDER", "RIGHT", "RIVAL", "RIVER", "ROBOT", "ROCKY", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SALAD", "SALES", "SAUCE", "SCALE", "SCENE", "SCOPE", "SCORE", "SCRAP", "SENSE", "SERVE", "SETUP", "SEVEN", "SHADE", "SHAFT", "SHAKE", "SHALL", "SHAME", "SHAPE", "SHARE", "SHARP", "SHEEP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOUT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPICE", "SPIKE", "SPINE", "SPIRIT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAIR", "STAKE", "STAND", "STARE", "START", "STATE", "STEAK", "STEAL", "STEAM", "STEEL", "STEEP", "STEER", "STICK", "STIFF", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "SWIFT", "SWING", "TABLE", "TAKEN", "TALLY", "TASTE", "TAXES", "TEACH", "TEETH", "TERMS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOKEN", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIL", "TRAIN", "TREAD", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNCLE", "UNDER", "UNION", "UNITE", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "YOUTH", "ZEBRA"];

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

  // Safe solution calculation
  const getDailyInfo = useCallback(() => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const diff = today - START_DATE;
        const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));
        return { 
            word: SOLUTION_WORDS[dayIndex % SOLUTION_WORDS.length] || "ABOUT", 
            number: dayIndex 
        };
    } catch (e) {
        return { word: "ABOUT", number: 0 };
    }
  }, []);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
      } catch (e) { console.error("Auth failed", e); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Set Solution
  useEffect(() => {
    if (gameMode === 'daily') {
      const { word, number } = getDailyInfo();
      setSolution(word);
      setGameNumber(number);
    } else if (!solution) {
      setSolution(SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)]);
    }
  }, [gameMode, getDailyInfo, solution]);

  // Firestore Listeners
  useEffect(() => {
    if (!user) return;
    const gameId = gameMode === 'daily' ? `daily-${gameNumber}` : 'practice-mode';
    const gameRef = doc(db, 'artifacts', appId, 'users', user.uid, 'games', gameId);
    const statsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'stats');

    const unsubGame = onSnapshot(gameRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
            setGuesses(data.guesses || []);
            setGameStatus(data.status || 'playing');
            if (data.solution && gameMode !== 'daily') setSolution(data.solution);
        }
      }
    }, (err) => console.warn("Game data fetch fail", err));

    const unsubStats = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) setStats(snap.data());
    }, (err) => console.warn("Stats fetch fail", err));

    return () => { unsubGame(); unsubStats(); };
  }, [user, gameMode, gameNumber]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const getLetterStatus = (guess, sol) => {
    if (!guess || !sol) return Array(5).fill('absent');
    const result = Array(5).fill('absent');
    const solArr = sol.split('');
    const guessArr = guess.split('');
    
    guessArr.forEach((char, i) => {
      if (char === solArr[i]) {
        result[i] = 'correct';
        solArr[i] = null;
      }
    });
    guessArr.forEach((char, i) => {
      if (result[i] !== 'correct' && solArr.includes(char)) {
        result[i] = 'present';
        solArr[solArr.indexOf(char)] = null;
      }
    });
    return result;
  };

  const saveStats = async (won, numGuesses) => {
    if (!user || gameMode !== 'daily') return;
    try {
        const newStats = { ...stats };
        newStats.gamesPlayed += 1;
        if (won) {
          newStats.gamesWon += 1;
          newStats.currentStreak += 1;
          newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
          newStats.guessDistribution = { ...newStats.guessDistribution };
          newStats.guessDistribution[numGuesses] = (newStats.guessDistribution[numGuesses] || 0) + 1;
        } else {
          newStats.currentStreak = 0;
        }
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'stats'), newStats);
    } catch (e) { console.error("Stats save error", e); }
  };

  const onKeyPress = useCallback((key) => {
    if (gameStatus !== 'playing') return;
    if (key === 'BACKSPACE') {
      setCurrentGuess(p => p.slice(0, -1));
      return;
    }
    if (key === 'ENTER') {
      if (currentGuess.length < 5) return showToast("Not enough letters");
      
      const newGuesses = [...guesses, currentGuess];
      let status = 'playing';
      if (currentGuess === solution) status = 'won';
      else if (newGuesses.length === 6) status = 'lost';

      setGuesses(newGuesses);
      setGameStatus(status);
      setCurrentGuess('');

      // Async persistence
      if (user) {
          const gameId = gameMode === 'daily' ? `daily-${gameNumber}` : 'practice-mode';
          setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'games', gameId), {
            guesses: newGuesses, status: status, solution: solution, mode: gameMode
          }).catch(e => console.error("Save error", e));
      }

      if (status !== 'playing') {
        saveStats(status === 'won', newGuesses.length);
        setTimeout(() => setShowStats(true), 800);
      }
      return;
    }
    if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(p => p + key);
    }
  }, [currentGuess, gameStatus, guesses, solution, user, gameMode, gameNumber, stats]);

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

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("Copied to clipboard!");
    } catch (err) {
      showToast("Unable to copy");
    }
    document.body.removeChild(textArea);
  };

  const resetGame = () => {
    const randomWord = SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)];
    setGuesses([]);
    setGameStatus('playing');
    setSolution(randomWord);
    setGameMode('practice');
    setCurrentGuess('');
    setShowStats(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center overflow-x-hidden">
      <header className="w-full max-w-md flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex gap-3">
          <Settings className="w-5 h-5 cursor-pointer text-gray-400" onClick={() => setShowSettings(true)} />
          <Info className="w-5 h-5 cursor-pointer text-gray-400" onClick={() => showToast("Guess the 5-letter word!")} />
        </div>
        <div className="text-center">
            <h1 className="text-xl font-black tracking-tighter uppercase">Wordle Pro</h1>
            <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
                {gameMode === 'daily' ? `Daily #${gameNumber}` : 'Practice'}
            </div>
        </div>
        <BarChart2 className="w-5 h-5 cursor-pointer text-gray-400" onClick={() => setShowStats(true)} />
      </header>

      {/* Grid */}
      <div className="flex-grow flex flex-col justify-center gap-1.5 py-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex gap-1.5 ${shakeRow && i === guesses.length ? 'animate-shake' : ''}`}>
            {Array.from({ length: 5 }).map((_, j) => {
              const char = i < guesses.length ? guesses[i][j] : (i === guesses.length ? currentGuess[j] : '');
              const status = i < guesses.length ? getLetterStatus(guesses[i], solution)[j] : null;
              return (
                <div key={j} className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl font-bold uppercase rounded transition-all duration-500 ${getTileColor(status)}`}>
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-md px-1 pb-6">
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
          ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ].map((row, i) => (
          <div key={i} className="flex justify-center gap-1 mb-2">
            {row.map(k => {
              const status = keyboardColors[k];
              const isSpecial = k === 'ENTER' || k === 'BACKSPACE';
              const colorClass = isSpecial ? 'bg-gray-500' : (getTileColor(status) || 'bg-gray-600');
              return (
                <button 
                  key={k} 
                  onClick={() => onKeyPress(k)} 
                  className={`h-14 ${isSpecial ? 'px-3 text-[10px]' : 'flex-1'} rounded font-bold uppercase ${colorClass} active:opacity-50 transition-all touch-manipulation`}
                >
                  {k === 'BACKSPACE' ? '⌫' : k}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative border border-gray-700">
            <button onClick={() => setShowStats(false)} className="absolute top-4 right-4 text-gray-400"><X /></button>
            
            <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Statistics</h2>
            
            <div className="flex justify-around mb-8">
              <div className="text-center">
                <div className="text-3xl font-black">{stats?.gamesPlayed || 0}</div>
                <div className="text-[10px] uppercase text-gray-500 font-bold">Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black">{Math.round(((stats?.gamesWon || 0) / (stats?.gamesPlayed || 1)) * 100)}</div>
                <div className="text-[10px] uppercase text-gray-500 font-bold">Win %</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black">{stats?.currentStreak || 0}</div>
                <div className="text-[10px] uppercase text-gray-500 font-bold">Streak</div>
              </div>
            </div>

            {gameStatus !== 'playing' && (
              <div className="space-y-4">
                <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">
                        {gameStatus === 'won' ? 'Magnificent!' : 'Next time!'}
                    </p>
                    <p className="text-2xl font-black uppercase text-emerald-400">{solution}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            const grid = guesses.map(g => getLetterStatus(g, solution).map(s => s === 'correct' ? '🟩' : (s === 'present' ? '🟨' : '⬛')).join('')).join('\n');
                            copyToClipboard(`Wordle Pro ${gameMode === 'daily' ? gameNumber : 'Practice'} ${gameStatus === 'won' ? guesses.length : 'X'}/6\n\n${grid}`);
                        }}
                        className="flex-1 bg-emerald-600 py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2"
                    >
                        Share <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={resetGame}
                        className="flex-1 bg-gray-700 py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2"
                    >
                        Reset <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-800 w-full max-w-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold uppercase tracking-widest">Settings</h2>
                <X onClick={() => setShowSettings(false)} className="cursor-pointer" />
            </div>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className="font-bold">High Contrast</span>
                    <button onClick={() => setIsHighContrast(!isHighContrast)} className={`w-12 h-6 rounded-full relative transition-colors ${isHighContrast ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHighContrast ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
                <button 
                    onClick={() => { setGameMode(gameMode === 'daily' ? 'practice' : 'daily'); setShowSettings(false); }}
                    className="w-full bg-gray-700 py-3 rounded-lg font-bold uppercase text-xs tracking-widest"
                >
                    Switch to {gameMode === 'daily' ? 'Practice' : 'Daily'} Mode
                </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-white text-black font-bold py-2 px-6 rounded-full shadow-2xl z-[200] text-sm animate-fade-in-down">
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out; }
        .touch-manipulation { touch-action: manipulation; }
      `}</style>
    </div>
  );
};

export default App;