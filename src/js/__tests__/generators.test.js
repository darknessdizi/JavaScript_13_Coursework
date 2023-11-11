import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Team from '../Team';

test('Бесконечный генератор персонажей', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const playerGenerator = characterGenerator(playerTypes, 1);
  for (let i = 0; i < 100; i += 1) {
    const player = playerGenerator.next().value;
    expect(player).toBeDefined();
  }
});

test('Проверка функции generateTeam', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 4;
  const count = 8;
  const teamPlayer = generateTeam(playerTypes, maxLevel, count);
  expect(teamPlayer).toBeInstanceOf(Team);
  expect(teamPlayer.characters).toHaveLength(count);
  for (const item of teamPlayer.characters) {
    expect(item.level).toBeGreaterThan(0);
    expect(item.level).toBeLessThan(5);
  }
});
