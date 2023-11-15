import Character from '../Character';

export default class Magician extends Character {
  constructor(...args) {
    super(...args, 'magician');
    this.attack = 10;
    this.defence = 40;
    this.step = 1;
    this.stepAttack = 4;
  }
}
