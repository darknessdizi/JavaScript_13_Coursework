import Character from '../Character';

export default class Swordsman extends Character {
  constructor(...args) {
    super(...args, 'swordsman');
    this.attack = 40;
    this.defence = 10;
    this.step = 4;
    this.stepAttack = 1;
  }
}
