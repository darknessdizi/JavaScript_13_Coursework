/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  // TODO: ваш код будет тут
  if (index === 0) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index === (boardSize ** 2) - boardSize) {
    return 'bottom-left';
  }
  if (index === (boardSize ** 2) - 1) {
    return 'bottom-right';
  }
  if (index < boardSize) {
    return 'top';
  }
  if (Number.isInteger(index / boardSize)) {
    return 'left';
  }
  if (Number.isInteger((index + 1) / boardSize)) {
    return 'right';
  }
  if (index > (boardSize ** 2) - boardSize) {
    return 'bottom';
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function getIndexPositions(boardSize) {
  const positionIndex = {
    player: [],
    enemy: [],
  };
  const step = boardSize - 1;
  const border = (boardSize ** 2) - step;

  for (let i = 0; i < border; i += 1) {
    if (Number.isInteger(i / boardSize)) {
      positionIndex.player.push(i);
      positionIndex.player.push(i + 1);
      positionIndex.enemy.push(i + step - 1);
      positionIndex.enemy.push(i + step);
    }
  }
  return positionIndex;
}

export function getFieldMatrix(boardSize) {
  const result = [];
  for (let x = 0; x < boardSize; x += 1) {
    const listIndex = [];
    for (let y = 0; y < boardSize; y += 1) {
      const index = (boardSize * x) + y;
      listIndex.push(index);
    }
    result.push(listIndex);
  }
  return result;
}

export function getСoordinates(index, matrix) {
  const result = { X: null, Y: null };
  for (let x = 0; x < matrix.length; x += 1) {
    result.Y = matrix[x].indexOf(index);
    if (result.Y !== -1) {
      result.X = x;
      break;
    }
  }
  return result;
}

export function compareLevel(a, b) {
  let value;
  if (a.character.level > b.character.level) value = -1;
  if (a.character.level === b.character.level) value = 0;
  if (a.character.level < b.character.level) value = 1;
  return value;
}

export function compareDistance(a, b) {
  let value;
  if (a.distance > b.distance) value = 1;
  if (a.distance === b.distance) value = 0;
  if (a.distance < b.distance) value = -1;
  return value;
}

export function countStep(metric, unit) {
  // Метод определяет шаг для движения unit. Возращает значение шага.
  let step;
  if (metric.distance >= unit.character.stepAttack) {
    step = metric.distance;
    if (metric.distance > unit.character.step) {
      step = unit.character.step;
    }
  } else {
    step = metric.distance;
    if (metric.distance > unit.character.step) {
      step = unit.character.step;
    }
  }
  return step;
}
