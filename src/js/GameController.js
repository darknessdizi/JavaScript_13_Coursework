import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import { generateTeam } from './generators';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';
import { getIndexPositions, getFieldMatrix, getСoordinates } from './utils';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.boardSize = 10; // ***!!!!!*** убрать в конце
    this.gamePlay.drawUi('prairie');
    const div = document.querySelector('.board'); // ***!!!!!*** убрать в конце
    div.style.gridTemplateColumns = 'repeat(10, 1fr)'; // ***!!!!!*** убрать в конце
    this.gameState.matrix = getFieldMatrix(this.gamePlay.boardSize);

    const count = 1;
    const positionIndexes = getIndexPositions(this.gamePlay.boardSize);

    const playerTypes = [Bowman, Swordsman, Magician];
    // const playerTypes = [Swordsman];
    const teamPlayer = generateTeam(playerTypes, 1, 8);

    // const evilTypes = [Daemon, Undead, Vampire];
    // const evilTypes = [Daemon, Vampire];
    const evilTypes = [Undead];
    const teamEnemy = generateTeam(evilTypes, 1, count);

    const players = GameController.assignPositionsCharacters(teamPlayer, positionIndexes.player);
    const enemies = GameController.assignPositionsCharacters(teamEnemy, positionIndexes.enemy);
    //// ++++++++++++++++++++++++++++++++++++
    // players[0].position = 90;
    // enemies[0].position = 9;
    // players[0].position = 0;
    // enemies[0].position = 99;
    // players[0].position = 43;
    // enemies[0].position = 12;
    // players[0].position = 59;
    // enemies[0].position = 46;
    // players[0].position = 45;
    // enemies[0].position = 40;
    // players[0].position = 5;
    // enemies[0].position = 37;
    //// ++++++++++++++++++++++++++++++++++++
    console.log(players)
    this.gamePlay.redrawPositions([...players, ...enemies]);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gameState.players.push(...players);
    this.gameState.enemies.push(...enemies);

    const typesSet = new Set();
    teamPlayer.characters.forEach(element => {
      typesSet.add(element.type);
    });
    this.gameState.playerTypes = Array.from(typesSet);

    typesSet.clear();

    teamEnemy.characters.forEach(element => {
      typesSet.add(element.type);
    });
    this.gameState.enemyTypes = Array.from(typesSet);
  }

  onCellClick(index) {
    // TODO: react to click
    if (this.gameState.animation) {
      return;
    }
    if (this.gameState.stepUser) {
      console.log('-----------------------------');
      console.log('Ходит игрок');
    }
    const arrayTeams = [...this.gameState.players, ...this.gameState.enemies];
    // console.log('Текущее состояние команд', arrayTeams);
    const unit = arrayTeams.find((item) => item.position === index);
    if (!this.gameState.cursorStatus) {
      // нажатие на ячейку с запрещающим знаком курсора
      GamePlay.showError('Недопустимое действие');
      return;
    }
    if ((!unit) && (this.gameState.unitAssign)) {
      // передвижение unit на новую ячейку
      console.log('Переместился на другую клекту');
      const findUnit = arrayTeams.find((item) => item.position === this.gameState.lostIndex);
      const indexUnit = arrayTeams.indexOf(findUnit);
      // console.log('ошибка', arrayTeams[indexUnit]);
      arrayTeams[indexUnit].position = index;
      this.gamePlay.redrawPositions(arrayTeams);
      this.gamePlay.deselectCell(this.gameState.lostIndex);
      this.gamePlay.deselectCell(index);
      this.gameState.unitAssign = false;
      this.gameState.lostIndex = -1;
      this.gameState.point = { X: null, Y: null };
      this.gameState.step = undefined;
      this.gameState.stepAttack = undefined;
      this.gameState.stepUser = this.gameState.stepUser ? false: true;
      this.gamePlay.setCursor(cursors.auto);
      if (!this.gameState.stepUser) {
        console.log('-----------------------------');
        console.log('Ходит противник');
        this.stepComputer();
      }
    }
    if (unit) {
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
        console.log('Напал на противника', unit);
        this.attackOnUnit(arrayTeams, index, unitsTypes);
        console.log('Сейчас будет ретурн для онклик');
        return;
      }
      if (userType) {
        console.log('Выбрал себе unit (нажал на него)', unit);
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
    // TODO: react to mouse enter
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
      const step = this.gameState.step;
      if (unit) {
        const stepAttack = this.gameState.stepAttack;
        if (index === this.gameState.lostIndex) {  }
        if (unitsTypes.includes(unit.character.type)) {
          if ((x > stepAttack) || (y > stepAttack)) {
            this.gamePlay.setCursor(cursors.notallowed);
            this.gameState.cursorStatus = false;
            // console.log('1 test', this.gameState.cursorStatus);
          } else {
            this.gamePlay.setCursor(cursors.crosshair);
            this.gamePlay.selectCell(index, 'red');
          }
        }
      } else if (
          (x <= step) && (this.gameState.point.Y === currentPoint.Y) ||
          (y <= step) && (this.gameState.point.X === currentPoint.X) ||
          (x <= step) && (x === y)
        ) {
        this.gamePlay.selectCell(index, 'green');
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
        this.gameState.cursorStatus = false;
        // console.log('2 test', this.gameState.cursorStatus);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
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

  static assignPositionsCharacters(object, listIndex) {
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
    console.log('Сейчас погибнет', target);
    const indexTarget = arrayTeams.indexOf(target);
    target = target.character;
    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1)
    const result = this.gamePlay.showDamage(index, damage);
    this.gameState.animation = true;
    const health = arrayTeams[indexTarget].character.health;
    arrayTeams[indexTarget].character.health = health - damage;
    const oldIndex = this.gameState.lostIndex;
    
    result.then(() => {
      this.gamePlay.redrawPositions(arrayTeams);
      this.gameState.animation = false;
      if (arrayTeams[indexTarget].character.health <= 0) {
        arrayTeams.splice(indexTarget, 1);
        this.gamePlay.redrawPositions(arrayTeams);
        const unit = unitsTypes.enemy.find((item) => item.position === index);
        const number = unitsTypes.enemy.indexOf(unit);
        console.log('Зашли в раздел');
        if (this.gameState.stepUser) {
          this.gameState.enemies.splice(number, 1);
        } else {
          this.gameState.players.splice(number, 1);
        }
        console.log('Unit погибает');
      }
      
      this.gameState.stepUser = this.gameState.stepUser ? false: true;
      console.log('Прошла асинхронка', this.gameState);
      if (!this.gameState.stepUser) {
        console.log('-----------------------------');
        console.log('Ходит противник');
        this.stepComputer();
      }
    });
    this.gameState.lostIndex = -1;
    this.gameState.unitAssign = false;
    this.gameState.point = { X: null, Y: null };
    this.gameState.step = undefined;
    this.gameState.stepAttack = undefined;
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.deselectCell(oldIndex);
    this.gamePlay.deselectCell(index);
  }

  stepComputer() {
    console.log('Живые противники', this.gameState.enemies.length);
    if (this.gameState.enemies.length === 0) {
      console.log('Все противники погибли');
      this.gameState.stepUser = true;
      this.upgradeUnits();
      return;
    }
    const unit = this.inviteUnit();
    // console.log('*** Комп выбрал своего ударника', unit);
    const cordsComputer = getСoordinates(unit.position, this.gameState.matrix);
    // console.log('*** Координаты компа', cordsComputer);
    this.onCellClick(unit.position); // нажимаем на нашего unit

    const metric = this.countDistance(cordsComputer);
    const cordsTarget = getСoordinates(metric.position, this.gameState.matrix);
    // console.log('Наша цель', cordsTarget);
    // console.log('Metric', metric);

    if (metric.distance <= 0) {
      // атакуем врага в зоне поражения (если такой имеется)
      this.onCellClick(this.gameState.matrix[cordsTarget.X][cordsTarget.Y]);
      return;
    }

    const step = this.countStep(metric, unit);
    // console.log('Размер нашего шага компьютера', step, 'Атака', this.gameState.stepAttack);
    const { x, y } = this.getCordsMove(cordsComputer, cordsTarget, step);
    // console.log('Go to', x, y)
    this.onCellClick(this.gameState.matrix[x][y]);
  }

  upgradeUnits() {
    // Метод повышает показатели персонажей команды игрока
    console.log('****************************************');
    console.log('Новый уровень', this.gameState);
    for (const index in this.gameState.players) {
      this.gameState.players[index].character.level += 1;

      const { attack } = this.gameState.players[index].character;
      const { defence } = this.gameState.players[index].character;
      const { health } = this.gameState.players[index].character;

      this.gameState.players[index].character.attack = Math.max(attack, attack * (80 + health) / 100);
      this.gameState.players[index].character.defence = Math.max(defence, defence * (80 + health) / 100);

      this.gameState.players[index].character.health += 80;
      if (this.gameState.players[index].character.health > 100) {
        this.gameState.players[index].character.health = 100;
      }
    }
    this.gamePlay.redrawPositions(this.gameState.players);
  }

  inviteUnit() {
    // Метод выбирает unit по рангу классов и уровню персонажей.
    const rangTypes = {
      1: 'undead',
      2: 'vampire',
      3: 'daemon',
    }
    let listUnits;
    const arrayTeams = this.gameState.enemies;
    for (const key in rangTypes) {
      // console.log(key);
      listUnits = arrayTeams.filter((item) => {
        // console.log(item);
        return item.character.type === rangTypes[key];
      })
      if (listUnits.length > 0) {
        // console.log(listUnits);
        break;
      }
    }

    listUnits.sort(this.compareLevel);
    return listUnits[0];
  }

  countDistance(cordsComputer) {
    // Метод вычисляет растояние до противников.
    // Возвращает дистанцию и позицию на ближайшего противника.
    const teamPlayers = this.gameState.players;
    const metric = [];

    teamPlayers.forEach((item) => {
      const target = getСoordinates(item.position, this.gameState.matrix);
      // console.log('target', target);
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
          distance: distance,
          position: item.position,
        }
      );
    });
    // console.log('metric', metric);
    metric.sort(this.compareDistance);
    return metric[0];
  }

  countStep(metric, unit) {
    // Метод вычисляет шаг для движения unit. Возращает значение шага.
    let step;
    if (metric.distance >= unit.character.stepAttack) {
      if (metric.distance > unit.character.step) {
        step = unit.character.step;
      } else {
        step = metric.distance;
      }
    } else {
      if (metric.distance > unit.character.step) {
        step = unit.character.step;
      } else {
        step = metric.distance;
      }
    }
    return step;
  }

  getCordsMove(cordsComputer, cordsTarget, step) {
    // Метод определяет координаты для следующего хода unit.
    // Возвращает координаты X и Y.
    const targetX = cordsComputer.X - cordsTarget.X;
    const targetY = cordsComputer.Y - cordsTarget.Y; 
    // console.log('targetX', targetX, 'targetY', targetY);
    const absTargetX = Math.abs(targetX);
    const absTargetY = Math.abs(targetY);
    const attack = this.gameState.stepAttack;
    let x, y;
    if (absTargetX - attack <= 0) {
      // console.log('1 enter ******');
      x = cordsComputer.X
      if (cordsComputer.Y > cordsTarget.Y) {
        y = cordsComputer.Y - step;
      } else {
        y = cordsComputer.Y + step;
      }
    } else if (absTargetY - attack <= 0) {
      // console.log('2 enter ******');
      y = cordsComputer.Y
      if (cordsComputer.X > cordsTarget.X) {
        x = cordsComputer.X - step;
      } else {
        x = cordsComputer.X + step;
      }
    } else if ((absTargetX - attack >= step) && (absTargetY - attack >= step)) {
      // console.log('5 enter ******');
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
      // console.log('3 enter ******');
      y = cordsComputer.Y
      if (cordsComputer.X > cordsTarget.X) {
        x = cordsComputer.X - step;
      } else {
        x = cordsComputer.X + step;
      }
    } else {
      // console.log('4 enter ******');
      x = cordsComputer.X
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

  compareLevel(a, b) {
    if (a.character.level > b.character.level) return -1;
    if (a.character.level === b.character.level) return 0;
    if (a.character.level < b.character.level) return 1;
  }

  compareDistance(a, b) {
    if (a.distance > b.distance) return 1;
    if (a.distance === b.distance) return 0;
    if (a.distance < b.distance) return -1;
  }

}
