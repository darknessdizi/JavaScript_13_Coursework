import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import { generateTeam } from './generators';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';
import {
  getIndexPositions,
  getFieldMatrix,
  getСoordinates,
  compareLevel,
  compareDistance,
  countStep,
} from './utils';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';
import Team from './Team';
import themes from './themes';
import Character from './Character';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
  }

  init() {
    // localStorage.removeItem('state');
    if (this.gameState.firstRun) {
      this.gameState.firstRun = false;
      if (this.onLoadGame()) {
        return;
      }
    }
    const { countMembers } = this.gameState;
    const { level } = this.gameState;
    const { countThemes } = this.gameState;
    const listThemes = Object.values(themes);
    const index = (level - 1) - (countThemes * listThemes.length);
    const theme = listThemes[index];
    let teamPlayer;

    this.gamePlay.drawUi(theme);
    this.gameState.matrix = getFieldMatrix(this.gamePlay.boardSize);

    const positionIndexes = getIndexPositions(this.gamePlay.boardSize);

    if (!this.gameState.playerVictory) {
      if (!this.gameState.newGame) {
        if (this.gameState.addListener) {
          this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
          this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
          this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
          this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
          this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
          this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
          this.gameState.addListener = false;
        }
        const playerTypes = [Bowman, Swordsman, Magician];
        teamPlayer = generateTeam(playerTypes, level, countMembers);
      } else {
        const playerTypes = [Bowman, Swordsman, Magician];
        teamPlayer = generateTeam(playerTypes, level, countMembers);
      }
    } else {
      const list = this.gameState.players.map((item) => item.character);
      teamPlayer = new Team(list);
    }

    const evilTypes = [Daemon, Undead, Vampire];
    const teamEnemy = generateTeam(evilTypes, level, countMembers);

    const players = GameController.assignPositions(teamPlayer, positionIndexes.player);
    const enemies = GameController.assignPositions(teamEnemy, positionIndexes.enemy);
    this.gamePlay.redrawPositions([...players, ...enemies]);

    if (this.gameState.players.length > 0) {
      this.gameState.players.length = 0;
      this.gameState.playerTypes.length = 0;
    }

    this.gameState.players.push(...players);
    this.gameState.enemies.push(...enemies);

    const typesSet = new Set();
    teamPlayer.characters.forEach((element) => typesSet.add(element.type));
    this.gameState.playerTypes = Array.from(typesSet);

    typesSet.clear();
    teamEnemy.characters.forEach((element) => typesSet.add(element.type));
    this.gameState.enemyTypes = Array.from(typesSet);

    GamePlay.showScore(this.gameState.maxScore, this.gameState.score);
  }

  onCellClick(index) {
    if (this.gameState.animation) {
      return;
    }
    const arrayTeams = [...this.gameState.players, ...this.gameState.enemies];
    const unit = arrayTeams.find((item) => item.position === index);
    if (!this.gameState.cursorStatus) {
      // нажатие на ячейку с запрещающим знаком курсора
      GamePlay.showError('Недопустимое действие');
      return;
    }
    if ((!unit) && (this.gameState.unitAssign)) {
      // передвижение unit на новую ячейку
      const findUnit = arrayTeams.find((item) => item.position === this.gameState.lostIndex);
      const indexUnit = arrayTeams.indexOf(findUnit);
      arrayTeams[indexUnit].position = index;
      this.gamePlay.redrawPositions(arrayTeams);
      this.gamePlay.deselectCell(this.gameState.lostIndex);
      this.gamePlay.deselectCell(index);
      this.gameState.unitAssign = false;
      this.gameState.lostIndex = -1;
      this.gameState.point = { X: null, Y: null };
      this.gameState.step = undefined;
      this.gameState.stepAttack = undefined;

      if (this.gameState.stepUser) {
        this.gameState.stepUser = false;
      } else {
        this.gameState.stepUser = true;
      }

      this.gamePlay.setCursor(cursors.auto);
      if (!this.gameState.stepUser) {
        // передача хода противнику
        this.stepComputer();
      }
    }
    if (unit) {
      // действия если в нажатой ячейке присутствует unit
      const unitsTypes = {};
      if (this.gameState.stepUser) {
        unitsTypes.type = this.gameState.playerTypes;
        unitsTypes.enemy = this.gameState.enemies;
      } else {
        unitsTypes.type = this.gameState.enemyTypes;
        unitsTypes.enemy = this.gameState.players;
      }
      const userType = unitsTypes.type.includes(unit.character.type);
      if ((this.gameState.unitAssign) && (!userType)) {
        // нападаем на противника
        this.attackOnUnit(arrayTeams, index, unitsTypes);
        return;
      }
      if (userType) {
        // нажали клик на собственных игроков
        if (this.gameState.lostIndex > -1) {
          this.gamePlay.deselectCell(this.gameState.lostIndex);
        }
        this.gamePlay.selectCell(index);
        this.gameState.lostIndex = index;
        this.gameState.unitAssign = true;
        this.gameState.point = getСoordinates(index, this.gameState.matrix);
        this.gameState.step = unit.character.step;
        this.gameState.stepAttack = unit.character.stepAttack;
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        GamePlay.showError('Нельзя выбирать игроков противника');
      }
    }
  }

  onCellEnter(index) {
    let unitsTypes;
    if (this.gameState.stepUser) {
      unitsTypes = this.gameState.enemyTypes;
    } else {
      unitsTypes = this.gameState.playerTypes;
    }
    const arrayTeams = [...this.gameState.players, ...this.gameState.enemies];
    const unit = arrayTeams.find((item) => item.position === index);
    if (unit) {
      const message = GameController.getMessage(unit);
      this.gamePlay.showCellTooltip(message, index);
    }
    if (this.gameState.unitAssign) {
      this.gameState.cursorStatus = true;
      this.gamePlay.setCursor(cursors.pointer);
      const currentPoint = getСoordinates(index, this.gameState.matrix);
      const x = Math.abs(currentPoint.X - this.gameState.point.X);
      const y = Math.abs(currentPoint.Y - this.gameState.point.Y);
      const { step } = this.gameState;
      if (unit) {
        const { stepAttack } = this.gameState;
        if (unitsTypes.includes(unit.character.type)) {
          if ((x > stepAttack) || (y > stepAttack)) {
            this.gamePlay.setCursor(cursors.notallowed);
            this.gameState.cursorStatus = false;
          } else {
            this.gamePlay.setCursor(cursors.crosshair);
            this.gamePlay.selectCell(index, 'red');
          }
        }
      } else if (
        ((x <= step) && (this.gameState.point.Y === currentPoint.Y)) || (
          (y <= step) && (this.gameState.point.X === currentPoint.X)) || (
          (x <= step) && (x === y))
      ) {
        this.gamePlay.selectCell(index, 'green');
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
        this.gameState.cursorStatus = false;
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    const arrayTeams = [...this.gameState.players, ...this.gameState.enemies];
    const unit = arrayTeams.find((item) => item.position === index);
    if (this.gameState.unitAssign) {
      if (unit) {
        if (index === this.gameState.lostIndex) {
          return;
        }
      }
      this.gamePlay.deselectCell(index);
    }
  }

  reloadScore() {
    let data;
    try {
      data = this.stateService.load();
    } catch (error) {
      GamePlay.showError(error.message);
    }
    if (data) {
      if (this.gameState.maxScore > data.maxScore) {
        data.maxScore = this.gameState.maxScore;
        this.stateService.save(data);
      }
    }
  }

  onNewGame() {
    // Действия при нажатии кнопки New Game
    this.reloadScore();
    const { score, maxScore } = this.gameState;
    this.gameState = new GameState();
    if (score > maxScore) {
      this.gameState.maxScore = score;
    } else {
      this.gameState.maxScore = maxScore;
    }
    this.gameState.newGame = true;
    this.gameState.firstRun = false;
    this.gameState.addListener = false;
    this.init();
  }

  onSaveGame() {
    this.stateService.save(this.gameState);
  }

  onLoadGame() {
    let data;
    try {
      data = this.stateService.load();
    } catch (error) {
      GamePlay.showError(error);
      return false;
    }
    if (!data) {
      return false;
    }
    this.gameState.from(data);
    const { level } = this.gameState;
    const { countThemes } = this.gameState;
    const listThemes = Object.values(themes);
    const index = (level - 1) - (countThemes * listThemes.length);
    const theme = listThemes[index];

    this.gamePlay.drawUi(theme);
    const { players } = this.gameState;
    const { enemies } = this.gameState;
    this.gamePlay.redrawPositions([...players, ...enemies]);
    if (this.gameState.addListener) {
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
      this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
      this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
      this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
      this.gameState.addListener = false;
    }
    GamePlay.showScore(this.gameState.maxScore, this.gameState.score);
    return true;
  }

  static assignPositions(object, listIndex) {
    // Привязка членов всей команды к позициям на поле
    const result = [];
    for (let i = 0; i < object.characters.length; i += 1) {
      const player = object.characters[i];
      const index = Math.floor(Math.random() * listIndex.length);
      const position = listIndex[index];
      listIndex.splice(index, 1);
      const positionPlayer = new PositionedCharacter(player, position);
      result.push(positionPlayer);
    }
    return result;
  }

  static getMessage(unit) {
    const { level } = unit.character;
    const { attack } = unit.character;
    const { defence } = unit.character;
    const { health } = unit.character;
    return `\u{1F396} ${level} \u{2694} ${attack} \u{1F6E1} ${defence} \u{2764} ${health}`;
  }

  attackOnUnit(arrayTeams, index, unitsTypes) {
    // Метод осуществляет расчет и анимацию атаки на противника
    let attacker = arrayTeams.find((item) => item.position === this.gameState.lostIndex);
    attacker = attacker.character;

    let target = arrayTeams.find((item) => item.position === index);
    const indexTarget = arrayTeams.indexOf(target);
    target = target.character;
    let damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
    damage = Number(damage.toFixed(1));
    const result = this.gamePlay.showDamage(index, damage);
    this.gameState.animation = true;
    const { health } = arrayTeams[indexTarget].character;
    const newArrayTeam = [...arrayTeams];
    newArrayTeam[indexTarget].character.health = Number((health - damage).toFixed(1));
    const { lostIndex } = this.gameState;

    result.then(() => {
      this.gamePlay.redrawPositions(arrayTeams);
      this.gameState.animation = false;
      if (arrayTeams[indexTarget].character.health <= 0) {
        arrayTeams.splice(indexTarget, 1);
        this.gamePlay.redrawPositions(arrayTeams);
        const unit = unitsTypes.enemy.find((item) => item.position === index);
        const number = unitsTypes.enemy.indexOf(unit);
        if (this.gameState.stepUser) {
          this.gameState.score += unit.character.level * 100;
          this.gameState.enemies.splice(number, 1);
          if (this.gameState.score > this.gameState.maxScore) {
            this.gameState.maxScore = this.gameState.score;
          }
          GamePlay.showScore(this.gameState.maxScore, this.gameState.score);
        } else {
          this.gameState.players.splice(number, 1);
        }
      }

      if (this.gameState.stepUser) {
        this.gameState.stepUser = false;
      } else {
        this.gameState.stepUser = true;
      }

      if (!this.gameState.stepUser) {
        this.stepComputer();
      }
    });
    this.gameState.lostIndex = -1;
    this.gameState.unitAssign = false;
    this.gameState.point = { X: null, Y: null };
    this.gameState.step = undefined;
    this.gameState.stepAttack = undefined;
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.deselectCell(lostIndex);
    this.gamePlay.deselectCell(index);
  }

  stepComputer() {
    if (this.gameState.enemies.length === 0) {
      this.gameState.stepUser = true;
      this.upgradeUnits();
      this.gameState.playerVictory = true;
      let { level } = this.gameState;
      const listThemes = Object.values(themes);
      this.gameState.level += 1;
      level += 1;
      if (Number.isInteger((level - 1) / listThemes.length)) {
        this.gameState.countThemes += 1;
      }
      this.init();
      return;
    }
    const unit = this.inviteUnit();
    const cordsComputer = getСoordinates(unit.position, this.gameState.matrix);
    this.onCellClick(unit.position);

    const metric = this.countDistance(cordsComputer);
    const cordsTarget = getСoordinates(metric.position, this.gameState.matrix);

    if (metric.distance <= 0) {
      // атакуем врага в зоне поражения (если такой имеется)
      this.onCellClick(this.gameState.matrix[cordsTarget.X][cordsTarget.Y]);
      return;
    }

    const step = countStep(metric, unit);
    const { x, y } = this.getCordsMove(cordsComputer, cordsTarget, step);
    this.onCellClick(this.gameState.matrix[x][y]);
  }

  upgradeUnits() {
    // Метод повышает уровень и показатели персонажей команды игрока
    for (let i = 0; i < this.gameState.players.length; i += 1) {
      const obj = this.gameState.players[i];
      Character.levelUp.call(obj.character, 1);
    }
    this.gamePlay.redrawPositions(this.gameState.players);
  }

  inviteUnit() {
    // Метод выбирает unit по рангу классов и уровню персонажей.
    const rangTypes = {
      1: 'undead',
      2: 'vampire',
      3: 'daemon',
    };
    let listUnits;
    const { enemies } = this.gameState;
    for (const key in rangTypes) {
      if (Object.prototype.hasOwnProperty.call(rangTypes, key)) {
        listUnits = enemies.filter((item) => item.character.type === rangTypes[key]);
        if (listUnits.length > 0) break;
      }
    }

    listUnits.sort(compareLevel);
    return listUnits[0];
  }

  countDistance(cordsComputer) {
    // Метод вычисляет растояние до противников.
    // Возвращает дистанцию и позицию на ближайшего противника.
    const teamPlayers = this.gameState.players;
    const metric = [];

    teamPlayers.forEach((item) => {
      const target = getСoordinates(item.position, this.gameState.matrix);
      const targetX = Math.abs(cordsComputer.X - target.X);
      const targetY = Math.abs(cordsComputer.Y - target.Y);
      let distance;
      if (targetX <= this.gameState.stepAttack) {
        distance = targetY - this.gameState.stepAttack;
      } else if (targetY <= this.gameState.stepAttack) {
        distance = targetX - this.gameState.stepAttack;
      } else {
        distance = targetX - this.gameState.stepAttack + targetY - this.gameState.stepAttack;
      }

      metric.push(
        {
          distance,
          position: item.position,
        },
      );
    });
    metric.sort(compareDistance);
    return metric[0];
  }

  getCordsMove(cordsComputer, cordsTarget, step) {
    // Метод определяет координаты для следующего хода unit.
    // Возвращает координаты X и Y.
    const targetX = cordsComputer.X - cordsTarget.X;
    const targetY = cordsComputer.Y - cordsTarget.Y;
    const absTargetX = Math.abs(targetX);
    const absTargetY = Math.abs(targetY);
    const attack = this.gameState.stepAttack;
    let x;
    let y;
    if (absTargetX - attack <= 0) {
      x = cordsComputer.X;
      if (cordsComputer.Y > cordsTarget.Y) {
        y = cordsComputer.Y - step;
      } else {
        y = cordsComputer.Y + step;
      }
    } else if (absTargetY - attack <= 0) {
      y = cordsComputer.Y;
      if (cordsComputer.X > cordsTarget.X) {
        x = cordsComputer.X - step;
      } else {
        x = cordsComputer.X + step;
      }
    } else if ((absTargetX - attack >= step) && (absTargetY - attack >= step)) {
      if (targetX > 0) {
        x = cordsComputer.X - step;
      } else {
        x = cordsComputer.X + step;
      }
      if (targetY > 0) {
        y = cordsComputer.Y - step;
      } else {
        y = cordsComputer.Y + step;
      }
    } else if (absTargetX - attack >= absTargetY - attack) {
      y = cordsComputer.Y;
      if (cordsComputer.X > cordsTarget.X) {
        x = cordsComputer.X - step;
      } else {
        x = cordsComputer.X + step;
      }
    } else {
      x = cordsComputer.X;
      if (cordsComputer.Y > cordsTarget.Y) {
        y = cordsComputer.Y - step;
      } else {
        y = cordsComputer.Y + step;
      }
    }
    x = (x < 0) ? 0 : x;
    y = (y < 0) ? 0 : y;
    return { x, y };
  }
}
