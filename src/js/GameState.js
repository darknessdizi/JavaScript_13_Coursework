export default class GameState {
  constructor() {
    this.stepUser = true;
    this.lostIndex = -1;
    this.players = [];
    this.enemies = [];
    this.playerTypes = [];
    this.enemyTypes = [];
    this.unitAssign = false;
    this.point = { X: null, Y: null }
    this.matrix = undefined;
    this.actionStatus = true;
    this.step = undefined;
    this.stepAttack = undefined;
  }

  static from(object) {
    // TODO: create object
    this.stepUser = object.stepUser;
    this.lostIndex = object.lostIndex;
    this.players = object.players;
    this.enemies = object.enemies;
    this.playerTypes = object.playerTypes;
    this.enemyTypes = object.enemyTypes;
    this.unitAssign = object.unitAssign;
    this.point = object.point;
    this.matrix = object.matrix;
    this.actionStatus = object.actionStatus;
    return null;
  }
}
