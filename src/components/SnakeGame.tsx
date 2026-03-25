import { useCallback, useEffect, useRef, useState } from 'react';
import { GRID_SIZE, INITIAL_SPEED } from '../constants';

type Point = { x: number; y: number };

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const isFoodOnSnake = snake.some(
      (segment) => segment.x === newFood.x && segment.y === newFood.y
    );
    if (!isFoodOnSnake) break;
  }
  return newFood;
};

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const directionRef = useRef<Point>(INITIAL_DIRECTION);
  const lastProcessedDirectionRef = useRef<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const currentDirection = directionRef.current;
      lastProcessedDirectionRef.current = currentDirection;
      const newHead = { x: head.x + currentDirection.x, y: head.y + currentDirection.y };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Self collision
      if (
        prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      setFood((currentFood) => {
        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
          setScore((s) => s + 10);
          setSpeed((s) => Math.max(50, s - 2)); // Increase speed slightly
          return generateFood(newSnake);
        }
        return currentFood;
      });

      if (!(newHead.x === food.x && newHead.y === food.y)) {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [food, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (gameOver) resetGame();
        else setIsPaused((p) => !p);
        return;
      }

      if (gameOver || isPaused) return;

      const prev = lastProcessedDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (prev.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (prev.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (prev.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (prev.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, speed]);

  // Initial food spawn
  useEffect(() => {
    setFood(generateFood(INITIAL_SNAKE));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-fit mx-auto">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] tracking-wider uppercase">
          Neon Snake
        </h2>
        <div className="text-2xl font-mono font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
          SCORE: {score.toString().padStart(4, '0')}
        </div>
      </div>

      <div className="relative bg-black/60 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.2)] p-2 backdrop-blur-md">
        <div
          className="grid gap-[1px] bg-gray-900/50 border border-gray-800"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'min(80vw, 400px)',
            height: 'min(80vw, 400px)',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`w-full h-full rounded-sm transition-all duration-75 ${
                  isHead
                    ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)] z-10'
                    : isSnake
                    ? 'bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.6)]'
                    : isFood
                    ? 'bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,1)] animate-pulse rounded-full scale-75'
                    : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Overlays */}
        {(gameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20">
            <h3 className={`text-4xl font-black mb-4 uppercase tracking-widest ${
              gameOver 
                ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' 
                : 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]'
            }`}>
              {gameOver ? 'Game Over' : 'Paused'}
            </h3>
            <p className="text-gray-300 font-mono mb-6">
              {gameOver ? `Final Score: ${score}` : 'Press SPACE to resume'}
            </p>
            {gameOver && (
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-transparent border-2 border-green-500 text-green-400 font-bold uppercase tracking-wider rounded hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.8)]"
              >
                Play Again
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-gray-500 text-sm font-mono text-center">
        Use <span className="text-cyan-400">Arrow Keys</span> or <span className="text-cyan-400">WASD</span> to move<br/>
        Press <span className="text-fuchsia-400">SPACE</span> to pause
      </div>
    </div>
  );
}
