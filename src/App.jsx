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

// Expanded Solution & Validation List
const SOLUTION_WORDS = [
  "ABOUT", "ABOVE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "AISLE", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "AWFUL", "BADGE", "BAKER", "BASIC", "BASIS", "BEACH", "BEARD", "BEAST", "BEGIN", "BEING", "BELOW", "BENCH", "BIRTH", "BLACK", "BLADE", "BLAME", "BLAST", "BLEND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CAMEL", "CANAL", "CANDY", "CANOE", "CARDS", "CARRY", "CARVE", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOIR", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "COUCH", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAWL", "CRAZY", "CREAM", "CREEK", "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CRUEL", "CRUSH", "CURVE", "CYCLE", "DAILY", "DANCE", "DEALT", "DEATH", "DEBUG", "DELAY", "DELTA", "DENSE", "DEPTH", "DERBY", "DIARY", "DIGIT", "DIRTY", "DISCO", "DITCH", "DOUBT", "DOZEN", "DRAFT", "DRAIN", "DRAMA", "DREAD", "DREAM", "DRESS", "DRIFT", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "ESSAY", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FAVOR", "FEAST", "FIELD", "FIFTY", "FIGHT", "FINAL", "FIRST", "FLAME", "FLASH", "FLEET", "FLIGHT", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FROST", "FRUIT", "FUNNY", "GHOST", "GIANT", "GIVEN", "GLASS", "GLOVE", "GLYPH", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRAPH", "GRASP", "GRASS", "GREAT", "GREEN", "GREET", "GRIEF", "GRIND", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH", "HEART", "HEAVY", "HELLO", "HENCE", "HONOR", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "ITALY", "ITEMS", "ITSELF", "JACKS", "JOINT", "JUDGE", "JUICE", "KNACK", "KNIFE", "KNOCK", "LABEL", "LABOR", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYRIC", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARRY", "MATCH", "MAYBE", "MAYOR", "MEDIA", "METAL", "METER", "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MODEM", "MOIST", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIVE", "NAKED", "NIGHT", "NOBLE", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "OUTER", "OWNER", "PANEL", "PAPER", "PARTY", "PEACE", "PHASE", "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT", "PITCH", "PIXEL", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "PROXY", "PULSE", "PUNCH", "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUITE", "QUOTE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", "REALM", "REBEL", "REFER", "RELAX", "REPLY", "RESET", "RESIN", "RETRO", "RIDER", "RIGHT", "RIVAL", "RIVER", "ROBOT", "ROCKY", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SALAD", "SALES", "SAUCE", "SCALE", "SCENE", "SCOPE", "SCORE", "SCRAP", "SENSE", "SERVE", "SETUP", "SEVEN", "SHADE", "SHAFT", "SHAKE", "SHALL", "SHAME", "SHAPE", "SHARE", "SHARP", "SHEEP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOUT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPICE", "SPIKE", "SPINE", "SPIRIT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAIR", "STAKE", "STAND", "STARE", "START", "STATE", "STEAK", "STEAL", "STEAM", "STEEL", "STEEP", "STEER", "STICK", "STIFF", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "SWIFT", "SWING", "TABLE", "TAKEN", "TALLY", "TASTE", "TAXES", "TEACH", "TEETH", "TERMS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOKEN", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIL", "TRAIN", "TREAD", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNCLE", "UNDER", "UNION", "UNITE", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "YOUTH", "ZEBRA"
];

// Add thousands of common 5-letter words to the allowed guessing list
const ALLOWED_GUESSES = new Set([
    ...SOLUTION_WORDS,
    "AAHED", "AALII", "AARGH", "ABACA", "ABACI", "ABACK", "ABAFT", "ABAKA", "ABAMP", "ABAND", "ABASE", "ABASH", "ABASK", "ABATE", "ABAVE", "ABBAS", "ABBEI", "ABBEY", "ABBOT", "ABCEE", "ABEAR", "ABELE", "ABETS", "ABHOR", "ABIDE", "ABIES", "ABLED", "ABLER", "ABLES", "ABLET", "ABLOW", "ABMHO", "ABODE", "ABOHM", "ABOIL", "ABOMA", "ABOON", "ABORD", "ABORE", "ABORT", "ABOUT", "ABOVE", "ABRAM", "ABRAY", "ABRIM", "ABRIN", "ABRIS", "ABSEY", "ABSIT", "ABUNA", "ABUNE", "ABUSE", "ABUTS", "ABUZZ", "ABYEE", "ABYSM", "ABYSS", "ACARI", "ACCAS", "ACCOY", "ACERB", "ACERS", "ACETA", "ACHAR", "ACHED", "ACHES", "ACHOO", "ACIDS", "ACIDY", "ACING", "ACINI", "ACKEE", "ACKER", "ACMES", "ACMIC", "ACNED", "ACNES", "ACOCK", "ACOLD", "ACORN", "ACRED", "ACRES", "ACRID", "ACROS", "ACTED", "ACTIN", "ACTON", "ACTOR", "ACUTE", "ACYLS", "ADAGE", "ADAPT", "ADAYS", "ADBOT", "ADDAM", "ADDAS", "ADDED", "ADDER", "ADDIE", "ADDIO", "ADDLE", "ADEEM", "ADEPT", "ADIEU", "ADIOS", "ADITS", "ADMAN", "ADMEN", "ADMIN", "ADMIX", "ADOBO", "ADORE", "ADORN", "ADOWN", "ADOZE", "ADULT", "ADUST", "ADVEW", "ADYTA", "ADZEZ", "AECIA", "AEDES", "AEGIR", "AENEI", "AEONS", "AERIE", "AEROS", "AESIR", "AFALD", "AFARA", "AFARL", "AFEER", "AFFIX", "AFIRE", "AFLAJ", "AFOOT", "AFORE", "AFOUL", "AFRIT", "AFROS", "AFTER", "AGAIN", "AGAMA", "AGAMI", "AGAPE", "AGARS", "AGAST", "AGATE", "AGAVE", "AGAZE", "AGENE", "AGENT", "AGERS", "AGGER", "AGGIE", "AGGRI", "AGGRO", "AGGYS", "AGHAS", "AGILA", "AGILE", "AGING", "AGIOS", "AGISM", "AGIST", "AGITA", "AGLEE", "AGLET", "AGLEY", "AGLOO", "AGLOW", "AGLUS", "AGMAS", "AGOGE", "AGONE", "AGONS", "AGONY", "AGOOD", "AGORA", "AGREE", "AGRIA", "AGRIN", "AGROS", "AGUED", "AGUES", "AGUNA", "AGUTI", "AHEAD", "AHELP", "AHELL", "AHIGH", "AHIND", "AHING", "AHINT", "AHOLD", "AHULL", "AHURU", "AIDAS", "AIDED", "AIDER", "AIDES", "AIDOI", "AIDOS", "AIERY", "AIGAS", "AIGHT", "AILED", "AIMED", "AIMER", "AINEE", "AINES", "AIONT", "AIOLI", "AIRED", "AIRER", "AIRNS", "AIRTH", "AIRTS", "AISLE", "AITCH", "AITUS", "AIVER", "AIYEE", "AIZLE", "AJIES", "AJIVA", "AJUGA", "AJWAN", "AKELA", "AKENE", "AKINS", "AKITA", "AKKAS", "AKOLA", "AKOND", "ALACK", "ALAND", "ALANE", "ALANG", "ALANS", "ALANT", "ALAPA", "ALAPS", "ALARM", "ALARY", "ALATE", "ALAYS", "ALBEE", "ALBUM", "ALCAD", "ALCAE", "ALCHI", "ALCID", "ALCOR", "ALDER", "ALDER", "ALDOL", "ALECK", "ALECS", "ALEEF", "ALEFT", "ALEPH", "ALERT", "ALews", "ALEYE", "ALFAS", "ALGAE", "ALGAL", "ALGAS", "ALGID", "ALGIN", "ALGOR", "ALGOS", "ALGUM", "ALIAS", "ALIBI", "ALICK", "ALIEN", "ALIFS", "ALIGN", "ALIKE", "ALINE", "ALIST", "ALIVE", "ALKIY", "ALKOZ", "ALKYD", "ALKYL", "ALLAY", "ALLEE", "ALLEG", "ALLEL", "ALLEY", "ALLIS", "ALLOD", "ALLOT", "ALLOW", "ALLOY", "ALLSY", "ALLYL", "ALMAH", "ALMAS", "ALMEH", "ALMES", "ALMUD", "ALMUG", "ALODS", "ALOED", "ALOES", "ALOFT", "ALOHA", "ALOIN", "ALONE", "ALONG", "ALOOF", "ALOOS", "ALOUD", "ALOWE", "ALPHA", "ALTAR", "ALTER", "ALTHO", "ALTOS", "ALULA", "ALUMI", "ALUMS", "ALURE", "ALVAR", "ALWAY", "AMAHs", "AMAIN", "AMARI", "AMARO", "AMASS", "AMATE", "AMAUT", "AMAZE", "AMBAN", "AMBER", "AMBIT", "AMBLE", "AMBOs", "AMBsh", "AMENE", "AMEND", "AMENE", "AMENS", "AMENT", "AMIDE", "AMIDO", "AMIDS", "AMIES", "AMIGA", "AMIGO", "AMINE", "AMINO", "AMINS", "AMIRS", "AMISS", "AMITY", "AMLAS", "AMMAN", "AMMON", "AMMOs", "AMNIA", "AMNIC", "AMNIO", "AMOKS", "AMOLE", "AMONG", "AMORT", "AMOUR", "AMOWT", "AMPED", "AMPLE", "AMPLY", "AMPUL", "AMRIT", "AMUCK", "AMUSE", "AMYLS", "ANANA", "ANATA", "ANCHO", "ANCON", "ANDRO", "ANEAR", "ANELE", "ANENT", "ANGAS", "ANGEL", "ANGER", "ANGLE", "ANGLO", "ANGRY", "ANGST", "ANILE", "ANILS", "ANIMA", "ANIME", "ANIMI", "ANION", "ANISE", "ANKER", "ANKLE", "ANKUS", "ANLAS", "ANNAL", "ANNAS", "ANNAT", "ANNEX", "ANNIE", "ANNOY", "ANNUL", "ANOAS", "ANODE", "ANOLE", "ANOMY", "ANSAE", "ANTAE", "ANTAR", "ANTAS", "ANTED", "ANTES", "ANTIC", "ANTIS", "ANTRA", "ANTRE", "ANTSY", "ANURA", "ANVIL", "ANYON", "AORTA", "APACE", "APART", "APEAK", "APEEL", "APERY", "APHID", "APHIS", "APIAN", "APING", "APISH", "APISM", "APNEA", "APORT", "APPAL", "APPAY", "APPEL", "APPLE", "APPLY", "APPRO", "APPUI", "APPUY", "APRON", "APSES", "APSIS", "APSOO", "APTED", "APTER", "APTLY", "AQUAE", "AQUAS", "ARABA", "ARAKS", "ARAME", "ARARS", "ARBAS", "ARBOR", "ARCED", "ARCHI", "ARCOS", "ARCUS", "ARDEB", "ARDOR", "ARDRI", "AREAD", "AREAE", "AREAL", "AREAR", "AREAS", "ARECA", "AREDD", "AREDE", "AREFY", "AREIC", "ARENA", "ARENE", "AREPA", "ARERE", "ARETS", "ARETT", "AREWG", "ARGAL", "ARGAN", "ARGIL", "ARGLE", "ARGOL", "ARGON", "ARGOT", "ARGUE", "ARGUS", "ARHAT", "ARIAS", "ARIEL", "ARIKI", "ARILS", "ARIOT", "ARISE", "ARISH", "ARKED", "ARLED", "ARLES", "ARMED", "ARMER", "ARMET", "ARMIL", "ARMOR", "ARNAS", "ARNOT", "AROHA", "AROID", "AROMA", "AROSE", "ARPAS", "ARPEN", "ARRAH", "ARRAY", "ARRET", "ARRIS", "ARROW", "ARROZ", "ARSES", "ARSEY", "ARSIS", "ARTAL", "ARTEL", "ARTIC", "ARTIS", "ARTSY", "ARUHE", "ARUMS", "ARVAL", "ARVEE", "ARVOS", "ARYLS", "ASANA", "ASCON", "ASCOT", "ASCUS", "ASDIC", "ASHED", "ASHEN", "ASHES", "ASHET", "ASHIP", "ASHLA", "ASHLY", "ASHOT", "ASHOW", "ASIDE", "ASKED", "ASKER", "ASKEW", "ASKoi", "ASKOS", "ASPER", "ASPIC", "ASPIS", "ASPRO", "ASSAI", "ASSAM", "ASSAY", "ASSES", "ASSET", "ASSEZ", "ASSOT", "ASTER", "ASTIR", "ASTUN", "ASURA", "ASWAY", "ASWIM", "ASYLS", "ATAPS", "ATAXY", "ATIGI", "ATILT", "ATIMY", "ATLAS", "ATMAN", "ATMAS", "ATMOS", "ATOLL", "ATOMS", "ATOMY", "ATONE", "ATONY", "ATOPY", "ATRIA", "ATRIP", "ATTAP", "ATTAR", "ATTIC", "ATTAR", "AUDAD", "AUDIO", "AUDIT", "AUGER", "AUGHT", "AUGUR", "AULAS", "AULIC", "AULOI", "AULOS", "AUMIL", "AUNES", "AUNTS", "AUNTY", "AURAe", "AURAL", "AURAR", "AURAS", "AUREI", "AURES", "AURIC", "AURis", "AUROR", "AURUM", "AUSUB", "AUTAS", "AUTOs", "AUXIN", "AVAIL", "AVANT", "AVAST", "AVELS", "AVENT", "AVERN", "AVERS", "AVERT", "AVGAS", "AVIAN", "AVINE", "AVION", "AVISE", "AVISO", "AVIZE", "AVOID", "AVOWS", "AVYZE", "AWAIT", "AWAKE", "AWARD", "AWARE", "AWATO", "AWAVE", "AWAYS", "AWDLS", "AWEEL", "AWEEW", "AWEFT", "AWETO", "AWFUL", "AWING", "AWNED", "AWNER", "AWOKE", "AWOLS", "AWORK", "AXELS", "AXIAL", "AXILE", "AXILS", "AXING", "AXIOM", "AXION", "AXITE", "AXLED", "AXLES", "AXMAN", "AXMEN", "AXOID", "AXONE", "AXONS", "AXSON", "AXUNG", "AYAHs", "AYAYE", "AYELP", "AYINS", "AYONT", "AYRIE", "AYUUs", "AZANS", "AZIDE", "AZIDO", "AZINE", "AZLON", "AZOIC", "AZOLE", "AZONS", "AZOTE", "AZOTH", "AZURE", "AZURY", "AZYGY", "AZYME", "AZYMS",
    "BACON", "BADGE", "BAGEL", "BAKER", "BALMY", "BANJO", "BARGE", "BASIC", "BASIN", "BATCH", "BATHE", "BEACH", "BEAMY", "BEARD", "BEAST", "BEAUT", "BEECH", "BEEFY", "BEGAN", "BEGAT", "BEGIN", "BEGUN", "BEIGE", "BEING", "BELAY", "BELCH", "BELIE", "BELLE", "BELLY", "BELOW", "BENCH", "BENDY", "BERRY", "BERTH", "BESET", "BETEL", "BEVEL", "BEZEL", "BIBLE", "BICEP", "BIDDY", "BIDEZ", "BIGHT", "BIGOT", "BILEZ", "BILLY", "BINGE", "BINGO", "BIOME", "BIRCH", "BIRTH", "BISON", "BITTY", "BLACK", "BLADE", "BLAME", "BLAND", "BLANK", "BLARE", "BLAST", "BLAZE", "BLEAK", "BLEAT", "BLEED", "BLEEP", "BLEND", "BLESS", "BLIMP", "BLIND", "BLINK", "BLISS", "BLITZ", "BLOAT", "BLOCK", "BLOKE", "BLOND", "BLOOD", "BLOOM", "BLOWN", "BLUER", "BLUFF", "BLUNT", "BLURB", "BLURT", "BLUSH", "BOARD", "BOAST", "BOBBY", "BONEY", "BONGO", "BONUS", "BOOBY", "BOOST", "BOOTH", "BOOTY", "BOOZE", "BOOZY", "BORAX", "BORNE", "BOSOM", "BOSSY", "BOTCH", "BOUGH", "BOULE", "BOUND", "BOWEL", "BOXER", "BRACE", "BRAID", "BRAIN", "BRAKE", "BRAND", "BRASH", "BRASS", "BRAVE", "BRAVO", "BRAWL", "BRAWN", "BREAD", "BREAK", "BREAM", "BREED", "BRIAR", "BRIBE", "BRICK", "BRIDE", "BRIEF", "BRINE", "BRING", "BRINK", "BRINY", "BRISK", "BROAD", "BROIL", "BROKE", "BROOD", "BROOK", "BROOM", "BROTH", "BROWN", "BROWZ", "BRUIN", "BRUNT", "BRUSH", "BRUTE", "BUDDY", "BUDGE", "BUGGY", "BUGLE", "BUILD", "BUILT", "BULGE", "BULKY", "BULLY", "BUNCH", "BUNNY", "BURLY", "BURNT", "BURRO", "BURST", "BUSEY", "BUSHY", "BUSTER", "BUTCH", "BUTTE", "BUTTY", "BUYER", "BYSIN",
    "CABAL", "CABBY", "CABIN", "CABLE", "CACAO", "CACHE", "CACTI", "CADDY", "CADET", "CAGEY", "CAIRN", "CAKEZ", "CAKEy", "CALIF", "CALVE", "CAMEL", "CAMEO", "CANAL", "CANDY", "CANNY", "CANOE", "CANON", "CAPER", "CAPUT", "CARAT", "CARGO", "CAROL", "CARRY", "CARVE", "CASTE", "CATCH", "CATER", "CATTY", "CAUSE", "CAVEZ", "CAVITY", "CEASE", "CEDAR", "CELEB", "CELLO", "CHAFE", "CHAFF", "CHAIN", "CHAIR", "CHALK", "CHAMP", "CHANT", "CHAOS", "CHARD", "CHARM", "CHART", "CHASE", "CHASM", "CHEAP", "CHEAT", "CHECK", "CHEEK", "CHEER", "CHESS", "CHEST", "CHEWz", "CHEWY", "CHICK", "CHIDE", "CHIEF", "CHILD", "CHILL", "CHIME", "CHINA", "CHIRP", "CHOCK", "CHOIR", "CHOKE", "CHORD", "CHORE", "CHOSE", "CHUCK", "CHUMP", "CHUNK", "CHURN", "CHUTE", "CIDER", "CIGAR", "CINCH", "CIRCA", "CIVIC", "CIVIL", "CLACK", "CLAIM", "CLAMP", "CLANG", "CLANK", "CLASH", "CLASP", "CLASS", "CLEAN", "CLEAR", "CLEAT", "CLEFT", "CLERK", "CLICK", "CLIFF", "CLIMB", "CLING", "CLINK", "CLOAK", "CLOCK", "CLONE", "CLOSE", "CLOTH", "CLOUD", "CLOUT", "CLOVE", "CLOWN", "CLUCK", "CLUED", "CLUMP", "CLUNG", "COACH", "COAST", "COBRA", "COCOA", "COLON", "COLOR", "COMET", "COMFY", "COMIC", "COMMA", "CONCH", "CONDO", "CONEY", "CONGA", "CONIC", "CONOE", "CORAL", "CORNY", "CORPS", "COULd", "COUNT", "COUPE", "COURT", "COUSIN", "COVEN", "COVER", "COVET", "COVEY", "COWER", "COYLY", "CRACK", "CRAFT", "CRAMP", "CRANE", "CRANK", "CRASH", "CRASS", "CRATE", "CRAVE", "CRAWL", "CRAZE", "CRAZY", "CREAK", "CREAM", "CREDO", "CREED", "CREEK", "CREEP", "CREME", "CREPE", "CREPT", "CRESS", "CREST", "CRICK", "CRIED", "CRIER", "CRIME", "CRIMP", "CRISP", "CROAK", "CROCK", "CRONE", "CRONY", "CROOK", "CROSS", "CROUP", "CROWD", "CROWN", "CRUDE", "CRUEL", "CRUISE", "CRUMP", "CRUSH", "CRUST", "CRYPT", "CUBIC", "CULLY", "CUMIN", "CURRY", "CURSE", "CURVE", "CURVY", "CUTIE", "CYBER", "CYCLE", "CYNIC",
]);

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

  useEffect(() => {
    if (gameMode === 'daily') {
      const { word, number } = getDailyInfo();
      setSolution(word);
      setGameNumber(number);
    } else if (!solution) {
      const randomWord = SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)];
      setSolution(randomWord);
    }
  }, [gameMode, getDailyInfo, solution]);

  useEffect(() => {
    if (!user) return;
    const gameId = gameMode === 'daily' ? `daily-${gameNumber}` : 'practice-mode';
    const gameRef = doc(db, 'artifacts', appId, 'users', user.uid, 'games', gameId);
    const statsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'stats');

    const unsubGame = onSnapshot(gameRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (gameMode === 'daily' || data.solution === solution) {
          setGuesses(data.guesses || []);
          setGameStatus(data.status || 'playing');
          if (data.solution) setSolution(data.solution);
        }
      } else if (gameMode === 'daily') {
        setGuesses([]);
        setGameStatus('playing');
      }
    }, (err) => console.error(err));

    const unsubStats = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) setStats(snap.data());
    }, (err) => console.error(err));

    return () => { unsubGame(); unsubStats(); };
  }, [user, gameMode, gameNumber, solution]);

  const saveStats = async (won, numGuesses) => {
    if (!user || gameMode !== 'daily') return;
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
    const gameId = gameMode === 'daily' ? `daily-${gameNumber}` : 'practice-mode';
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'games', gameId), {
      guesses: newGuesses, status: newStatus, solution: sol, mode: gameMode
    });
  };

  const startPractice = () => {
    const randomWord = SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)];
    setGuesses([]);
    setGameStatus('playing');
    setSolution(randomWord);
    setGameMode('practice');
    setCurrentGuess('');
    if (user) {
        setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'games', 'practice-mode'), {
            guesses: [], status: 'playing', solution: randomWord, mode: 'practice'
        });
    }
  };

  const getLetterStatus = (guess, sol) => {
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
      
      // dictionary check
      if (!ALLOWED_GUESSES.has(currentGuess)) {
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
        return showToast("Not in word list");
      }

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
        <div className="text-center">
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">*SL* Wordle</h1>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                {gameMode === 'daily' ? `Daily #${gameNumber}` : 'Practice Mode'}
            </span>
        </div>
        <BarChart2 className="w-6 h-6 cursor-pointer" onClick={() => setShowStats(true)} />
      </header>

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

      {gameStatus !== 'playing' && (
          <div className="flex gap-2 mb-4">
              <button onClick={startPractice} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full flex items-center gap-2 font-bold transition-all text-sm">
                  <RotateCcw className="w-4 h-4" /> New Game
              </button>
          </div>
      )}

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

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-xl p-6 relative">
            <X className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowSettings(false)} />
            <h2 className="text-xl font-bold mb-6 uppercase tracking-wider">Settings</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">Hard Mode</div>
                  <div className="text-xs text-gray-400">Reveal clues must be used in guesses</div>
                </div>
                <button onClick={() => setIsHardMode(!isHardMode)} className={`w-12 h-6 rounded-full transition-colors relative ${isHardMode ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHardMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">High Contrast Mode</div>
                  <div className="text-xs text-gray-400">Better color visibility</div>
                </div>
                <button onClick={() => setIsHighContrast(!isHighContrast)} className={`w-12 h-6 rounded-full transition-colors relative ${isHighContrast ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHighContrast ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="pt-4 border-t border-gray-800">
                  <button onClick={() => { setGameMode(gameMode === 'daily' ? 'practice' : 'daily'); setShowSettings(false); }} className="w-full bg-gray-800 py-3 rounded font-bold hover:bg-gray-700 transition-colors uppercase text-xs tracking-widest">
                      Switch to {gameMode === 'daily' ? 'Practice' : 'Daily'} Mode
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-xl p-8 relative flex flex-col items-center">
            <X className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowStats(false)} />
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Statistics (Daily)</h2>
            <div className="grid grid-cols-4 w-full mb-8 text-center gap-2">
              <div><div className="text-2xl font-bold">{stats.gamesPlayed}</div><div className="text-[8px] uppercase">Played</div></div>
              <div><div className="text-2xl font-bold">{Math.round((stats.gamesWon / (stats.gamesPlayed || 1)) * 100)}</div><div className="text-[8px] uppercase">Win %</div></div>
              <div><div className="text-2xl font-bold">{stats.currentStreak}</div><div className="text-[8px] uppercase">Streak</div></div>
              <div><div className="text-2xl font-bold">{stats.maxStreak}</div><div className="text-[8px] uppercase">Max</div></div>
            </div>
            
            {gameStatus !== 'playing' && (
              <div className="flex flex-col gap-3 w-full border-t border-gray-800 pt-6">
                {gameStatus === 'lost' && <div className="text-center font-bold text-red-400 mb-2 uppercase tracking-tighter">Word: {solution}</div>}
                <div className="flex gap-4 w-full">
                    <button onClick={() => {
                        const grid = guesses.map(g => getLetterStatus(g, solution).map(s => s === 'correct' ? '🟩' : (s === 'present' ? '🟨' : '⬛')).join('')).join('\n');
                        const text = `*SL* Wordle ${gameMode === 'daily' ? gameNumber : 'Practice'} ${gameStatus === 'won' ? guesses.length : 'X'}/6\n\n${grid}`;
                        navigator.clipboard.writeText(text).then(() => showToast("Copied!"));
                    }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded flex items-center justify-center gap-2 font-bold py-3 transition-colors uppercase text-sm">
                    Share <Share2 className="w-4 h-4" />
                    </button>
                    <button onClick={startPractice} className="flex-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center gap-2 font-bold py-3 transition-colors uppercase text-sm">
                    Next <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
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