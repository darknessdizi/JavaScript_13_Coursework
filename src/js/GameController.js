import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import { characterGenerator, generateTeam } from './generators';
import Character from './Character';
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

    const playerTypes = [Bowman, Swordsman, Magician]; 
    const teamPlayer = generateTeam(playerTypes, 4, 4);
    console.log(teamPlayer.characters);
    const positionedCharacter = [];
    let i = 0;
    for (let item of teamPlayer.characters) {
      console.log(item)
      positionedCharacter.push(new PositionedCharacter(item, i));
      i++;
    }
    // const positionedCharacter = new PositionedCharacter(teamPlayer.characters[0], 8);
    this.gamePlay.redrawPositions(positionedCharacter)

    const evilTypes = [Daemon, Undead, Vampire];
    const teamEnemy = generateTeam(evilTypes, 4, 4);
    console.log(teamEnemy.characters);
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
