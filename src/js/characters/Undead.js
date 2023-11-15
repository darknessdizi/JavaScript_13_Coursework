import Character from '../Character';

export default class Undead extends Character {
  constructor(...args) {
    super(...args, 'undead');
    this.attack = 40;
    this.defence = 10;
    this.step = 4;
    this.stepAttack = 1;
  }
}
