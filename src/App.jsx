import React, { useState, useEffect, useCallback } from 'react';

// An expanded curated list of common 5-letter words
const WORD_LIST = [
  "ABOUT", "ABOVE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE",
  "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER",
  "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE",
  "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "AWFUL", "BADGE",
  "BAKER", "BASIC", "BASIS", "BEACH", "BEARD", "BEAST", "BEGIN", "BEING", "BELOW", "BENCH",
  "BIBLE", "BIRTH", "BLACK", "BLADE", "BLAME", "BLAST", "BLEND", "BLOCK", "BLOOD", "BOARD",
  "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BREED",
  "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF",
  "CAMEL", "CANAL", "CANDY", "CANOE", "CARDS", "CARRY", "CARVE", "CASEY", "CATCH", "CAUSE",
  "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEST", "CHIEF", "CHILD",
  "CHINA", "CHOIR", "CHOSE", "CHUCK", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK",
  "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "COUCH", "COULD", "COUNT", "COURT",
  "COVER", "CRACK", "CRAFT", "CRASH", "CRAWL", "CRAZY", "CREAM", "CREEK", "CRIME", "CROSS",
  "CROWD", "CROWN", "CRUDE", "CRUEL", "CRUSH", "CURVE", "CYCLE", "DAILY", "DANCE", "DEALT",
  "DEATH", "DEBUG", "DELAY", "DELTA", "DENSE", "DEPTH", "DERBY", "DIARY", "DIGIT", "DIRTY",
  "DISCO", "DITCH", "DIVID", "DOGMA", "DOUBT", "DOZEN", "DRAFT", "DRAIN", "DRAMA", "DREAD",
  "DREAM", "DRESS", "DRIFT", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY",
  "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR",
  "ESSAY", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FAVOR",
  "FEAST", "FIELD", "FIFTY", "FIGHT", "FINAL", "FIRST", "FLAME", "FLASH", "FLEET", "FLIGHT",
  "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK",
  "FRAUD", "FRESH", "FRONT", "FROST", "FRUIT", "FUNNY", "GHOST", "GIANT", "GIVEN", "GLASS",
  "GLOVE", "GLYPH", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRAPH", "GRASP", "GRASS",
  "GREAT", "GREEN", "GREET", "GRIEF", "GRIND", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS",
  "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH", "HEART", "HEAVY", "HELLO", "HENCE", "HONOR",
  "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "IRONIC",
  "ISSUE", "ITSELF", "JACKS", "JOINT", "JUDGE", "JUICE", "KNIFE", "KNOCK", "LABEL", "LABOR",
  "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL",
  "LEVEL", "LIGHT", "LIMIT", "LINUX", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH",
  "LYRIC", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARRY", "MATCH", "MAYBE", "MAYOR", "MEDIA",
  "METAL", "METER", "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MODEM", "MOIST", "MONEY",
  "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIVE", "NAKED",
  "NIGHT", "NOBLE", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCEAN", "OFFER", "OFTEN",
  "ORDER", "OTHER", "OUGHT", "OUTER", "OWNER", "PANEL", "PAPER", "PARTY", "PEACE", "PHASE",
  "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT", "PITCH", "PIXEL", "PLACE", "PLAIN", "PLANE",
  "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT",
  "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "PROXY", "PULSE", "PUNCH", "QUERY", "QUEST",
  "QUEUE", "QUICK", "QUIET", "QUITE", "QUOTE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO",
  "REACH", "REACT", "READY", "REALM", "REBEL", "REFER", "RELAX", "REPLY", "RESET", "RESIN",
  "RETRO", "RIDER", "RIGHT", "RIVAL", "RIVER", "ROBOT", "ROCKY", "ROUGH", "ROUND", "ROUTE",
  "ROYAL", "RURAL", "SALAD", "SALES", "SAUCE", "SCALE", "SCENE", "SCOPE", "SCORE", "SCRAP",
  "SENSE", "SERVE", "SETUP", "SEVEN", "SHADE", "SHAFT", "SHAKE", "SHALL", "SHAME", "SHAPE",
  "SHARE", "SHARP", "SHEEP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK",
  "SHOOT", "SHORT", "SHOUT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SKILL", "SLEEP", "SLIDE",
  "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH",
  "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPERM", "SPICE", "SPIKE", "SPINE", "SPIRIT",
  "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAIR", "STAKE", "STAND", "STARE", "START",
  "STATE", "STEAK", "STEAL", "STEAM", "STEEL", "STEEP", "STEER", "STICK", "STIFF", "STILL",
  "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF",
  "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "SWIFT", "SWING", "TABLE", "TAKEN", "TALLY",
  "TASTE", "TAXES", "TEACH", "TEETH", "TERMS", "THANK", "THEFT", "THEIR", "THEME", "THERE",
  "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT",
  "TIMES", "TIRED", "TITLE", "TODAY", "TOKEN", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER",
  "TRACK", "TRADE", "TRAIL", "TRAIN", "TREAD", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK",
  "TRIED", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNCLE", "UNDER", "UNION", "UNITE",
  "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO",
  "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH",
  "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST",
  "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "YOUTH", "ZEBRA"
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const START_DATE = new Date('2024-01-01').getTime(); // Reference point for game numbers

// --- CSS FOR ANIMATIONS ---
const styles = `
  @keyframes pop {
    0% { transform: scale(0.8); opacity: 0; }
    40% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  @keyframes flipIn {
    0% { transform: rotateX(-90deg); opacity: 0; }
    100% { transform: rotateX(0); opacity: 1; }
  }
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-30px); }
    60% { transform: translateY(-15px); }
  }
  .animate-pop { animation: pop 0.15s ease-in-out; }
  .animate-shake { animation: shake 0.5s; }
  .animate-bounce-win { animation: bounce 1s ease infinite; }
  .tile-flip-enter { animation: flipIn 0.3s ease-in forwards; }
`;

export default function App() {
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); 
  const [toast, setToast] = useState(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [gameMode, setGameMode] = useState('daily'); // 'daily' or 'random'
  const [gameNumber, setGameNumber] = useState(0);

  const getDailyWord = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diff = today - START_DATE;
    const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Deterministic selection based on dayIndex
    const wordIndex = dayIndex % WORD_LIST.length;
    return { word: WORD_LIST[wordIndex], number: dayIndex };
  }, []);

  const startNewGame = useCallback((mode = gameMode) => {
    if (mode === 'daily') {
      const { word, number } = getDailyWord();
      setSolution(word);
      setGameNumber(number);
    } else {
      const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
      setSolution(randomWord);
      setGameNumber(Math.floor(Math.random() * 10000));
    }
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setToast(null);
  }, [gameMode, getDailyWord]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const showToast = (message, duration = 2000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  const evaluateGuess = (guess, sol) => {
    const result = Array(WORD_LENGTH).fill('absent');
    const solChars = sol.split('');
    const guessChars = guess.split('');

    guessChars.forEach((char, i) => {
      if (char === solChars[i]) {
        result[i] = 'correct';
        solChars[i] = null;
      }
    });

    guessChars.forEach((char, i) => {
      if (result[i] !== 'correct' && solChars.includes(char)) {
        result[i] = 'present';
        solChars[solChars.indexOf(char)] = null;
      }
    });

    return result;
  };

  const shareResult = useCallback(() => {
    const grid = guesses.map(guess => {
      const evalResult = evaluateGuess(guess, solution);
      return evalResult.map(status => {
        if (status === 'correct') return '🟩';
        if (status === 'present') return '🟨';
        return '⬛';
      }).join('');
    }).join('\n');

    const score = gameStatus === 'won' ? guesses.length : 'X';
    const modeLabel = gameMode === 'daily' ? `Daily #${gameNumber}` : 'Random';
    const shareText = `Sri's Wordle ${modeLabel} ${score}/${MAX_GUESSES}\n\n${grid}`;

    const textArea = document.createElement("textarea");
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("Copied results to clipboard!");
    } catch (err) {
      showToast("Failed to copy");
    }
    document.body.removeChild(textArea);
  }, [guesses, solution, gameStatus, gameMode, gameNumber]);

  const onKeyPress = useCallback((key) => {
    if (gameStatus !== 'playing') return;

    if (key === 'BACKSPACE' || key === '⌫') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        showToast("Not enough letters");
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      
      if (currentGuess === solution) {
        setGameStatus('won');
        setTimeout(() => showToast("Magnificent!", 5000), 1500);
      } else if (newGuesses.length === MAX_GUESSES) {
        setGameStatus('lost');
        setTimeout(() => showToast(`The word was ${solution}`, 5000), 1500);
      }
      
      setCurrentGuess('');
      return;
    }

    if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [currentGuess, gameStatus, guesses, solution]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') onKeyPress('ENTER');
      else if (e.key === 'Backspace') onKeyPress('BACKSPACE');
      else {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key) && key.length === 1) onKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const getKeyboardColors = () => {
    const colors = {};
    guesses.forEach(guess => {
      const evaluation = evaluateGuess(guess, solution);
      guess.split('').forEach((char, i) => {
        const status = evaluation[i];
        if (!colors[char] || (colors[char] === 'absent' && status !== 'absent') || (colors[char] === 'present' && status === 'correct')) {
          colors[char] = status;
        }
      });
    });
    return colors;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-between font-sans selection:bg-transparent">
      <style>{styles}</style>
      
      <header className="w-full flex flex-col items-center py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold tracking-widest uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Sri's Wordle
        </h1>
        <div className="flex bg-gray-800 rounded-lg p-1 text-xs font-bold uppercase">
          <button 
            onClick={() => { setGameMode('daily'); startNewGame('daily'); }}
            className={`px-4 py-1.5 rounded-md transition-all ${gameMode === 'daily' ? 'bg-gray-700 text-emerald-400 shadow-sm' : 'text-gray-400'}`}
          >
            Daily #{gameNumber}
          </button>
          <button 
            onClick={() => { setGameMode('random'); startNewGame('random'); }}
            className={`px-4 py-1.5 rounded-md transition-all ${gameMode === 'random' ? 'bg-gray-700 text-cyan-400 shadow-sm' : 'text-gray-400'}`}
          >
            Random
          </button>
        </div>
      </header>

      <div className="relative w-full max-w-md flex justify-center z-50">
        {toast && (
          <div className="absolute top-4 bg-white text-black px-4 py-2 rounded-lg shadow-2xl font-bold animate-pop">
            {toast}
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-center items-center w-full px-4 my-4">
        <div className="grid grid-rows-6 gap-2">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => {
            if (i < guesses.length) return <CompletedRow key={i} guess={guesses[i]} solution={solution} isWinning={gameStatus === 'won' && i === guesses.length - 1} />;
            if (i === guesses.length) return <CurrentRow key={i} guess={currentGuess} shake={shakeRow} />;
            return <EmptyRow key={i} />;
          })}
        </div>
      </div>

      {gameStatus !== 'playing' && (
        <div className="mb-6 flex flex-col items-center animate-pop px-4">
          <div className="flex gap-4">
            <button onClick={shareResult} className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
              Share Score
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
            <button onClick={() => startNewGame()} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
              {gameMode === 'daily' ? 'Try Again (Random)' : 'Next Word'}
            </button>
          </div>
        </div>
      )}

      <Keyboard onKeyPress={onKeyPress} colors={getKeyboardColors()} disabled={gameStatus !== 'playing'} />
    </div>
  );
}

// Row Components (Optimized for reuse)
function CompletedRow({ guess, solution, isWinning }) {
  const evaluate = (g, s) => {
    const res = Array(5).fill('absent');
    const sArr = s.split(''), gArr = g.split('');
    gArr.forEach((c, i) => { if (c === sArr[i]) { res[i] = 'correct'; sArr[i] = null; } });
    gArr.forEach((c, i) => { if (res[i] !== 'correct' && sArr.includes(c)) { res[i] = 'present'; sArr[sArr.indexOf(c)] = null; } });
    return res;
  };
  const result = evaluate(guess, solution);
  return (
    <div className={`grid grid-cols-5 gap-2 ${isWinning ? 'animate-bounce-win' : ''}`}>
      {guess.split('').map((char, i) => (
        <div key={i} className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl font-bold rounded-md uppercase text-white tile-flip-enter ${result[i] === 'correct' ? 'bg-emerald-500' : result[i] === 'present' ? 'bg-yellow-500' : 'bg-gray-700'}`} style={{ animationDelay: `${i * 0.1}s` }}>{char}</div>
      ))}
    </div>
  );
}

function CurrentRow({ guess, shake }) {
  return (
    <div className={`grid grid-cols-5 gap-2 ${shake ? 'animate-shake' : ''}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const char = guess[i];
        return <div key={i} className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl font-bold rounded-md uppercase border-2 ${char ? 'border-gray-400 animate-pop bg-gray-800' : 'border-gray-700 bg-gray-900'}`}>{char || ''}</div>;
      })}
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-14 h-14 sm:w-16 sm:h-16 rounded-md border-2 border-gray-700 bg-gray-900"></div>)}
    </div>
  );
}

function Keyboard({ onKeyPress, colors, disabled }) {
  const rows = [['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'], ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'], ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']];
  return (
    <div className="w-full max-w-lg px-2 pb-6">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center mb-2 space-x-1">
          {row.map(key => {
            const status = colors[key];
            const bg = status === 'correct' ? 'bg-emerald-500' : status === 'present' ? 'bg-yellow-500' : status === 'absent' ? 'bg-gray-800 opacity-40' : 'bg-gray-600';
            return (
              <button key={key} onClick={() => onKeyPress(key === '⌫' ? 'BACKSPACE' : key)} disabled={disabled} className={`${key.length > 1 ? 'px-2 text-xs' : 'flex-1'} h-14 rounded font-bold uppercase transition-all active:scale-90 ${bg} ${disabled ? 'cursor-not-allowed' : ''}`}>
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}