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
        let [x, y] = coord

        // ship.location.push(coord)

        // Check for out of bounds.
        if (x > 10 || y > 10) throw new Error('Out of bounds')

        // Check if space occupied by previously placed ships.
        this.ships.forEach((ship) => {
            if (ship.typeOfShip.split('')[0] === this.board[x][y]) throw new Error('Space occupied.')
        })

        // Starting coordinate, depending on the type of ship, the ship will populate a number of coordinates
        // where the total number of boxes occupied equals to its length.
        this.board[x][y] = ship.typeOfShip.split('')[0]

        let finalY = y + ship.length

        // Add ships horizontally by default
        // Takes first letter of ship type and marks it on gameboard.
        if (finalY > 10) {
            for (let i = 0; i < ship.length; i++) {
                this.board[x][y - i] = ship.typeOfShip.split('')[0]
                ship.location.push([x, y - i])
            }

            ship.location.reverse() // Store the coordinates in ascending order.
        } else {
            for (let i = 0; i < ship.length; i++) {
                this.board[x][y + i] = ship.typeOfShip.split('')[0]
                ship.location.push([x, y + i])
            }
        }

        // Keeps track of current ships on gameboard.
        this.ships.push(ship)

        // Drag and drop option
        //...
    }

    // Receives a pair of coordinates and determines if any ships were attacked.
    receiveAttack(coord) {
        const [x, y] = coord

        // Determines which ship is being attacked based on the coord that is passed to the method.
        const [ship] = this.ships.filter((elem) => {
            for (let loc of elem.location) {
                if (loc[0] === x && loc[1] === y) {
                    return elem
                }
            }
        })

        // If the coordinate is occupied by a type of ship, add it to hitsTaken property.
        if (ship) {
            ship.location.forEach((loc) => {
                let shipX = loc[0]
                let shipY = loc[1]

                if (shipX === x && shipY === y) {
                    // If ship is not sunked yet, register the attack, else don't add any more hits.
                    if (!ship.sunk) {
                        ship.hitsTaken += 1
                    }

                    // If hitsTaken equals to ship length then ship has sunken.
                    if (ship.hitsTaken === ship.length) {
                        ship.sunk = true
                    }
                }
            })
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

    // Flip ships from horizontal to vertical and vice versa.
    flip(ship) {
        console.log(ship.location)
        // let [x, y] = coord

        // let finalX = x + ship.length

        // let i = 1
        // if (finalX > 10) {
        //     while (i < ship.length) {
        //         x -= i
        //         this.board[x][y] = ship.typeOfShip.split('')[0]
        //         i++
        //     }
        // } else {
        //     while (i < ship.length) {
        //         x += i
        //         this.board[x][y] = ship.typeOfShip.split('')[0]
        //         i++
        //     }
        // }

        // return [x, y]
    }
}
