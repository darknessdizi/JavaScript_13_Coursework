import Character from '../Character';

export default class Daemon extends Character {
  constructor(...args) {
    super(...args, 'daemon');
    this.attack = 10;
    this.defence = 40;
  }
}
