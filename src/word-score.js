import LetterValues from './letter-values';
import { SquareType } from './scrabble-board';

export function countAllTileValues(squares) {
  let score = 0;
  squares.forEach((rowSquares, rowNum) => {
    rowSquares.filter(square => square.letter)
    .forEach((square, colNum) => {
      score += LetterValues.get(square.letter.toLowerCase());
    })
  });
  return score;
}

/**
 * Checks that all unlocked, played squares are on a single row or column.
 * Identifies as individual words each group of contiguous, played squares
 * which includes at least one unlocked square.
 * Returns an n x 2 array mapping each word to its value.
 */
export function calculateCurrentWordScore(squares) {
  const currentLetters = getCurrentLetters(squares);
  let words = evaluateRowwise(squares, currentLetters);
  if (words.length === 0) {
    words = evaluateColumnwise(squares, currentLetters);
  }
  if (words.length > 0) {
    scoreWords(squares, words);
  }
  console.log({ words });
  words.total = words.reduce((total, word) => total + word.score, 0);
  return words;
}

function evaluateColumnwise(squares, currentLetters) {
  if (currentLetters.length === 1
      && !hasVerticalNeighbor(squares, currentLetters[0])) {
    return [];
  }
  if (currentLetters.length < 1 || !allOnSameColumn(currentLetters)) {
    return [];
  }
  if ( !continuousOnColumn(squares, currentLetters)) {
    return [];
  }
  const positions = getWordPositionsVertical(squares, currentLetters[0]);
  return collectWordsVertical(squares, positions);
}

function evaluateRowwise(squares, currentLetters) {
  if (currentLetters.length === 1 
      && !hasHorizontalNeighbor(squares, currentLetters[0])) {
    return [];
  }
  if (currentLetters.length < 1 || !allOnSameRow(currentLetters)) {
    return [];
  }
  if ( !continuousOnRow(squares, currentLetters)) {
    return [];
  }
  const positions = getWordPositionsHorizontal(squares, currentLetters[0]);
  return collectWordsHorizontal(squares, positions);
}

function hasVerticalNeighbor(squares, position) {
  const [row, col] = position;
  if (row > 0 && squares[row - 1][col].letter) {
    return true;
  }
  if (row + 1 < squares.length && squares[row + 1][col].letter) {
    return true;
  }
  return false;
}

function hasHorizontalNeighbor(squares, position) {
  const [row, col] = position;
  if (col > 0 && squares[row][col - 1].letter) {
    return true;
  }
  if (col + 1 < squares[row].length && squares[row][col + 1].letter) {
    return true;
  }
  return false;
}

function getCurrentLetters(squares) {
  const positions = [];
  for (let row = 0; row < squares.length; row++) {
    for (let col = 0; col < squares[row].length; col++) {
      if (squares[row][col].letter && !squares[row][col].locked) {
        positions.push([row, col]);
      }
    }
  }
  return positions;
}

function allOnSameRow(positions) {
  return positions.every(pair => pair[0] === positions[0][0]);
}

function allOnSameColumn(positions) {
  return positions.every(pair => pair[1] === positions[0][1]);
}

function continuousOnRow(squares, positions) {
  // positions are already in sorted order
  // so make sure every square between the first and last col
  // has a letter
  if (positions.length < 2) return true;

  const row = positions[0][0];
  const lastCol = positions[positions.length - 1][1];
  for (let col = positions[0][1]; col <= lastCol; col++) {
    if ( !squares[row][col].letter ) {
      return false;
    }
  }
  return true;
}

function continuousOnColumn(squares, positions) {
  // positions are already in sorted order
  // so make sure every square between the first and last col
  // has a letter
  if (positions.length < 2) return true;

  const col = positions[0][1];
  const lastRow = positions[positions.length - 1][0];
  for (let row = positions[0][0]; row <= lastRow; row++) {
    if ( !squares[row][col].letter ) {
      return false;
    }
  }
  return true;
}

function getWordPositionsHorizontal(squares, position) {
  // work backwards
  const row = position[0];
  const result = [];
  let col = position[1];
  while (col > 0 && squares[row][col - 1].letter) {
    col--;
  }
  result.push([row, col]);
  // work forwards
  while (col + 1 < squares[row].length && squares[row][col + 1].letter) {
    col++;
    result.push([row, col]);
  }
  return result;
}

function getWord(squares, positions) {
  const letters = positions.map(pos => squares[pos[0]][pos[1]].letter);
  return letters.join("");
}

function getWordPositionsVertical(squares, position) {
  // work backwards
  const col = position[1];
  const result = [];
  let row = position[0];
  while (row > 0 && squares[row - 1][col].letter) {
    row--;
  }
  result.push([row, col]);
  // work forwards
  while (row + 1 < squares.length && squares[row + 1][col].letter) {
    row++;
    result.push([row, col]);
  }
  return result;
}

function collectWordsHorizontal(squares, positions) {
  const words = [];
  // start with the (horizontal) word given by the positions
  words.push({ 
    word: getWord(squares, positions),
    positions: positions
  });
  // now look for (vertical) words stemming from it
  positions.filter(pos => squares[pos[0]][pos[1]].locked === false)
      .forEach(pos => {
        const vpos = getWordPositionsVertical(squares, pos);
        if (vpos.length > 1) {
          words.push({
            word: getWord(squares, vpos),
            positions: vpos
          });
        }
      });
  return words;
}

function collectWordsVertical(squares, positions) {
  const words = [];
  // start with the (vertical) word given by the positions
  words.push({
    word: getWord(squares, positions),
    positions: positions
  });
  // now look for (horizontal) words stemming from it
  positions.filter(pos => squares[pos[0]][pos[1]].locked === false)
      .forEach(pos => {
        const hpos = getWordPositionsHorizontal(squares, pos);
        if (hpos.length > 1) {
          words.push({
            word: getWord(squares, hpos),
            positions: hpos
          });
        }
      });
  return words;
}

function scoreWords(squares, words) {
  words.forEach(word => {
    let multiplier = 1;
    let score = 0;
    word.positions.forEach(pos => {
      const [row, col] = pos;
      const square = squares[row][col];
      let value = LetterValues.get(square.letter.toLowerCase());
      // premium squares only count when unlocked
      if ( !square.locked ) {
        switch (square.type) {
          case SquareType.DoubleLetter:
            value *= 2;
            break;
          case SquareType.TripleLetter:
            value *= 3;
            break;
          case SquareType.DoubleWord:
            multiplier *= 2;
            break;
          case SquareType.TripleWord:
            multiplier *= 3;
            break;
          default:
            // nothing to do
        }
      }
      score += value;
    });
    score *= multiplier;
    word.score = score;
  });
  // no return; parameter 'words' was modified
}