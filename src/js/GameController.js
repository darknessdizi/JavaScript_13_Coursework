import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import { generateTeam } from './generators';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';
import { getIndexPositions } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.boardSize = 10; // ***!!!!!*** убрать в конце
    this.gamePlay.drawUi('prairie');
    const div = document.querySelector('.board'); // ***!!!!!*** убрать в конце
    div.style.gridTemplateColumns = 'repeat(10, 1fr)'; // ***!!!!!*** убрать в конце

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

    const obj = {
      players,
      enemies,
    };
    this.stateService.save(obj);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const gameState = this.stateService.load();
    const arrayTeams = [...gameState.players, ...gameState.enemies];
    const unit = arrayTeams.find((item) => item.position === index);
    if (unit) {
      const message = GameController.getMessage(unit);
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    // this.gamePlay.hideCellTooltip(index);
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
