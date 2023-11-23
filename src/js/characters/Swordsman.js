import Character from '../Character';

export default class Swordsman extends Character {
  constructor(...args) {
    super(...args, 'swordsman');
    this.attack = 40;
    this.defence = 10;
    this.step = 4;
    this.stepAttack = 1;

    if (this.level > 1) {
      for (let i = 1; i < this.level; i += 1) {
        Character.levelUp.call(this);
      }
    }
  }
}
