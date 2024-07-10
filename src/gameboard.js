export class Gameboard {
    constructor() {
        this.board = this.#generateBoard()
        this.ships = []
    }

    #generateBoard() {
        const board = Array(11)
            .fill(0)
            .map((elem) => {
                elem = Array(11).fill(0)
                return elem
            })

        return board
    }

    placeShip(ship, coord) {
        // Place ship on gameboard
        this.ships.push(ship)

        let x = coord[0]
        let y = coord[1]

        this.board[x][y] = 'x'
    }

    receiveAttack() {
        // Should take a pair of coordinates, determines if the ship is attacked or not
    }
}
