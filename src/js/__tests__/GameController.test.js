import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Bowman from '../characters/Bowman';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';
import Vampire from '../characters/Vampire';
import { getFieldMatrix } from '../utils';

jest.mock('../GamePlay');
jest.mock('../GameStateService');

const gamePlay = new GamePlay();
const gameStateService = new GameStateService('');

GamePlay.showError.mockImplementation((text) => {
  throw Error(text);
});

gamePlay.showDamage.mockImplementation(
  () => new Promise((resolve) => resolve()),
);

jest.spyOn(GameController.prototype, 'stepComputer')
  .mockImplementation(() => null);

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  GamePlay.mockClear();
  GameStateService.mockClear();
  gamePlay.showDamage.mockClear();
});

const listPlayer = [
  ['Swordsman', Swordsman, Undead],
  ['Bowman', Bowman, Undead],
  ['Magician', Magician, Undead],
  ['Undead', Undead, Swordsman],
  ['Daemon', Daemon, Swordsman],
  ['Vampire', Vampire, Swordsman],
];

const testListPlayer = test.each(listPlayer);

testListPlayer('Тест на проверку движения персонажей класса %s', (title, ClassName) => {
  const controller = new GameController(gamePlay, gameStateService);
  const unit = new ClassName(1);

  const size = 3 + (unit.step * 2);
  controller.gameState.matrix = getFieldMatrix(size);
  const matrixLength = controller.gameState.matrix.length;

  const team = { characters: [unit] };
  controller.gameState.playerTypes.push(unit.type);
  const center = ((size ** 2) - 1) / 2;
  const teamPlayers = GameController.assignPositions(team, [center]);
  controller.gameState.players.push(...teamPlayers);

  const arrayIndexTrue = [];
  for (let i = 1; i <= unit.step; i += 1) {
    arrayIndexTrue.push(center + i);
    arrayIndexTrue.push(center - i);
    arrayIndexTrue.push(center + (i * size));
    arrayIndexTrue.push(center - (i * size));
    arrayIndexTrue.push(center + i + (i * size));
    arrayIndexTrue.push(center - i + (i * size));
    arrayIndexTrue.push(center + i - (i * size));
    arrayIndexTrue.push(center - i - (i * size));
  }

  controller.onCellClick(center);
  for (let i = 0; i < (matrixLength ** 2); i += 1) {
    controller.onCellEnter(i);
    if ((arrayIndexTrue.includes(i)) || (i === center)) {
      expect(controller.gameState.cursorStatus).toBeTruthy();
      controller.onCellClick(i);
      controller.gameState.stepUser = true;
      controller.onCellClick(i);
      controller.onCellClick(center);
      controller.gameState.stepUser = true;
      controller.onCellClick(center);
    } else {
      expect(controller.gameState.cursorStatus).toBeFalsy();
      expect(() => {
        controller.onCellClick(i);
      }).toThrow('Недопустимое действие');
    }
  }
});

testListPlayer(
  'Тест на проверку атаки персонажей класса %s',
  (title, ClassPlayer, ClassEnemy) => {
    const controller = new GameController(gamePlay, gameStateService);
    const unit = new ClassPlayer(1);

    const size = 3 + (unit.stepAttack * 2);
    controller.gameState.matrix = getFieldMatrix(size);
    const matrixLength = controller.gameState.matrix.length;

    const team = { characters: [unit] };
    controller.gameState.playerTypes.push(unit.type);
    const center = ((size ** 2) - 1) / 2;
    const teamPlayers = GameController.assignPositions(team, [center]);
    controller.gameState.players.push(...teamPlayers);

    const enemy = new ClassEnemy(1);
    const enemyTeam = { characters: [enemy] };
    controller.gameState.enemyTypes.push(enemy.type);

    const arrayIndexTrue = [];
    const unitAttack = (unit.stepAttack * 2) + 1;
    const indexBegin = center - unit.stepAttack - (unit.stepAttack * size);
    for (let y = 0; y < unitAttack; y += 1) {
      for (let i = 0; i < unitAttack; i += 1) {
        const index = indexBegin + i + (size * y);
        if (index !== center) {
          arrayIndexTrue.push(index);
        }
      }
    }

    controller.onCellClick(center);
    for (let i = 0; i < (matrixLength ** 2); i += 1) {
      if (i !== center) {
        const teamEnemies = GameController.assignPositions(enemyTeam, [i]);
        controller.gameState.enemies.push(...teamEnemies);
        controller.onCellEnter(i);

        if (arrayIndexTrue.includes(i)) {
          expect(controller.gameState.cursorStatus).toBeTruthy();
          controller.onCellClick(i);
          expect(gamePlay.showDamage).toHaveBeenCalled();
          controller.gameState.animation = false;
          controller.onCellClick(center);
        } else {
          expect(controller.gameState.cursorStatus).toBeFalsy();
          expect(() => {
            controller.onCellClick(i);
          }).toThrow('Недопустимое действие');
        }
      }
    }
    expect(gamePlay.showDamage).toHaveBeenCalledTimes(arrayIndexTrue.length);
  },
);

test('Вывод информации о персонаже (метод getMessage)', () => {
  const unit = {
    character: {
      level: 2,
      attack: 40,
      defence: 10,
      health: 50,
      type: 'undead',
    },
    position: 69,
  };

  const message = GameController.getMessage(unit);
  expect(message).toEqual('🎖 2 ⚔ 40 🛡 10 ❤ 50');
});
