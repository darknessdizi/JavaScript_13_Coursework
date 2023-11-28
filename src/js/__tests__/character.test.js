import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

test('Проверка создания класса Character', () => {
  expect(() => {
    const obj = new Character(2);
    expect(obj).toBeUndefined();
  }).toThrow('Нельзя использовать вызов new Character()');
});

const listClass = [
  [
    'Bowman',
    Bowman,
    {
      attack: 25,
      defence: 25,
      health: 50,
      level: 1,
      step: 2,
      stepAttack: 2,
      type: 'bowman',
    },
  ],
  [
    'Swordsman',
    Swordsman,
    {
      attack: 40,
      defence: 10,
      health: 50,
      level: 1,
      step: 4,
      stepAttack: 1,
      type: 'swordsman',
    },
  ],
  [
    'Magician',
    Magician,
    {
      attack: 10,
      defence: 40,
      health: 50,
      level: 1,
      step: 1,
      stepAttack: 4,
      type: 'magician',
    },
  ],
  [
    'Daemon',
    Daemon,
    {
      attack: 10,
      defence: 40,
      health: 50,
      level: 1,
      step: 1,
      stepAttack: 4,
      type: 'daemon',
    },
  ],
  [
    'Undead',
    Undead,
    {
      attack: 40,
      defence: 10,
      health: 50,
      level: 1,
      step: 4,
      stepAttack: 1,
      type: 'undead',
    },
  ],
  [
    'Vampire',
    Vampire,
    {
      attack: 25,
      defence: 25,
      health: 50,
      level: 1,
      step: 2,
      stepAttack: 2,
      type: 'vampire',
    },
  ],
];
const testClass = test.each(listClass);

testClass('Создание класса %s - дочерний от Character', (title, ClassCaracter, result) => {
  const unit = new ClassCaracter(1);
  expect(unit).toBeInstanceOf(ClassCaracter);
  expect(unit).toEqual(result);
});

test('Создание демона и мага', () => {
  const result = {
    attack: 23,
    defence: 94,
    health: 100,
    level: 3,
    step: 1,
    stepAttack: 4,
  };
  result.type = 'daemon';
  const demon = new Daemon(3);
  expect(demon).toEqual(result);

  result.type = 'magician';
  const magician = new Magician(3);
  expect(magician).toEqual(result);
});

test('Создание вампира и лучника', () => {
  const result = {
    attack: 33,
    defence: 33,
    health: 100,
    level: 2,
    step: 2,
    stepAttack: 2,
  };
  result.type = 'vampire';
  const vampire = new Vampire(2);
  expect(vampire).toEqual(result);

  result.type = 'bowman';
  const bowman = new Bowman(2);
  expect(bowman).toEqual(result);
});

test('Создание нежити и мечника', () => {
  const result = {
    attack: 169,
    defence: 41,
    health: 100,
    level: 4,
    step: 4,
    stepAttack: 1,
  };
  result.type = 'undead';
  const undead = new Undead(4);
  expect(undead).toEqual(result);

  result.type = 'swordsman';
  const swordsman = new Swordsman(4);
  expect(swordsman).toEqual(result);
});
