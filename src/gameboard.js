export class Gameboard {
    constructor() {
        this.board = this.#generateBoard()
        this.ships = []
    }

    static areAllShipsSunked = false

    // Consider to change this private method to a static method.
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

        // Check for out of bounds (this code may be redundant for now, wait till Drag n Drop feature is implemented).
        if (x > 10 || y > 10) throw new Error('Out of bounds')

        // Check if space occupied by previously placed ships.
        for (let i = 0; i < this.ships.length; i++) {
            const theShip = this.ships[i]

            if (theShip.typeOfShip.split('')[0] === this.board[x][y]) {
                return
            }
        }

        // Get the last Y (or column) coordinate to check whether we are still within the range of the gameboard.
        let finalY = y + ship.length

        // Generate the locations of each tile that the ship will occupy.
        let shipTilePath = []

        // Add ships horizontally by default
        // Map out the pathway of the ship by generating all the tile coordinates that it will occupy and store in shipTilePath array.
        if (finalY > 10) {
            for (let i = 0; i < ship.length; i++) {
                shipTilePath.push([x, y - i])
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                shipTilePath.push([x, y + i])
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

        // FIX THIS !*
        // If the pathway of the ship will not overlap with any other ships, render the ship.
        if (noNaN) {
            // Generate ship boundary to allow for a single box gap between each ship.
            this.#generateShipBoundary(ship, shipTilePath)

            ship.location = shipTilePath
            ship.location.sort()

            // Check if ship that is being placed is within any other ship's boundary.
            if (!this.#checkBoundary(ship)) {
                const randomizer = () => {
                    return Math.floor(Math.random() * 10)
                }

                const newCoord = [randomizer(), randomizer()]

                // this.placeShip(ship, newCoord)

                console.log(ship)
            }
            shipTilePath.forEach((tile) => {
                let tileX = tile[0]
                let tileY = tile[1]

                this.board[tileX][tileY] = ship.typeOfShip.split('')[0]
            })
        } else {
            // If ship overlaps, do something here. Re-assign new coordinates/location to the ship.
            console.log('Ship overlap and within boundary')
        }

        // Keeps track of current ships on gameboard.
        this.ships.push(ship)

        console.log(this.ships)
        // Drag and drop option
        //...
    }

    #generateShipBoundary(ship, shipTilePath) {
        for (let i = 0; i < shipTilePath.length; i++) {
            let coordX = shipTilePath[i][0]
            let coordY = shipTilePath[i][1]

            ship.boundary.push([coordX - 1, coordY]) // Top
            ship.boundary.push([coordX - 1, coordY + 1]) // Top right
            ship.boundary.push([coordX, coordY + 1]) // Right
            ship.boundary.push([coordX + 1, coordY + 1]) // Bottom right
            ship.boundary.push([coordX + 1, coordY]) // Bottom
            ship.boundary.push([coordX + 1, coordY - 1]) // Bottom left
            ship.boundary.push([coordX, coordY - 1]) // Left
            ship.boundary.push([coordX - 1, coordY - 1]) // Top left
        }

        // Filter for out of bounds.
        ship.boundary = ship.boundary.filter((coord) => {
            if (coord[0] >= 0 && coord[1] >= 0 && coord[0] < 10 && coord[1] < 10) {
                return coord
            }
        })

        // Remove ship.location coordinates from ship.boundary array.
        for (let i = 0; i < ship.boundary.length; i++) {
            let boundaryX = ship.boundary[i][0]
            let boundaryY = ship.boundary[i][1]

            for (let j = 0; j < shipTilePath.length; j++) {
                let locX = shipTilePath[j][0]
                let locY = shipTilePath[j][1]

                if (boundaryX === locX && boundaryY === locY) {
                    ship.boundary.splice(i, 1)
                }
            }
        }

        // Remove duplicates in ship.boundary array
        const removeDuplicates = (arr) => {
            let seen = {}
            let returnArr = []

            for (let i = 0; i < arr.length; i++) {
                if (!(arr[i] in seen)) {
                    returnArr.push(arr[i])
                    seen[arr[i]] = true
                }
            }

            return returnArr
        }

        // Update new ship boundary array.
        ship.boundary = removeDuplicates(ship.boundary)
    }

    // If true, ship that is being placed is out of boundary from other ships. Else, it is being placed within the boundary of some ship(s).
    #checkBoundary(ship) {
        const locationContent = []
        let outOfBoundary = true

        for (let coord of ship.boundary) {
            let x = coord[0]
            let y = coord[1]

            locationContent.push(this.board[x][y])
        }

        outOfBoundary = locationContent.every((elem) => {
            return elem.length > 1
        })

        return outOfBoundary
    }

    #findShip(coord) {
        const [x, y] = coord

        const [ship] = this.ships.filter((elem) => {
            for (let loc of elem.location) {
                if (loc[0] === x && loc[1] === y) {
                    return elem
                }
            }
        })

        return ship
    }

    // Receives a pair of coordinates and determines if any ships were attacked.
    receiveAttack(coord) {
        const [x, y] = coord

        // Determines which ship is being attacked based on the coord that is passed to the method.
        const ship = this.#findShip(coord)

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
            Gameboard.areAllShipsSunked = true
        }
    }

    // Flip ships from horizontal to vertical and vice versa.
    flip(ship) {
        let [x, y] = ship.location[0] // Dissect the starting ship coordinate and store in variables x & y.
        let [x1, y1] = ship.location[1] // Get adjacent coordinate to compare whether ship is currently placed horizontal or vertical.

        // Generate the locations of each tile that the ship will occupy.
        let shipTilePath = []

        // Horizontal to vertical
        if (y1 !== y) {
            // Calculate the end coordinate of the ship.
            let finalX = x + ship.length

            if (finalX > 10) {
                for (let i = 1; i < ship.length; i++) {
                    shipTilePath.push([x - i, y])
                }
            } else {
                for (let i = 1; i < ship.length; i++) {
                    shipTilePath.push([x + i, y])
                }
            }
        }

        // Veritcal to horizontal
        if (x1 !== x) {
            // Calculate the end coordinate of the ship.
            let finalY = y + ship.length

            if (finalY > 10) {
                for (let i = 1; i < ship.length; i++) {
                    shipTilePath.push([x, y - i])
                }
            } else {
                for (let i = 1; i < ship.length; i++) {
                    shipTilePath.push([x, y + i])
                }
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
        } else {
            // Maintain original orientation.
            ship.location.forEach((loc) => {
                let locX = loc[0]
                let locY = loc[1]

                this.board[locX][locY] = ship.typeOfShip.split('')[0]
            })
        }

        return shipTilePath.pop()
    }
}
