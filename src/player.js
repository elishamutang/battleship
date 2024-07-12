import { Gameboard } from './gameboard'

// Two types of players, "real" players and "computer" players.
export class Player {
    constructor() {
        this.gameboard = new Gameboard()
    }
}
