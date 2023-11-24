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
    this.stepUser = object.stepUser;
    this.lostIndex = object.lostIndex;
    this.players = object.players;
    this.enemies = object.enemies;
    this.playerTypes = object.playerTypes;
    this.enemyTypes = object.enemyTypes;
    this.unitAssign = object.unitAssign;
    this.point = object.point;
    this.matrix = object.matrix;
    this.cursorStatus = object.cursorStatus;
    this.step = object.step;
    this.stepAttack = object.stepAttack;
    this.animation = object.animation;
    this.playerVictory = object.playerVictory;
    this.countMembers = object.countMembers;
    this.level = object.level;
    this.countThemes = object.countThemes;
    this.newGame = object.newGame;
    this.score = object.score;
    this.maxScore = object.maxScore;
    return null;
  }
}
