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

        let [x, y] = coord

        if (x > 10 || y > 10) throw new Error('Out of bounds')

        // Starting coordinate, depending on the type of ship, the ship will populate a number of coordinates
        // where the total number of coordinates occupied equals to its length.
        this.board[x][y] = ship.typeOfShip.split('')[0]

        let finalX = x + ship.length
        let finalY = y + ship.length

        // Add ships vertically by default
        if (finalY > 10) {
            for (let i = 0; i < ship.length; i++) {
                this.board[x][y - i] = ship.typeOfShip.split('')[0]
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                this.board[x][y + i] = ship.typeOfShip.split('')[0]
            }
        }
    }

    receiveAttack() {
        // Should take a pair of coordinates, determines if the ship is attacked or not
    }
}
