import { calcTileType } from '../utils';

const size = 8;

test('Тест функции calcTileType файла utils.js (создание поля)', () => {
  const array = [];
  for (let i = 0; i < size ** 2; i += 1) {
    array.push(calcTileType(i, size));
  }
  expect(array[0]).toBe('top-left');
  expect(array[5]).toBe('top');
  expect(array[7]).toBe('top-right');
  expect(array[46]).toBe('center');
  expect(array[47]).toBe('right');
  expect(array[48]).toBe('left');
  expect(array[56]).toBe('bottom-left');
  expect(array[60]).toBe('bottom');
  expect(array[63]).toBe('bottom-right');
});
