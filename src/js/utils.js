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

// export function calcTileType(index, boardSize) {
//   // TODO: вариант 2 (меньше, но не красивый)
//   const board = {
//     'top-left': index === 0,
//     'top-right': index === boardSize - 1,
//     'bottom-left': index === (boardSize ** 2) - boardSize,
//     'bottom-right': index === (boardSize ** 2) - 1,
//     'top': index + 1 < boardSize,
//     'left': Number.isInteger(index / boardSize),
//     'right': Number.isInteger((index + 1) / boardSize),
//     'bottom': index > (boardSize ** 2) - boardSize,
//     'center': true,
//   }

//   for (let param of Object.entries(board)) {
//     if (param[1]) {
//       return param[0];
//     }
//   }
// }

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function determiningPositionsTeams(boardSize) {
  const positionIndex = {
    player: [],
    enemy: [],
  };
  const step = boardSize - 1;
  const border = (boardSize ** 2) - step;

  for (let i = 0; i < border; i++) {
    if (Number.isInteger(i / boardSize)) {
      positionIndex.player.push(i);
      positionIndex.player.push(i + 1);
      positionIndex.enemy.push(i + step - 1);
      positionIndex.enemy.push(i + step);
    }
  }
  return positionIndex;
}
