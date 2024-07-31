import { Ship } from './ship'
import { Gameboard } from './gameboard'
import { Player } from './player'

// Main function to generate DOM.
export default function generateTheDOM() {
    // Initialize players
    const realPlayer = new Player()
    const computerPlayer = new Player()

    // Initialize reference gameboard.
    const referenceGameboard = new Player()

    // Generate gameboard in DOM.
    const realPlayerGameboard = document.getElementById('realPlayer')
    const computerPlayerGameboard = document.getElementById('computerPlayer')

    generateGameboard(realPlayer, realPlayerGameboard)
    generateGameboard(computerPlayer, computerPlayerGameboard)

    // Align gameboard coordinates between DOM and Gameboard class.
    mapCoordinates(realPlayer, realPlayerGameboard) // Real player
    mapCoordinates(computerPlayer, computerPlayerGameboard) // Computer
    mapCoordinates(referenceGameboard, realPlayerGameboard) // Reference board

    // Generate the ships.
    generateTheShips(realPlayer)

    // Flipping feature (for real player only).
    realPlayerGameboard.addEventListener('click', (e) => {
        flipTheShip(e, realPlayer, realPlayerGameboard, referenceGameboard)
    })

    // Render the real player's gameboard.
    refreshStyling(realPlayer, realPlayerGameboard)

    // COMPUTER GAMEBOARD.
    // For now, manually locate each ship (total of 10 ships on the board)
    // 4 patrol, 3 destroyer, 2 battleship, 1 carrier
    const compPatrolBoats = []
    for (let i = 0; i < 4; i++) {
        compPatrolBoats.push(new Ship(2))
    }

    const compDestroyers = []
    for (let i = 0; i < 3; i++) {
        compDestroyers.push(new Ship(3))
    }

    const compBattleShips = []
    for (let i = 0; i < 2; i++) {
        compBattleShips.push(new Ship(4))
    }

    const compCarrier = [new Ship(5)]

    // computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [0, 0]) // Patrol boat
    // computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [0, 4])
    // computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [9, 9])
    // computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [9, 3])

    // computerPlayer.gameboard.placeShip(compDestroyers.shift(), [0, 7]) // Destoyer
    // computerPlayer.gameboard.placeShip(compDestroyers.shift(), [6, 7])
    // computerPlayer.gameboard.placeShip(compDestroyers.shift(), [5, 0])

    // computerPlayer.gameboard.placeShip(compBattleShips.shift(), [4, 6]) // Battleships
    // computerPlayer.gameboard.placeShip(compBattleShips.shift(), [7, 0])

    // computerPlayer.gameboard.placeShip(compCarrier.shift(), [2, 2]) // Carrier

    refreshStyling(computerPlayer, computerPlayerGameboard)

    // THE BELOW EVENT LISTENER SHOULD ONLY BE FOR PLAYERS TO ATTACK THE COMPUTER PLAYERS.

    // Record hit logs on gameboard.
    computerPlayerGameboard.addEventListener('click', (e) => {
        // If the target is a valid coordinate and it has not been clicked, enter here.
        if (e.target.dataset.coord && !Array.from(e.target.classList).includes('clicked')) {
            // Marks tile on gameboard UI and identify it as "clicked".
            e.target.textContent = String.fromCharCode(parseInt('25CF', 16))
            e.target.className += ' clicked'

            let demoGameboardRow = e.target.dataset.coord.split('').map((elem) => {
                return parseInt(elem)
            })

            demoGameboardRow = parseInt(demoGameboardRow.slice(0, demoGameboardRow.indexOf(NaN)).join('')) - 1

            // Use the referenceGameboard to identify the coordinate.
            // If coordinate is not present in player gameboard, then it is occupied by a type of 'Ship'.

            // The DOM has the coordinates of the tile that is clicked and the position of that coordinate in the computerPlayer.gameboard.board can be
            // cross-checked against the referenceGameboard.
            if (!computerPlayer.gameboard.board[demoGameboardRow].includes(e.target.dataset.coord)) {
                referenceGameboard.gameboard.board[demoGameboardRow].forEach((loc, idx) => {
                    // Tile that is clicked on the DOM is cross-checked against the referenceGameboard.
                    // The position of that tile is obtained and passed to receiveAttack method to register the attack on that position (or tile).
                    if (loc === e.target.dataset.coord) {
                        let x = demoGameboardRow
                        let y = idx

                        e.target.textContent = 'X' // For ships, mark with 'X'.

                        console.log(x, y)

                        computerPlayer.gameboard.receiveAttack([x, y])
                    }
                })
            }

            console.log(computerPlayer.gameboard)
        }
    })
}

// Construct gameboard
function generateGameboard(player, playerGameboard) {
    player.gameboard.board.forEach((row) => {
        const rowDiv = document.createElement('div')
        rowDiv.className = 'row'

        playerGameboard.append(rowDiv)

        row.forEach(() => {
            const location = document.createElement('div')
            location.className = 'loc'

            rowDiv.append(location)
        })
    })

    const getAllRowDivs = Array.from(playerGameboard.getElementsByClassName('row'))

    // Numbering
    // getAllRowDivs.forEach((div, idx) => {
    //     if (idx !== 0) {
    //         div.children[0].textContent = idx
    //         div.children[0].className += ' numbering'
    //     }
    // })

    // Alphabets
    const alphabets = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

    // Array.from(getAllRowDivs[0].children).forEach((loc, idx) => {
    //     if (idx !== 0) {
    //         loc.textContent = alphabets[idx - 1]
    //         loc.className += ' alphabets'
    //     }
    // })

    // Generate coordinates of gameboard
    getAllRowDivs.forEach((div, rowIdx) => {
        Array.from(div.children).forEach((loc, idx) => {
            loc.dataset.coord = `${rowIdx + 1}${alphabets[idx]}`
        })
    })
}

// Align player gameboard coordinates with the DOM gameboard.
function mapCoordinates(player, playerGameboard) {
    let playerDOMGameboard = Array.from(playerGameboard.querySelectorAll('[data-coord]'))

    // Map each DOM coordinate to the player gameboard.
    // Playable gameboard is now 10 x 10
    player.gameboard.board.forEach((row) => {
        row.forEach((loc, idx) => {
            row[idx] = playerDOMGameboard.shift().dataset.coord
        })
    })
}

// Render gameboard.
function refreshStyling(player, gameboard) {
    const getAllRowsPlayer = Array.from(gameboard.getElementsByClassName('row'))

    // Style the ships.
    player.gameboard.board.forEach((row, rowIdx) => {
        row.forEach((loc, idx) => {
            if (loc === 'p') {
                getAllRowsPlayer[rowIdx].children[idx].className = 'loc patrolBoat'
            } else if (loc === 'd') {
                getAllRowsPlayer[rowIdx].children[idx].className = 'loc destroyer'
            } else if (loc === 'c') {
                getAllRowsPlayer[rowIdx].children[idx].className = 'loc carrier'
            } else if (loc === 'b') {
                getAllRowsPlayer[rowIdx].children[idx].className = 'loc battleShip'
            }
        })
    })
}

// ** The logic in this function should really be inside the flip method in the Gameboard class ** //
// Flip the ship functionality (horizontal to vertical and vice versa).
function flipTheShip(e, realPlayer, realPlayerGameboard, referenceGameboard) {
    if (e.target.dataset.coord) {
        let demoGameboardRow = e.target.dataset.coord.split('').map((elem) => {
            return parseInt(elem)
        })

        demoGameboardRow = parseInt(demoGameboardRow.slice(0, demoGameboardRow.indexOf(NaN)).join('')) - 1

        let [shipName] = Array.from(e.target.classList).filter((className) => {
            if (className !== 'loc') return className
        })

        // If tile is occupied by a ship, enter here.
        if (shipName) {
            // Narrow down the relevant ships based on what tile was clicked.
            let relevantShips = Array.from(realPlayer.gameboard.ships).filter((ship) => {
                if (ship.typeOfShip === shipName) return ship
            })

            // If tile that is clicked does not have a coordinate in the player's gameboard, that tile is occupied by a type of ship.
            // We can traverse through the referenceGameboard and get the position of that tile.

            if (!realPlayer.gameboard.board[demoGameboardRow].includes(e.target.dataset.coord)) {
                referenceGameboard.gameboard.board[demoGameboardRow].forEach((loc, idx) => {
                    // Tile that is clicked on the DOM is cross-checked against the referenceGameboard.
                    if (loc === e.target.dataset.coord) {
                        let x = demoGameboardRow
                        let y = idx

                        // Loop through the relevantShips to get the actual ship that was clicked, based on its location on the gameboard.
                        relevantShips.forEach((ship) => {
                            ship.location.forEach((loc) => {
                                let shipX = loc[0]
                                let shipY = loc[1]

                                // If coordinates matches with the ones inside ship.location, then enter here.
                                if (shipX === x && shipY === y) {
                                    // Store reference of the old ship orientation in oldShipLoc.
                                    const oldShipLoc = ship.location

                                    // Player gameboard is updated to reflect the flipping from horizontal to vertical.
                                    realPlayer.gameboard.flip(ship)

                                    if (oldShipLoc !== ship.location) {
                                        // For coordinates in oldShipLoc, update the styling and also the player's gameboard.
                                        for (let i = 1; i < oldShipLoc.length; i++) {
                                            let row = oldShipLoc[i][0]
                                            let col = oldShipLoc[i][1]

                                            // Update the player gameboard and replace the Ship name with a coordinate from the target element's coordinate data.
                                            realPlayer.gameboard.board[row][col] =
                                                referenceGameboard.gameboard.board[row][col]

                                            // Get the coordinate from referenceGameboard.
                                            let DOMCoord = referenceGameboard.gameboard.board[row][col]

                                            // Remove styling from tiles occupied by coordinates in oldShipLoc.
                                            document.querySelector(`[data-coord = '${DOMCoord}']`).className = 'loc'
                                        }
                                    }
                                }
                            })
                        })
                    }
                })
            }

            // Re-render gameboard.
            refreshStyling(realPlayer, realPlayerGameboard)
        }

        console.log(realPlayer.gameboard.board)
    }
}

function generateTheShips(player) {
    // For now, manually locate each ship (total of 10 ships on the board)
    // 4 patrol, 3 destroyer, 2 battleship, 1 carrier

    // Create a randomizer that generates random coordinates for each ship. Ensure there is at least a 1 box gap between the ships.
    const randomizer = () => {
        return Math.floor(Math.random() * 10)
    }

    const realPlayerPatrolBoats = []
    for (let i = 0; i < 4; i++) {
        realPlayerPatrolBoats.push(new Ship(2))
    }

    const realPlayerDestroyers = []
    for (let i = 0; i < 3; i++) {
        realPlayerDestroyers.push(new Ship(3))
    }

    const realPlayerBattleShips = []
    for (let i = 0; i < 2; i++) {
        realPlayerBattleShips.push(new Ship(4))
    }

    const realPlayerCarrier = [new Ship(5)]

    player.gameboard.placeShip(realPlayerPatrolBoats.shift(), [1, 2]) // Patrol boat
    player.gameboard.placeShip(realPlayerPatrolBoats.shift(), [5, 0])
    player.gameboard.placeShip(realPlayerPatrolBoats.shift(), [8, 5])
    player.gameboard.placeShip(realPlayerPatrolBoats.shift(), [9, 8])

    // player.gameboard.placeShip(realPlayerPatrolBoats.shift(), [randomizer(), randomizer()]) // Patrol boat (random)
    // player.gameboard.placeShip(realPlayerPatrolBoats.shift(), [randomizer(), randomizer()])
    // player.gameboard.placeShip(realPlayerPatrolBoats.shift(), [randomizer(), randomizer()])
    // player.gameboard.placeShip(realPlayerPatrolBoats.shift(), [randomizer(), randomizer()])

    player.gameboard.placeShip(realPlayerDestroyers.shift(), [7, 1]) // Destroyer
    player.gameboard.placeShip(realPlayerDestroyers.shift(), [6, 5])
    player.gameboard.placeShip(realPlayerDestroyers.shift(), [3, 5])

    // player.gameboard.placeShip(realPlayerDestroyers.shift(), [randomizer(), randomizer()]) // Destroyer
    // player.gameboard.placeShip(realPlayerDestroyers.shift(), [randomizer(), randomizer()])
    // player.gameboard.placeShip(realPlayerDestroyers.shift(), [randomizer(), randomizer()])

    // player.gameboard.placeShip(realPlayerBattleShips.shift(), [3, 6]) // Battleships
    // player.gameboard.placeShip(realPlayerBattleShips.shift(), [8, 0])

    // player.gameboard.placeShip(realPlayerBattleShips.shift(), [randomizer(), randomizer()]) // Battleships
    player.gameboard.placeShip(realPlayerBattleShips.shift(), [1, 6])

    // player.gameboard.placeShip(realPlayerCarrier.shift(), [6, 6]) // Carrier
}
