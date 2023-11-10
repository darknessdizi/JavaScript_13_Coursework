import Character from '../Character';

export default class Vampire extends Character {
  constructor(...args) {
    super(...args, 'vampire');
    this.attack = 25;
    this.defence = 25;
  }
}
