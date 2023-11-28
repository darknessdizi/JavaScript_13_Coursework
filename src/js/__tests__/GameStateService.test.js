import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

jest.mock('../GamePlay');

const gamePlay = new GamePlay();
const gameStateService = new GameStateService(localStorage);
const controller = new GameController(gamePlay, gameStateService);

test('Успешное сохранение и загрузка данных (класс GameStateService)', () => {
  controller.stateService.save(controller.gameState);

  const object = controller.stateService.load();
  controller.gameState.from(object);

  expect(controller.stateService.load()).toEqual({
    addListener: true,
    animation: false,
    countMembers: 4,
    countThemes: 0,
    cursorStatus: true,
    enemies: [],
    enemyTypes: [],
    firstRun: true,
    level: 1,
    lostIndex: -1,
    maxScore: 0,
    newGame: false,
    playerTypes: [],
    playerVictory: false,
    players: [],
    point: {
      X: null,
      Y: null,
    },
    score: 0,
    stepUser: true,
    unitAssign: false,
  });
});

test('Неудачная загрузка данных (класс GameStateService)', () => {
  const weakMap = new WeakMap();
  const test = { game: 'Error' };
  weakMap.set(test, 'Whoops');
  const errorObject = { weakMap: 1 };

  localStorage.setItem('state', errorObject);

  expect(() => {
    controller.stateService.load();
  }).toThrow();
  localStorage.removeItem('state');
});

test('Неудачная загрузка данных (класс GameStateService)', () => {
  jest.spyOn(GameStateService.prototype, 'load')
    .mockImplementation(() => {
      throw Error('Invalid state');
    });

  GamePlay.showError.mockImplementation((text) => {
    throw Error(text);
  });

  try {
    controller.init();
  } catch (error) {
    expect(error.message).toBe('Error: Invalid state');
  }
  expect(GamePlay.showError).toHaveBeenCalled();
  expect(GamePlay.showError).toHaveBeenCalledTimes(1);
});
