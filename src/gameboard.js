export class Gameboard {
    constructor() {
        this.board = this.#generateBoard()
        this.ships = []
        this.areAllShipsSunked = false
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

    // Place ship on gameboard
    placeShip(ship, coord) {
        // Keeps track of current ships on gameboard.
        this.ships.push(ship)

        let [x, y] = coord

        if (x > 10 || y > 10) throw new Error('Out of bounds')

        // Starting coordinate, depending on the type of ship, the ship will populate a number of coordinates
        // where the total number of boxes occupied equals to its length.
        this.board[x][y] = ship.typeOfShip.split('')[0]

        let finalX = x + ship.length
        let finalY = y + ship.length

        // Add ships vertically by default
        // Takes first letter of ship type and marks it on gameboard.
        if (finalY > 10) {
            for (let i = 0; i < ship.length; i++) {
                this.board[x][y - i] = ship.typeOfShip.split('')[0]
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                this.board[x][y + i] = ship.typeOfShip.split('')[0]
            }
        }

        // Drag and drop option
        //...
    }

    // Receives a pair of coordinates and determines if any ships were attacked.
    receiveAttack(coord) {
        const [x, y] = coord

        const [ship] = this.ships.filter((elem) => {
            if (elem.typeOfShip.split('')[0] === this.board[x][y]) {
                return elem
            }
        })

        // If the coordinate is occupied by a type of ship, add it to hitsTaken property.
        if (ship) {
            ship.hitsTaken += 1

            // If hitsTaken equals to ship length then ship has sunken.
            if (ship.hitsTaken === ship.length) {
                ship.sunk = true
            }
        }

        // Mark on gameboard.
        this.board[x][y] = 'x'

        const allShipsSunk = this.ships.filter((ship) => {
            if (ship.sunk) return ship
        })

        // Gameboard to detect if all ships have sunked.
        if (allShipsSunk.length === this.ships.length) {
            this.areAllShipsSunked = true
        }
    }
}
