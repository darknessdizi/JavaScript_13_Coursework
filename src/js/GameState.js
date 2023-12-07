import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export default class GameState {
  constructor() {
    this.stepUser = true;
    this.lostIndex = -1;
    this.players = [];
    this.enemies = [];
    this.playerTypes = [];
    this.enemyTypes = [];
    this.unitAssign = false;
    this.point = { X: null, Y: null };
    this.matrix = undefined;
    this.cursorStatus = true;
    this.step = undefined;
    this.stepAttack = undefined;
    this.animation = false;
    this.playerVictory = false;
    this.countMembers = 4;
    this.level = 1;
    this.countThemes = 0;
    this.newGame = false;
    this.score = 0;
    this.maxScore = 0;
    this.addListener = true;
    this.firstRun = true;
  }

  from(object) {
    // TODO: create object
    this.players = object.players;
    this.enemies = object.enemies;
    this.playerTypes = object.playerTypes;
    this.enemyTypes = object.enemyTypes;
    this.matrix = object.matrix;
    this.level = object.level;
    this.countThemes = object.countThemes;
    this.score = object.score;
    this.maxScore = object.maxScore;

    GameState.recoverUnits(this.enemies);
    GameState.recoverUnits(this.players);
    return null;
  }

  static recoverUnits(arrayUnits) {
    const className = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
      undead: Undead,
      daemon: Daemon,
      vampire: Vampire,
    };

    const arrayObjects = [];
    for (const obj of arrayUnits) {
      const newObj = {};
      const unit = new className[obj.character.type](1);
      GameState.addParamsUnit(unit, obj.character);
      newObj.character = unit;
      newObj.position = obj.position;
      arrayObjects.push(newObj);
    }
    arrayUnits.splice(0);
    arrayUnits.push(...arrayObjects);
  }

  static addParamsUnit(unit, obj) {
    const item = unit;
    item.attack = obj.attack;
    item.defence = obj.defence;
    item.step = obj.step;
    item.stepAttack = obj.stepAttack;
    item.level = obj.level;
    item.health = obj.health;
    item.type = obj.type;
  }
}
