import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import Bowman from '../characters/Bowman';

jest.mock('../GamePlay');

const gamePlay = new GamePlay();
const gameStateService = new GameStateService(localStorage);
const controller = new GameController(gamePlay, gameStateService);

test('Успешное сохранение и загрузка данных (класс GameStateService)', () => {
  const unit = new Bowman(1);
  const objectPlayer = {
    character: unit,
    position: 0,
  };
  controller.gameState.players.push(objectPlayer);

  controller.onSaveGame();

  expect(controller.stateService.load()).toEqual({
    countThemes: 0,
    enemies: [],
    enemyTypes: [],
    level: 1,
    maxScore: 0,
    playerTypes: [],
    players: [
      { character: unit, position: 0 },
    ],
    score: 0,
  });

  const secondController = new GameController(gamePlay, gameStateService);
  const data = secondController.stateService.load();
  secondController.gameState.from(data);
  expect(secondController.gameState.players[0].character).toBeInstanceOf(Bowman);
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
    expect(error.message).toBe('Invalid state');
  }
  expect(GamePlay.showError).toHaveBeenCalled();
  expect(GamePlay.showError).toHaveBeenCalledTimes(1);
});
