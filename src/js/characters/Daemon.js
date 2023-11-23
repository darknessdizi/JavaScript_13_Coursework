import Character from '../Character';

export default class Daemon extends Character {
  constructor(...args) {
    super(...args, 'daemon');
    this.attack = 10;
    this.defence = 40;
    this.step = 1;
    this.stepAttack = 4;

    if (this.level > 1) {
      for (let i = 1; i < this.level; i += 1) {
        Character.levelUp.call(this);
      }
    }
  }
}
