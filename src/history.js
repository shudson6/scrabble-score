const actionStack = [];

function canUndo() {
  return actionStack.length > 0;
}

function undo() {
  actionStack.pop().undo();
}

function add(undoCallback) {
  actionStack.push({ undo: undoCallback });
}

const History = {
  canUndo
  ,undo
  ,add
}

export default History;