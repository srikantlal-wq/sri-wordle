import React, { useState, useEffect, useCallback } from 'react';

const WORDS: string[] = ["APPLE", "BEACH", "BRAIN", "BREAD", "BRUSH", "CHAIR", "CHEST", "CHORD", "CLICK", "CLOCK", "CLOUD", "DANCE", "DIARY", "DRINK", "DRIVE", "EARTH", "FEAST", "FIELD", "FRUIT", "GLASS", "GRAPE", "GREEN", "GHOST", "HEART", "HOUSE", "JUICE", "LIGHT", "LEMON", "MELON", "MONEY", "MUSIC", "NIGHT", "OCEAN", "PARTY", "PIANO", "PILOT", "PLANE", "PHONE", "PLANT", "PRIDE", "RIVER", "ROBOT", "SHIRT", "SHOES", "SMILE", "SNAKE", "SPACE", "SPOON", "STORM", "TABLE", "TIGER", "TOAST", "TOUCH", "TRAIN", "TRUCK", "VOICE", "WATER", "WATCH", "WHALE", "WORLD", "WRITE", "YOUTH", "ZEBRA"];

export default function App() {
  const [solution, setSolution] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setSolution(randomWord.toUpperCase());
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;

    if (e.key === 'Enter') {
      if (currentGuess.length !== 5) {
        setMessage('Too short');
        setTimeout(() => setMessage(''), 2000);
        return;
      }

      const newGuesses = [...guesses];
      const nextEmptyIndex = newGuesses.findIndex(g => g === '');
      if (nextEmptyIndex !== -1) {
        newGuesses[nextEmptyIndex] = currentGuess.toUpperCase();
        setGuesses(newGuesses);
        setCurrentGuess('');

        if (currentGuess.toUpperCase() === solution) {
          setGameOver(true);
          setMessage('Splendid!');
        } else if (nextEmptyIndex === 5) {
          setGameOver(true);
          setMessage(solution);
        }
      }
    }

    if (e.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }

    if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + e.key.toUpperCase());
    }
  }, [currentGuess, gameOver, guesses, solution]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const getStatus = (guess: string, index: number) => {
    const char = guess[index];
    if (!char) return 'bg-white border-gray-300';
    if (solution[index] === char) return 'bg-green-500 text-white border-green-500';
    if (solution.includes(char)) return 'bg-yellow-500 text-white border-yellow-500';
    return 'bg-gray-500 text-white border-gray-500';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <h1 className="text-4xl font-bold mb-8 tracking-wider">WORDLE</h1>
      
      <div className="grid grid-rows-6 gap-2 mb-8">
        {guesses.map((guess, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.findIndex(g => g === '');
          const rowData = isCurrentRow ? currentGuess.padEnd(5, ' ') : guess.padEnd(5, ' ');
          
          return (
            <div key={rowIndex} className="flex gap-2">
              {rowData.split('').map((char, charIndex) => (
                <div
                  key={charIndex}
                  className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold uppercase transition-all duration-500 ${
                    !isCurrentRow && guess ? getStatus(guess, charIndex) : 'bg-white border-gray-300'
                  }`}
                >
                  {char !== ' ' ? char : ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {message && (
        <div className="fixed top-10 bg-black text-white px-4 py-2 rounded shadow-lg font-bold">
          {message}
        </div>
      )}

      {gameOver && (
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-black text-white rounded font-bold hover:bg-gray-800"
        >
          New Game
        </button>
      )}
    </div>
  );
}