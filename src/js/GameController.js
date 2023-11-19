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
    this.gameState.actionStatus
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.boardSize = 10; // ***!!!!!*** убрать в конце
    this.gamePlay.drawUi('prairie');
    const div = document.querySelector('.board'); // ***!!!!!*** убрать в конце
    div.style.gridTemplateColumns = 'repeat(10, 1fr)'; // ***!!!!!*** убрать в конце
    this.gameState.matrix = getFieldMatrix(this.gamePlay.boardSize);

    const count = 8;
    const positionIndexes = getIndexPositions(this.gamePlay.boardSize);

    const playerTypes = [Bowman, Swordsman, Magician];
    const teamPlayer = generateTeam(playerTypes, 4, count);

    const evilTypes = [Daemon, Undead, Vampire];
    // const evilTypes = [Daemon, Vampire];
    const teamEnemy = generateTeam(evilTypes, 4, count);

    const players = GameController.assignPositionsCharacters(teamPlayer, positionIndexes.player);
    const enemies = GameController.assignPositionsCharacters(teamEnemy, positionIndexes.enemy);
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
    let unitsTypes;
    if (this.gameState.stepUser) {
      unitsTypes = this.gameState.playerTypes;
    } else {
      unitsTypes = this.gameState.enemyTypes;
    }
    const arrayTeams = [...this.gameState.players, ...this.gameState.enemies];
    console.log('Текущее состояние команд', arrayTeams);
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
        console.log('Ходит противник');
        this.stepComputer();
      }
    }
    if (unit) {
      console.log('Нажали на unit', unit);
      const userTypes = unitsTypes.includes(unit.character.type);
      if ((this.gameState.unitAssign) && (!userTypes)) {
        // нападаем на противника
        let attacker = arrayTeams.find((item) => item.position === this.gameState.lostIndex);
        attacker = attacker.character;
  
        let target = arrayTeams.find((item) => item.position === index);
        const indexTarget = arrayTeams.indexOf(target);
        target = target.character;
        const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1)
        const result = this.gamePlay.showDamage(index, damage);
        const health = arrayTeams[indexTarget].character.health;
        arrayTeams[indexTarget].character.health = health - damage;
        const oldIndex = this.gameState.lostIndex;
        result.then(() => {
          this.gamePlay.redrawPositions(arrayTeams);
        });
        this.gameState.lostIndex = -1;
        this.gameState.unitAssign = false;
        this.gameState.point = { X: null, Y: null };
        this.gameState.step = undefined;
        this.gameState.stepAttack = undefined;
        this.gameState.stepUser = this.gameState.stepUser ? false: true;
        this.gamePlay.setCursor(cursors.auto);
        this.gamePlay.deselectCell(oldIndex);
        this.gamePlay.deselectCell(index);
        if (!this.gameState.stepUser) {
          console.log('Ходит противник');
          this.stepComputer();
        }
        return;
      }
      if (userTypes) {
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
    // if (!this.gameState.stepUser) {
    //   console.log('Ходит противник');
    //   this.stepComputer();
    // } 
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

  stepComputer() {
    const ourTypes = {
      1: 'undead',
      2: 'vampire',
      3: 'daemon',
    }
    let listUnits;
    const arrayTeams = this.gameState.enemies;
    for (const key in ourTypes) {
      console.log(key);
      listUnits = arrayTeams.filter((item) => {
        console.log(item);
        return item.character.type == ourTypes[key];
      })
      if (listUnits.length > 0) {
        console.log(listUnits);
        break;
      }
    }

    listUnits.sort(this.compareLevel);
    console.log('*** Комп выбрал своего ударника', listUnits[0]);
    const cordsComputer = getСoordinates(listUnits[0].position, this.gameState.matrix);
    // setTimeout(() => {
      console.log('*** Координаты компа', cordsComputer);
      this.onCellClick(listUnits[0].position);
    // }, 1000);
    
    const teamPlayers = this.gameState.players;
    const metric = [];

    teamPlayers.forEach((item) => {
      const target = getСoordinates(item.position, this.gameState.matrix);
      console.log('target', target);
      let distance;
      const targetX = Math.abs(cordsComputer.X - target.X) - this.gameState.stepAttack;
      const targetY = Math.abs(cordsComputer.Y - target.Y) - this.gameState.stepAttack;
      
      if (targetX >= targetY) {
        distance = targetX;
      } else {
        distance = targetY;
      }

      metric.push(
        {
          distance: distance,
          position: item.position,
        }
      );
    });
    console.log('metric', metric);

    metric.sort(this.compareDistance);
    const cordsTarget = getСoordinates(metric[0].position, this.gameState.matrix);
    console.log('Наша цель', cordsTarget);
    console.log('Metric', metric[0]);
    if (metric[0].distance === 0) {
      // await setTimeout(() => {
        this.onCellClick(this.gameState.matrix[cordsTarget.X][cordsTarget.Y]);
      // }, 1000);
      return;
    }

    let x, y;
    let step;
    if (metric[0].distance > listUnits[0].character.stepAttack) {
      step = metric[0].distance;
    } else {
      step = listUnits[0].character.stepAttack;
    }
    if (cordsTarget.X === cordsComputer.X) {
      if (cordsComputer.Y > cordsTarget.Y) {
        y = cordsComputer.Y - step;
      } else {
        y = cordsComputer.Y + step;
      }
    } else if (cordsTarget.Y === cordsComputer.Y) {
      if (cordsComputer.X > cordsTarget.X) {
        x = cordsComputer.X - step;
      } else {
        x = cordsComputer.X + step;
      }
    } else {
      if (cordsComputer.X > cordsTarget.X) {
        x = cordsComputer.X - step;
      } else {
        x = cordsComputer.X + step;
      }
      if (cordsComputer.Y > cordsTarget.Y) {
        y = cordsComputer.Y - step;
      } else {
        y = cordsComputer.Y + step;
      }
    }
    console.log('Go to', x, y)
    // await setTimeout(() => {
      this.onCellClick(this.gameState.matrix[x][y]);
    // }, 1000);
    
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

// *** Комп выбрал своего ударника p {character: u, position: 36}
// main.js:1 *** Координаты компа {X: 3, Y: 6}
// main.js:1 Текущее состояние команд (16) [p, p, p, p, p, p, p, p, p, p, p, p, p, p, p, p]
// main.js:1 Нажали на unit p {character: u, position: 36}
// main.js:1 metric (8) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]0: {distance: -4, position: 68}1: {distance: 3, position: 41}2: {distance: 3, position: 11}3: {distance: 3, position: 31}4: {distance: 3, position: 71}5: {distance: 4, position: 40}6: {distance: 4, position: 70}7: {distance: 4, position: 80}length: 8[[Prototype]]: Array(0)
// main.js:1 Наша цель {X: 6, Y: 8}
// main.js:1 Metric {distance: -4, position: 68}
// main.js:1 Go to -1 2