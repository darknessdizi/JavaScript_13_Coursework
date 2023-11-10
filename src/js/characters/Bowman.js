import Character from '../Character';

export default class Bowman extends Character {
  constructor(...args) {
    super(...args, 'bowman');
    this.attack = 25;
    this.defence = 25;
  }
}
