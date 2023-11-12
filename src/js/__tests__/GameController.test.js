import GameController from '../GameController';

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
