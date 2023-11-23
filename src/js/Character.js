/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    if (new.target === Character.prototype.constructor) {
      throw new Error('Нельзя использовать вызов new Character()');
    }
  }

  static levelUp(level = null) {
    this.level += level;
    let attack = Math.max(this.attack, (this.attack * (80 + this.health)) / 100);
    attack = Math.round(attack);
    this.attack = attack;

    let defence = Math.max(this.defence, (this.defence * (80 + this.health)) / 100);
    defence = Math.round(defence);
    this.defence = defence;

    this.health += 80;
    if (this.health > 100) {
      this.health = 100;
    }
  }
}
