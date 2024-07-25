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

    // For now, manually locate each ship (total of 10 ships on the board)
    // 4 patrol, 3 destroyer, 2 battleship, 1 carrier
    const patrolBoats = []
    for (let i = 0; i < 4; i++) {
        patrolBoats.push(new Ship(2))
    }

    const destroyers = []
    for (let i = 0; i < 3; i++) {
        destroyers.push(new Ship(3))
    }

    const battleShips = []
    for (let i = 0; i < 2; i++) {
        battleShips.push(new Ship(4))
    }

    const carrier = [new Ship(5)]

    realPlayer.gameboard.placeShip(patrolBoats.shift(), [0, 0]) // Patrol boat
    realPlayer.gameboard.placeShip(patrolBoats.shift(), [9, 2])
    realPlayer.gameboard.placeShip(patrolBoats.shift(), [2, 4])
    realPlayer.gameboard.placeShip(patrolBoats.shift(), [5, 9])

    realPlayer.gameboard.placeShip(destroyers.shift(), [0, 3]) // Destroyer
    realPlayer.gameboard.placeShip(destroyers.shift(), [9, 8])
    realPlayer.gameboard.placeShip(destroyers.shift(), [4, 1])

    // realPlayer.gameboard.placeShip(battleShips.shift(), []) // Battleships

    realPlayer.gameboard.placeShip(carrier.shift(), [6, 6]) // Carrier

    console.log(realPlayer.gameboard.board)

    // Flipping feature.
    realPlayerGameboard.addEventListener('click', (e) => {
        flipTheShip(e, realPlayer, realPlayerGameboard, referenceGameboard)
    })

    // Style the ships.
    refreshStyling(realPlayer, realPlayerGameboard)

    // THE BELOW EVENT LISTENER SHOULD ONLY BE FOR PLAYERS TO ATTACK THE COMPUTER PLAYERS.

    // Add event listener to interact with gameboards.
    // Record hit logs on gameboard.
    // realPlayerGameboard.addEventListener('click', (e) => {
    //     if (e.target.dataset.coord) {
    //         // Displays on gameboard UI.
    //         e.target.textContent = 'x'

    //         let demoGameboardRow = e.target.dataset.coord.split('').map((elem) => {
    //             return parseInt(elem)
    //         })

    //         demoGameboardRow = parseInt(demoGameboardRow.slice(0, demoGameboardRow.indexOf(NaN)).join('')) - 1

    //         // Use the referenceGameboard to identify the coordinate.
    //         // If coordinate is not present in realPlayer gameboard, then it is occupied by a type of 'Ship'.

    //         // The DOM has the coordinates of the tile that is clicked and the position of that coordinate in the realPlayer.gameboard.board can be
    //         // cross-checked with the referenceGameboard.
    //         if (!realPlayer.gameboard.board[demoGameboardRow].includes(e.target.dataset.coord)) {
    //             referenceGameboard.gameboard.board[demoGameboardRow].forEach((loc, idx) => {
    //                 // Tile that is clicked on the DOM is cross-checked against the referenceGameboard.
    //                 if (loc === e.target.dataset.coord) {
    //                     let x = demoGameboardRow
    //                     let y = idx

    //                     console.log(x, y)

    //                     realPlayer.gameboard.receiveAttack([x, y])
    //                 }
    //             })
    //         }

    //         console.log(realPlayer.gameboard)
    //     }
    // })
}

function generateGameboard(player, playerGameboard) {
    // Construct gameboard
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
    getAllRowDivs.forEach((div, idx) => {
        if (idx !== 0) {
            div.children[0].textContent = idx
            div.children[0].className += ' numbering'
        }
    })

    // Alphabets
    const alphabets = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

    Array.from(getAllRowDivs[0].children).forEach((loc, idx) => {
        if (idx !== 0) {
            loc.textContent = alphabets[idx - 1]
            loc.className += ' alphabets'
        }
    })

    // Generate coordinates of gameboard
    getAllRowDivs.forEach((div, rowIdx) => {
        if (rowIdx !== 0) {
            Array.from(div.children).forEach((loc, idx) => {
                if (idx !== 0) {
                    loc.dataset.coord = `${rowIdx}${alphabets[idx - 1]}`
                }
            })
        }
    })
}

function mapCoordinates(player, playerGameboard) {
    let playerDOMGameboard = Array.from(playerGameboard.querySelectorAll('[data-coord]'))

    player.gameboard.board = player.gameboard.board.filter((row, idx) => {
        if (idx !== 0) return row
    })

    // Map each DOM coordinate to the player gameboard.
    // Playable gameboard is now 10 x 10
    player.gameboard.board.forEach((row) => {
        row.pop()

        row.forEach((loc, idx) => {
            row[idx] = playerDOMGameboard.shift().dataset.coord
        })
    })
}

function refreshStyling(player, gameboard) {
    const getAllRowsPlayer = Array.from(gameboard.getElementsByClassName('row'))

    // Style the ships.
    player.gameboard.board.forEach((row, rowIdx) => {
        row.forEach((loc, idx) => {
            if (loc === 'p') {
                getAllRowsPlayer[rowIdx + 1].children[idx + 1].className = 'loc patrolBoat'
            } else if (loc === 'd') {
                getAllRowsPlayer[rowIdx + 1].children[idx + 1].className = 'loc destroyer'
            } else if (loc === 'c') {
                getAllRowsPlayer[rowIdx + 1].children[idx + 1].className = 'loc carrier'
            }
        })
    })
}

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
                                    // Change coordinates after the starting point from horizontal to vertical.
                                    for (let i = 1; i < ship.location.length; i++) {
                                        let row = ship.location[i][0]
                                        let col = ship.location[i][1]

                                        // Update the player gameboard and replace the Ship name with a coordinate from the target element's coordinate data.
                                        realPlayer.gameboard.board[row][col] =
                                            referenceGameboard.gameboard.board[row][col]

                                        // Get the coordinate from referenceGameboard.
                                        let DOMCoord = referenceGameboard.gameboard.board[row][col]

                                        // Remove styling from tiles that were horizontal.
                                        document.querySelector(`[data-coord = '${DOMCoord}']`).className = 'loc'
                                    }

                                    // Player gameboard is updated to reflect the flipping from horizontal to vertical.
                                    realPlayer.gameboard.flip(ship)
                                }
                            })
                        })
                    }
                })
            }

            // Refresh styling
            refreshStyling(realPlayer, realPlayerGameboard)
        }

        console.log(realPlayer.gameboard.board)
    }
}
