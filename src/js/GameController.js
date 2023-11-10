import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import { generateTeam } from './generators';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi('prairie');

    const count = 8;

    const playerTypes = [Bowman, Swordsman, Magician]; 
    const teamPlayer = generateTeam(playerTypes, 4, count);
    console.log(teamPlayer.characters);

    const evilTypes = [Daemon, Undead, Vampire];
    const teamEnemy = generateTeam(evilTypes, 4, count);
    console.log(teamEnemy.characters);

    const listIndex = {
      player: [],
      enemy: [],
    };

    for (let i = 0; i < this.gamePlay.boardSize ** 2; i++) {
      const step = this.gamePlay.boardSize - 1;
      if (Number.isInteger(i / this.gamePlay.boardSize)) {
        listIndex.player.push(i);
        listIndex.player.push(i + 1);
        listIndex.enemy.push(i + step - 1);
        listIndex.enemy.push(i + step);
      }
    }

    const positionedCharacter = [];
    for (let i = 0; i < count; i++) {
      const player = teamPlayer.characters[i];
      let index = Math.floor(Math.random() * listIndex.player.length);
      let position = listIndex.player[index];
      listIndex.player.splice(index, 1);
      const positionPlayer = new PositionedCharacter(player, position)
      positionedCharacter.push(positionPlayer);

      const enemy = teamEnemy.characters[i];
      index = Math.floor(Math.random() * listIndex.enemy.length);
      position = listIndex.enemy[index];
      listIndex.enemy.splice(index, 1);
      const positionEnemy = new PositionedCharacter(enemy, position);
      positionedCharacter.push(positionEnemy);
    }

    this.gamePlay.redrawPositions(positionedCharacter);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
