import React from 'react';
import { SquareType } from './scrabble-board';
import './scrabble-view.css'

function SquareView(props) {
  const classes = ["square"];
  if (props.locked) {
    classes.push("lockedSquare");
  }
  else {
    switch (props.type) {
      case SquareType.TripleWord:
        classes.push("tripleWord");
        break;
      case SquareType.DoubleWord:
        classes.push("doubleWord");
        break;
      case SquareType.TripleLetter:
        classes.push("tripleLetter");
        break;
      case SquareType.DoubleLetter:
        classes.push("doubleLetter");
        break;
      default:
      // no default:
      // classes can be used as-is if type is not one of those
    }
  }
  return (
    <input 
      className={ classes.join(' ') } 
      value={ props.value } 
      maxLength='1' 
      onChange={ props.onChange } 
      disabled={ props.locked }
    />
  );
}

export class BoardView extends React.Component {
  renderRow(rowSquares, rowNum) {
    return (
      rowSquares.map((square, colNum) => 
        <SquareView 
          type={ square.type } 
          key={ "col" + colNum } 
          value={ square.letter }
          locked={ square.locked }
          onChange={ this.props.onSquareUpdate(rowNum, colNum) }
        />
      )
    );
  }

  render() {
    return (
      <div>
        {
          this.props.squares.map((rowSquares, rowNum) => 
          <div className="board-row" key={ "row" + rowNum }>
            { this.renderRow(rowSquares, rowNum) }
          </div>)
        }
      </div>
    );
  }
}