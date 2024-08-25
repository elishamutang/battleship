export default class Gameboard {
    constructor() {
        this.board = this.#generateBoard()
        this.ships = []
        this.areAllShipsSunked = false
    }

    #generateBoard() {
        const board = Array(10)
            .fill(0)
            .map((elem) => {
                elem = Array(10).fill(0)
                return elem
            })

        return board
    }

    // Place ship on gameboard
    placeShip(ship, coord, vertical) {
        let [x, y] = coord

        // Get the last Y (column) or X (row) coordinate to check whether we are still within the range of the gameboard.
        let finalY = y + ship.length
        let finalX = x + ship.length

        // Generate the locations of each tile that the ship will occupy.
        let shipTilePath = []

        // Add ships horizontally by default
        // Map out the pathway of the ship by generating all the tile coordinates that it will occupy and store in shipTilePath array.
        if (!vertical) {
            if (finalY > 10) {
                for (let i = 0; i < ship.length; i++) {
                    shipTilePath.push([x, y - i])
                }
            } else {
                for (let i = 0; i < ship.length; i++) {
                    shipTilePath.push([x, y + i])
                }
            }
        } else {
            console.log('vertical')
            if (finalX > 10) {
                for (let i = 0; i < ship.length; i++) {
                    shipTilePath.push([x - i, y])
                }
            } else {
                for (let i = 0; i < ship.length; i++) {
                    shipTilePath.push([x + i, y])
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

        // Generate random coordinates if overlapping or within other ships' boundary.
        const randomizer = () => {
            return Math.floor(Math.random() * 10)
        }

        // If the pathway of the ship will not overlap with any other ships, render the ship and add it to ships array.
        // Else, provide a new coordinate and run placeShip method recursively.
        if (noNaN) {
            // Generate ship boundary to allow for a single box gap between each ship.
            ship.boundary = []
            this.#generateShipBoundary(ship, shipTilePath)

            ship.location = shipTilePath
            ship.location.sort()

            // Check if ship that is being placed is within any other ship's boundary.
            // If it is, run placeShip method recursively with a new random-generated coordinate.
            if (!this.#checkBoundary(ship)) {
                const newCoord = [randomizer(), randomizer()]

                this.placeShip(ship, newCoord)
                this.flip(ship)
            } else {
                ship.location.forEach((tile) => {
                    let tileX = tile[0]
                    let tileY = tile[1]

                    this.board[tileX][tileY] = ship.typeOfShip.split('')[0]
                })

                // Keeps track of current ships on gameboard.
                this.ships.push(ship)
            }
        } else {
            // If ship overlaps, re-assign new coordinates/location to the ship.
            console.log('Ship overlap with other ships')

            let newCoord = [randomizer(), randomizer()]

            this.placeShip(ship, newCoord)
            this.flip(ship)
        }
    }

    removeShip(ship) {
        // Remove from gameboard
        ship.location.forEach((loc) => {
            const row = loc[0]
            const col = loc[1]

            this.board[row][col] = 0
        })

        // Remove from ships array
        const shipIdx = this.ships.findIndex((elem) => {
            return elem === ship
        })

        this.ships.splice(shipIdx, 1)
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

        // Update new ship boundary array.
        ship.boundary = removeDuplicates(ship.boundary)
    }

    // If true, ship that is being placed is out of boundary from other ships. Else, it is being placed within the boundary of some ship(s).
    #checkBoundary(ship) {
        const locationContent = []

        for (let coord of ship.boundary) {
            let x = coord[0]
            let y = coord[1]

            locationContent.push(this.board[x][y])
        }

        // Use noNaN implementation here, similar to what was done in placeShip and generateBoundary methods.
        const outOfBoundary = ship.boundary
            .map((coord) => {
                let x = coord[0]
                let y = coord[1]

                let content =
                    typeof this.board[x][y] === 'number' ? this.board[x][y] : parseInt(this.board[x][y].split('')[0])

                return content
            })
            .every((elem) => {
                return !isNaN(elem)
            })

        return outOfBoundary
    }

    #findShip(x, y) {
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
        const x = parseInt(coord[0])
        const y = parseInt(coord[1])

        // Determines which ship is being attacked based on the coord that is passed to the method.
        const ship = this.#findShip(x, y)

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
        this.board[x][y] = 'X'

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
        // Generate reference gameboard
        let referenceGameboard = this.#generateBoard()

        if (ship.location.length > 1) {
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

            // Check if ship's flipped pathway will overlap with other ships.
            // If pathway will not overlap, noNaN will result to true.
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

            // Insert initial ship starting coordinate at the beginning of shipTilePath array.
            shipTilePath.unshift(...ship.location.slice(0, 1))

            // Reset ship boundary
            ship.boundary = []

            // Generate new boundary
            this.#generateShipBoundary(ship, shipTilePath)

            // Logic to remove previous ship location on the gameboard
            ship.location.forEach((tile) => {
                let tileX = tile[0]
                let tileY = tile[1]

                this.board[tileX][tileY] = referenceGameboard[tileX][tileY]
            })

            // If the pathway of the ship will not overlap with any other ships, enter here and
            // check if its new position will overlap with a ship's boundary.
            if (noNaN && this.#checkBoundary(ship)) {
                ship.location = shipTilePath

                // Render new orientation of ship.
                ship.location.forEach((tile) => {
                    let tileX = tile[0]
                    let tileY = tile[1]

                    this.board[tileX][tileY] = ship.typeOfShip.split('')[0]
                })
            } else {
                // Maintain original orientation.
                ship.location.forEach((loc) => {
                    let locX = loc[0]
                    let locY = loc[1]

                    this.board[locX][locY] = ship.typeOfShip.split('')[0]
                })
            }

            return ship.location[ship.location.length - 1]
        }
    }

    reset() {
        this.board = this.#generateBoard()
        this.ships = []
        this.areAllShipsSunked = false
    }
}

// Remove duplicate locations in array
function removeDuplicates(arr) {
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
