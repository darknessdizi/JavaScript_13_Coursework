import Character from '../Character';

export default class Vampire extends Character {
  constructor(...args) {
    super(...args, 'vampire');
    this.attack = 25;
    this.defence = 25;
    this.step = 2;
    this.stepAttack = 2;

    if (this.level > 1) {
      for (let i = 1; i < this.level; i += 1) {
        Character.levelUp.call(this);
      }
    }
  }
}
