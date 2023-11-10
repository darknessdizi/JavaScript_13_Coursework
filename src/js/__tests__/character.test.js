import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

test('Проверка создания класса Character', () => {
  expect(() => {
    new Character(2);
  }).toThrow('Нельзя использовать вызов new Character()');
});

const listClass = [
  [
    'Bowman',
    Bowman,
    {
      "attack": 25,
      "defence": 25,
      "health": 50,
      "level": 1,
      "type": "bowman",
    }
  ],
  [
    'Swordsman',
    Swordsman,
    {
      "attack": 40,
      "defence": 10,
      "health": 50,
      "level": 1,
      "type": "swordsman",
    }
  ],
  [
    'Magician',
    Magician,
    {
      "attack": 10,
      "defence": 40,
      "health": 50,
      "level": 1,
      "type": "magician",
    }
  ],
  [
    'Daemon',
    Daemon,
    {
      "attack": 10,
      "defence": 40,
      "health": 50,
      "level": 1,
      "type": "daemon",
    }
  ],
  [
    'Undead',
    Undead,
    {
      "attack": 40,
      "defence": 10,
      "health": 50,
      "level": 1,
      "type": "undead",
    }
  ],
  [
    'Vampire',
    Vampire,
    {
      "attack": 25,
      "defence": 25,
      "health": 50,
      "level": 1,
      "type": "vampire",
    }
  ],
];
const testClass = test.each(listClass);

testClass('Создание класса %s - дочерний от Character', (title, object, result) => {
  const unit = new object(1);
  expect(unit).toBeInstanceOf(object);
  expect(unit).toEqual(result);
});
