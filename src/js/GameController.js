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

    const count = 8;
    const positionIndexes = getIndexPositions(this.gamePlay.boardSize);

    const playerTypes = [Bowman, Swordsman, Magician];
    const teamPlayer = generateTeam(playerTypes, 4, count);

    const evilTypes = [Daemon, Undead, Vampire];
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
    console.log(this.gameState); //
    const arrayTeams = [...this.gameState.players, ...this.gameState.enemies];
    const unit = arrayTeams.find((item) => item.position === index);
    if (!this.gameState.actionStatus) {
      GamePlay.showError('Недопустимое действие');
      return;
    }
    if (unit) {
      if (this.gameState.playerTypes.includes(unit.character.type)) {
        if (this.gameState.lostIndex > -1) {
          this.gamePlay.deselectCell(this.gameState.lostIndex);
        }
        this.gamePlay.selectCell(index);
        this.gameState.lostIndex = index;
        this.gameState.unitAssign = true;
        this.gameState.point = getСoordinates(index, this.gameState.matrix);
        this.gameState.step = unit.character.step;
        this.gameState.stepAttack = unit.character.stepAttack;
        console.log(unit, this.gameState.point);
      } else {
        if (this.gameState.lostIndex === -1) {
          GamePlay.showError('Нельзя выбирать игроков противника');
        }
      }
    } 
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const arrayTeams = [...this.gameState.players, ...this.gameState.enemies];
    const unit = arrayTeams.find((item) => item.position === index);
    if (unit) {
      const message = GameController.getMessage(unit);
      this.gamePlay.showCellTooltip(message, index);
    }
    if (this.gameState.unitAssign) {
      this.gameState.actionStatus = true;
      this.gamePlay.setCursor(cursors.pointer);
      const currentPoint = getСoordinates(index, this.gameState.matrix);
      console.log(currentPoint, this.gameState.point);
      const x = Math.abs(currentPoint.X - this.gameState.point.X);
      const y = Math.abs(currentPoint.Y - this.gameState.point.Y);
      const step = this.gameState.step;
      if (unit) {
        const stepAttack = this.gameState.stepAttack;
        if (index === this.gameState.lostIndex) {  }
        if (this.gameState.enemyTypes.includes(unit.character.type)) {
          if ((x > stepAttack) || (y > stepAttack)) {
            this.gamePlay.setCursor(cursors.notallowed);
            this.gameState.actionStatus = false;
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
        this.gameState.actionStatus = false;
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
}
