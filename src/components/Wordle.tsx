import { useEffect, useState, useCallback, useRef } from "react";
import allWords from "../assets/dictionary.json";

const GRID = Array(6)
    .fill(null)
    .map(() => Array(5).fill(""));
const KEYBOARD = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["DEL", "Z", "X", "C", "V", "B", "N", "M", "ENTER"],
];

const Wordle = () => {
    const [grid, setGrid] = useState(GRID);
    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [validWord, setValidWord] = useState("");
    const [gameOver, setGameOver] = useState(false);

    const wordsSet = useRef(new Set());
    const gridRefs = useRef<(HTMLDivElement | null)[][]>(
        Array(6)
            .fill(null)
            .map(() => Array(5).fill(null))
    );

    const selectNewWord = useCallback(() => {
        const words = Array.from(wordsSet.current) as string[];
        const randomWord =
            words[Math.floor(Math.random() * words.length)].toUpperCase();
        setValidWord(randomWord);
    }, []);

    const writeLetter = (letter: string) => {
        if (/^[A-Za-z]$/.test(letter) && currentCol < 5) {
            setGrid((prev) => {
                const newGrid = [...prev];
                newGrid[currentRow][currentCol] = letter;
                return newGrid;
            });
            setCurrentCol((prev) => prev + 1);
        }
    };

    const deleteLetter = () => {
        if (currentCol === 0) return;

        setGrid((prev) => {
            const newGrid = [...prev];
            newGrid[currentRow][currentCol - 1] = "";
            return newGrid;
        });
        setCurrentCol((prev) => prev - 1);
    };

    const enterWord = () => {
        if (currentCol !== 5) return;

        // Check word and move to next row
        const word = grid[currentRow].join("");
        if (word === validWord) {
            alert("Correct word!");

            setGameOver(true);
            window.removeEventListener("keydown", handleKeyDown);
        } else {
            if (!wordsSet.current.has(word)) return;

            setCurrentRow((prev) => prev + 1);
            setCurrentCol(0);
        }

        gridRefs.current[currentRow].forEach((ref, i) => {
            if (!ref) return;

            ref.classList.add("text-white");
            if (ref.innerText === validWord[i]) {
                ref.classList.add("bg-green-500");
                ref.classList.add("border-green-500");
            } else if (validWord.includes(ref.innerText)) {
                ref.classList.add("bg-orange-500");
                ref.classList.add("border-orange-500");
            } else {
                ref.classList.add("bg-slate-500");
                ref.classList.add("border-slate-500");
            }
        });
    };

    const handleLetterPress = (letter: string) => {
        if (currentRow >= 6 || gameOver) return;

        if (letter === "DEL") {
            deleteLetter();
        } else if (letter === "ENTER") {
            enterWord();
        } else {
            writeLetter(letter.toUpperCase());
        }
    };

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (currentRow >= 6 || gameOver) return;

            if (event.key === "Backspace") {
                deleteLetter();
            } else if (event.key === "Enter") {
                enterWord();
            } else {
                writeLetter(event.key.toUpperCase());
            }
        },
        [currentRow, currentCol, grid, validWord]
    );

    const restart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.blur();

        setGrid((prev) => {
            const newGrid = [...prev];
            newGrid.forEach((row) => {
                row.fill("");
            });
            return newGrid;
        });
        setCurrentRow(0);
        setCurrentCol(0);
        setValidWord("");
        selectNewWord();
        setGameOver(false);
        // Remove all highlights
        gridRefs.current.forEach((row) => {
            row.forEach((ref) => {
                ref?.classList.remove(
                    "text-white",
                    "bg-green-500",
                    "border-green-500",
                    "bg-orange-500",
                    "border-orange-500",
                    "bg-slate-500",
                    "border-slate-500"
                );
            });
        });
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        // Initialize the Set with all words from the JSON file
        wordsSet.current = new Set(allWords);
        selectNewWord();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div>
                Current position: Row {currentRow}, Col {currentCol}, Word:{" "}
                {validWord} <button onClick={restart}>Restart</button>
            </div>
            <div className="flex flex-col gap-1">
                {grid.map((row, i) => (
                    <div
                        className="flex items-center justify-center gap-1"
                        key={i}
                    >
                        {row.map((key, j) => (
                            <div
                                className={`w-14 h-14 text-3xl text-slate-700 font-bold flex items-center justify-center border-2 border-slate-200 rounded`}
                                key={j}
                                ref={(el) => (gridRefs.current[i][j] = el)}
                            >
                                {key}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-1">
                {KEYBOARD.map((row, i) => (
                    <div
                        className="flex items-center justify-center gap-1"
                        key={i}
                    >
                        {row.map((key) => (
                            <div
                                className="bg-slate-200 px-3 min-w-12 h-10 font-bold flex items-center justify-center text-slate-600 rounded hover:bg-slate-300 cursor-pointer"
                                key={key}
                                onClick={() => handleLetterPress(key)}
                            >
                                {key}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wordle;
