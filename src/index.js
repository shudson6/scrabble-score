import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { SquareType } from './scrabble-board';
import { BoardView } from './scrabble-view';
import BoardLayout from './board-layout.json';
import { countAllTileValues, calculateCurrentWordScore } from './word-score';

import './index.css';

function Game(props) {
  const [squares, setSquares] = useState(initialSquares());

  const handleSquareUpdate = (row, col) => (event) => {
    // only allow change if the square is not locked
    if (squares[row][col].locked === false) {
      // copy the board
      const update = squares.map(row => row.slice());
      // replace the target square with a copy of itself containing the letter played
      update[row][col] = { ...squares[row][col], letter: event.target.value.toUpperCase() };
      setSquares(update);
    }
  }

  const lockUsedSquares = () => {
    // copy board
    const update = squares.map(row => row.slice());
    // replace each played, unlocked square with a locked version:
    for (let row = 0; row < update.length; row++) {
      for (let col = 0; col < update[row].length; col++) {
        const current = update[row][col];
        if ( !current.locked && current.letter) {
          update[row][col] = { ...current, locked: true };
        }
      }
    }
    setSquares(update);
  }

  const renderScore = () => {
    const scoreData = calculateCurrentWordScore(squares);
    return (
      <div>
        <div>
          Current play:
          <ul>
            { scoreData.map(word => <li>{ word.word }: { word.score }</li>)}
            <li/>
            <li>Total: { scoreData.total }</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="game">
      <div className="game-board">
        <BoardView squares={ squares } onSquareUpdate={ handleSquareUpdate }/>
      </div>
      <div className="game-info">
        <div>
          <button onClick={ lockUsedSquares }>Lock Squares</button>
        </div>
        <div>
          Total value of letters played: { countAllTileValues(squares) }
        </div>
        { renderScore() }
      </div>
    </div>
  );
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function initialSquares() {
  // create the squares
  const defaultSquare = { type: SquareType.Plain, letter: "", locked: false };
  const layout = BoardLayout.default;
  const squares = [];
  squares.rows = layout.rows;
  squares.columns = layout.columns;

  for (let row = 0; row < layout.rows; row++) {
    squares.push(Array(layout.columns));
    for (let col = 0; col < layout.columns; col++) {
      squares[row][col] = defaultSquare;
    }
  }

  // set premium squares
  let row, col;
  for ([col, row] of layout.w3x) {
    squares[row][col] = { ...defaultSquare, type: SquareType.TripleWord };
  }
  for ([col, row] of layout.w2x) {
    squares[row][col] = { ...defaultSquare, type: SquareType.DoubleWord };
  }
  for ([col, row] of layout.l3x) {
    squares[row][col] = { ...defaultSquare, type: SquareType.TripleLetter };
  }
  for ([col, row] of layout.l2x) {
    squares[row][col] = { ...defaultSquare, type: SquareType.DoubleLetter };
  }

  return squares;
}
