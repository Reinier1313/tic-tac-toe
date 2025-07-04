'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const initialBoard = Array<string | null>(9).fill(null)

export default function Home() {
  const [board, setBoard] = useState(initialBoard)
  const [xIsNext, setXIsNext] = useState(true)
  const [mode, setMode] = useState<'pvp' | 'pvc'>('pvp')
  const [xWins, setXWins] = useState(0)
  const [oWins, setOWins] = useState(0)
  const [draws, setDraws] = useState(0)
  const winner = calculateWinner(board)

  // Handle a square click (only when it's a human turn)
  const handleClick = (idx: number) => {
    if (
      board[idx] ||
      winner ||
      (mode === 'pvc' && !xIsNext) // block O’s turn in pvc mode
    ) {
      return
    }
    const next = board.slice()
    next[idx] = xIsNext ? 'X' : 'O'
    setBoard(next)
    setXIsNext(!xIsNext)
  }

  // Simple AI: pick a random empty square
  const computerMove = () => {
  const move = getBestMove(board)
  if (move === -1) return
  const newBoard = [...board]
  newBoard[move] = 'O'
  setBoard(newBoard)
  setXIsNext(true)
}


  // When it's computer’s turn, schedule its move
  useEffect(() => {
    if (mode === 'pvc' && !xIsNext && !winner) {
      const t = setTimeout(computerMove, 500)
      return () => clearTimeout(t)
    }
  }, [board, xIsNext, mode, winner])

  // Watch for wins/draws and update scoreboard
  useEffect(() => {
    if (winner) {
      setTimeout(() => {
        if (winner === 'X') setXWins(x => x + 1)
        else setOWins(o => o + 1)
        resetBoard()
      }, 300)
    } else if (!winner && board.every(Boolean)) {
      setTimeout(() => {
        setDraws(d => d + 1)
        resetBoard()
      }, 300)
    }
  }, [winner, board])

  const resetBoard = () => {
    setBoard(initialBoard)
    setXIsNext(true)
  }
  const resetAll = () => {
    setXWins(0)
    setOWins(0)
    setDraws(0)
    resetBoard()
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 text-white space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-center">
        Tic Tac Toe
      </h1>
      <p>A Basic Tic-Tac-Toe PVP or PVC</p>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className={mode === 'pvp' ? 'bg-blue-600' : 'bg-gray-700'}
          onClick={() => setMode('pvp')}
        >
          2‑Player
        </Button>
        <Button
          size="sm"
          className={mode === 'pvc' ? 'bg-blue-600' : 'bg-gray-700'}
          onClick={() => setMode('pvc')}
        >
          Vs Computer
        </Button>
      </div>

      {/* Scoreboard */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        {[
          ['X Wins', xWins],
          ['O Wins', oWins],
          ['Draws', draws],
        ].map(([label, count]) => (
          <Card key={label} className="w-36 text-center bg-white text-black shadow">
            <CardContent className="pt-4 font-semibold">
              {label}
              <div className="text-3xl mt-1">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status */}
      <div className="text-lg">
        {winner
          ? `🏆 Winner: ${winner}`
          : board.every(Boolean)
          ? '🤝 It’s a draw!'
          : `Next: ${xIsNext ? 'X' : 'O'}`}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-4">
        {board.map((v, i) => (
          <button
            key={i}
            className="w-24 h-24 md:w-28 md:h-28 rounded-xl border-2 border-gray-600 bg-gray-700 text-white text-4xl font-bold flex items-center justify-center hover:bg-gray-600 transition"
            onClick={() => handleClick(i)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Button onClick={resetBoard} className="bg-blue-600 hover:bg-blue-700">
          Restart Game
        </Button>
        <Button variant="destructive" onClick={resetAll}>
          Reset All Scores
        </Button>
      </div>

      <p>Created by Reinier Mariscotes</p>
    </main>
  )
}

function calculateWinner(s: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ] as const
  for (const [a, b, c] of lines) {
    if (s[a] && s[a] === s[b] && s[a] === s[c]) {
      return s[a]
    }
  }
  return null
}

function smartAIMove(board: (string | null)[], isMaximizing: boolean): number {
  const winner = calculateWinner(board)
  if (winner === 'O') return 10
  if (winner === 'X') return -10
  if (board.every(Boolean)) return 0

  const moves: number[] = []
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = isMaximizing ? 'O' : 'X'
      const score = smartAIMove(board, !isMaximizing)
      moves.push(score)
      board[i] = null
    }
  }

  return isMaximizing ? Math.max(...moves) : Math.min(...moves)
}

function getBestMove(board: (string | null)[]) {
  let bestScore = -Infinity
  let move = -1

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O'
      const score = smartAIMove(board, false)
      board[i] = null
      if (score > bestScore) {
        bestScore = score
        move = i
      }
    }
  }

  return move
}

