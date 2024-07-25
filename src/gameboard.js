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

        // Check for out of bounds.
        if (x > 10 || y > 10) throw new Error('Out of bounds')

        // Check if space occupied by previously placed ships.
        // this.ships.forEach((ship) => {
        //     if (ship.typeOfShip.split('')[0] === this.board[x][y]) {
        //         console.log('hi')
        //         return
        //     }
        // })

        for (let i = 0; i < this.ships.length; i++) {
            const theShip = this.ships[i]

            if (theShip.typeOfShip.split('')[0] === this.board[x][y]) {
                // console.log(x, y)
                // console.log(this.board[x][y])
                return
            }
        }

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
        // Dissect the starting ship coordinate and store in variables x & y.
        let [x, y] = ship.location[0]

        // Calculate the end coordinate of the ship.
        let finalX = x + ship.length

        // Generate the locations of each tile that the ship will occupy.
        let shipTilePath = []

        if (finalX > 10) {
            for (let i = 1; i < ship.length; i++) {
                shipTilePath.push([x - i, y])
            }
        } else {
            for (let i = 1; i < ship.length; i++) {
                shipTilePath.push([x + i, y])
            }
        }

        // Check if ship pathway will overlap with other ships.
        // If no ships will overlap, noNaN will result to true.
        const noNaN = shipTilePath
            .map((tile) => {
                let coordX = tile[0]
                let coordY = tile[1]

                let tileContent =
                    typeof this.board[coordX][coordY] === 'number'
                        ? this.board[coordX][coordY]
                        : parseInt(this.board[coordX][coordY].split('')[0])

                return tileContent
            })
            .every((tile) => {
                return !isNaN(tile)
            })

        // If the pathway of the ship will not overlap with any other ships, render the new orientation of the ship.
        if (noNaN) {
            // Remove every other coordinate AFTER the starting coordinate.
            ship.location = ship.location.slice(0, 1)

            shipTilePath.forEach((tile) => {
                let tileX = tile[0]
                let tileY = tile[1]

                this.board[tileX][tileY] = ship.typeOfShip.split('')[0]

                ship.location.push(tile)
            })

            ship.location.sort()
        } else {
            // Maintain original orientation.
            ship.location.forEach((loc) => {
                let locX = loc[0]
                let locY = loc[1]

                this.board[locX][locY] = ship.typeOfShip.split('')[0]
            })
        }

        console.log(ship)

        return shipTilePath.pop()
    }
}
