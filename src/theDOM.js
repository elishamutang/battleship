import { Ship } from './ship'
import { Player } from './player'

// Main function to generate DOM.
export default function generateTheDOM() {
    // Initialize players
    const realPlayer = new Player()
    const computerPlayer = new Player()

    // Generate gameboard in DOM.
    const realPlayerGameboard = document.getElementById('realPlayer')
    const computerPlayerGameboard = document.getElementById('computerPlayer')

    // Initial state of computer gameboard.
    computerPlayerGameboard.style.display = 'none'

    generateGameboard(realPlayer, realPlayerGameboard)
    generateGameboard(computerPlayer, computerPlayerGameboard)

    // Ship counter
    shipCounter(realPlayerGameboard)

    // Generate the ships.
    generateTheShips(realPlayer, computerPlayer)

    // Flipping feature (for real player only).
    realPlayerGameboard.addEventListener('click', (e) => {
        flipTheShip(e, realPlayer, realPlayerGameboard)
    })

    // Render the gameboards.
    refreshStyling(realPlayer, realPlayerGameboard)
    refreshStyling(computerPlayer, computerPlayerGameboard)

    // Record hit logs on gameboard.
    function clickOnBoard(e) {
        // If the target is a valid coordinate and it has not been clicked, enter here.
        if (e.target.dataset.row && e.target.dataset.col && !Array.from(e.target.classList).includes('clicked')) {
            // Marks tile on gameboard UI and identify it as "clicked".
            e.target.textContent = String.fromCharCode(parseInt('25CF', 16))
            e.target.className += ' clicked'

            let row = e.target.dataset.row
            let col = e.target.dataset.col

            // If a ship is clicked, mark the tile 'X' and record the attack on computer player's gameboard.
            if (computerPlayer.gameboard.board[row][col] !== 0) {
                e.target.textContent = 'X'

                computerPlayer.gameboard.receiveAttack([row, col])
            }

            if (computerPlayer.gameboard.areAllShipsSunked) {
                computerPlayerGameboard.className = 'gameboard lost'

                computerPlayerGameboard.removeEventListener('click', clickOnBoard)

                endGame()
            }
        }
    }

    computerPlayerGameboard.addEventListener('click', clickOnBoard)
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

    // Generate coordinates of gameboard and set as dataset coordinate for the DOM elements.
    getAllRowDivs.forEach((div, rowIdx) => {
        Array.from(div.children).forEach((loc, idx) => {
            loc.dataset.row = `${rowIdx}`
            loc.dataset.col = idx
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

// Flip the ship functionality (horizontal to vertical and vice versa).
function flipTheShip(e, realPlayer, realPlayerGameboard) {
    if (e.target.dataset.row && e.target.dataset.col) {
        let demoGameboardRow = parseInt(e.target.dataset.row)
        let demoGameboardCol = parseInt(e.target.dataset.col)

        let [shipName] = Array.from(e.target.classList).filter((className) => {
            if (className !== 'loc') return className
        })

        // If tile is occupied by a ship, enter here.
        if (shipName) {
            // Narrow down the relevant ships based on what tile was clicked.
            let relevantShips = Array.from(realPlayer.gameboard.ships).filter((ship) => {
                if (ship.typeOfShip === shipName) return ship
            })

            // Traverse through the relevantShips array and find the selected ship based on the clicked locations.
            relevantShips.forEach((ship) => {
                ship.location.forEach((loc) => {
                    let x = loc[0]
                    let y = loc[1]

                    if (x === demoGameboardRow && y === demoGameboardCol) {
                        // Keep track of old ship location coordinates, to remove the styling when ship is flipped.
                        let oldShipLoc = ship.location

                        realPlayer.gameboard.flip(ship)

                        for (let i = 1; i < oldShipLoc.length; i++) {
                            document.querySelector(
                                `[data-row='${oldShipLoc[i][0]}'][data-col='${oldShipLoc[i][1]}']`
                            ).className = 'loc'
                        }
                    }
                })
            })

            // Re-render gameboard.
            refreshStyling(realPlayer, realPlayerGameboard)
        }

        console.log(realPlayer.gameboard.board)
    }
}

function generateTheShips(realPlayer, computerPlayer) {
    // For now, manually locate each ship (total of 10 ships on the board)
    // 4 patrol, 3 destroyer, 2 battleship, 1 carrier

    // Create a randomizer that generates random coordinates for each ship. Ensure there is at least a 1 box gap between the ships.
    const randomizer = () => {
        return Math.floor(Math.random() * 10)
    }

    const realPlayerShips = () => {
        const realPlayerPatrolBoats = []
        for (let i = 0; i < 4; i++) {
            realPlayerPatrolBoats.push(new Ship(1))
        }

        const realPlayerDestroyers = []
        for (let i = 0; i < 3; i++) {
            realPlayerDestroyers.push(new Ship(2))
        }

        const realPlayerBattleShips = []
        for (let i = 0; i < 2; i++) {
            realPlayerBattleShips.push(new Ship(3))
        }

        const realPlayerCarrier = [new Ship(4)]

        // Carrier
        // realPlayer.gameboard.placeShip(realPlayerCarrier.shift(), [0, 0])

        // // Battleships
        // realPlayer.gameboard.placeShip(realPlayerBattleShips.shift(), [0, 9])
        // realPlayer.gameboard.placeShip(realPlayerBattleShips.shift(), [2, 2])

        // // Destroyers
        // realPlayer.gameboard.placeShip(realPlayerDestroyers.shift(), [9, 0])
        // realPlayer.gameboard.placeShip(realPlayerDestroyers.shift(), [6, 6])
        // realPlayer.gameboard.placeShip(realPlayerDestroyers.shift(), [9, 9])

        // // Patrol boats
        // realPlayer.gameboard.placeShip(realPlayerPatrolBoats.shift(), [1, 2]) // Patrol boat
        // realPlayer.gameboard.placeShip(realPlayerPatrolBoats.shift(), [5, 0])
        // realPlayer.gameboard.placeShip(realPlayerPatrolBoats.shift(), [8, 5])
        // realPlayer.gameboard.placeShip(realPlayerPatrolBoats.shift(), [9, 8])

        // Randomize each ship location
        realPlayer.gameboard.placeShip(realPlayerCarrier.shift(), [randomizer(), randomizer()]) // Carrier

        realPlayer.gameboard.placeShip(realPlayerBattleShips.shift(), [randomizer(), randomizer()]) // Battleships
        realPlayer.gameboard.placeShip(realPlayerBattleShips.shift(), [randomizer(), randomizer()])

        realPlayer.gameboard.placeShip(realPlayerDestroyers.shift(), [randomizer(), randomizer()]) // Destroyer
        realPlayer.gameboard.placeShip(realPlayerDestroyers.shift(), [randomizer(), randomizer()])
        realPlayer.gameboard.placeShip(realPlayerDestroyers.shift(), [randomizer(), randomizer()])

        realPlayer.gameboard.placeShip(realPlayerPatrolBoats.shift(), [randomizer(), randomizer()]) // Patrol boat
        realPlayer.gameboard.placeShip(realPlayerPatrolBoats.shift(), [randomizer(), randomizer()])
        realPlayer.gameboard.placeShip(realPlayerPatrolBoats.shift(), [randomizer(), randomizer()])
        realPlayer.gameboard.placeShip(realPlayerPatrolBoats.shift(), [randomizer(), randomizer()])
    }

    const computerPlayerShips = () => {
        const compPatrolBoats = []
        for (let i = 0; i < 4; i++) {
            compPatrolBoats.push(new Ship(1))
        }

        const compDestroyers = []
        for (let i = 0; i < 3; i++) {
            compDestroyers.push(new Ship(2))
        }

        const compBattleShips = []
        for (let i = 0; i < 2; i++) {
            compBattleShips.push(new Ship(3))
        }

        const compCarrier = [new Ship(4)]

        // computerPlayer.gameboard.placeShip(compCarrier.shift(), [2, 2]) // Carrier

        // computerPlayer.gameboard.placeShip(compBattleShips.shift(), [4, 6]) // Battleships
        // computerPlayer.gameboard.placeShip(compBattleShips.shift(), [7, 0])

        // computerPlayer.gameboard.placeShip(compDestroyers.shift(), [0, 7]) // Destoyer
        // computerPlayer.gameboard.placeShip(compDestroyers.shift(), [6, 7])
        // computerPlayer.gameboard.placeShip(compDestroyers.shift(), [5, 0])

        // computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [0, 0]) // Patrol boat
        // computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [0, 4])
        // computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [9, 9])
        // computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [9, 3])

        // Randomize every ship location
        computerPlayer.gameboard.placeShip(compCarrier.shift(), [randomizer(), randomizer()]) // Carrier

        computerPlayer.gameboard.placeShip(compBattleShips.shift(), [randomizer(), randomizer()]) // Battleships
        computerPlayer.gameboard.placeShip(compBattleShips.shift(), [randomizer(), randomizer()])

        computerPlayer.gameboard.placeShip(compDestroyers.shift(), [randomizer(), randomizer()]) // Destroyers
        computerPlayer.gameboard.placeShip(compDestroyers.shift(), [randomizer(), randomizer()])
        computerPlayer.gameboard.placeShip(compDestroyers.shift(), [randomizer(), randomizer()])

        computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [randomizer(), randomizer()]) // Patrol boat
        computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [randomizer(), randomizer()])
        computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [randomizer(), randomizer()])
        computerPlayer.gameboard.placeShip(compPatrolBoats.shift(), [randomizer(), randomizer()])
    }

    realPlayerShips()
    computerPlayerShips()
}

function shipCounter(playerGameboard) {
    const shipCountDiv = document.createElement('div')
    shipCountDiv.className = 'shipCount'

    playerGameboard.insertAdjacentElement('beforeend', shipCountDiv)

    const generateShipIcon = (shipType, length) => {
        const shipIcon = document.createElement('div')
        shipIcon.className = `${shipType}Icon shipIcon`

        for (let i = 0; i < length; i++) {
            const filler = document.createElement('div')
            filler.className = `icon`
            shipIcon.append(filler)
        }

        return shipIcon
    }

    const appendIcon = (shipType, numOfShips, length) => {
        const iconDiv = document.createElement('div')
        iconDiv.className = `${shipType}IconDiv`

        if (numOfShips > 1) {
            for (let i = 0; i < numOfShips; i++) {
                iconDiv.append(generateShipIcon(shipType, length))
            }
        } else {
            return generateShipIcon(shipType, length)
        }

        return iconDiv
    }

    const carrierIcon = appendIcon('carrier', 1, 4)
    const battleShipIconDiv = appendIcon('battleShip', 2, 3)
    const destroyerIconDiv = appendIcon('destroyer', 3, 2)
    const patrolBoatDiv = appendIcon('patrolBoat', 4, 1)

    shipCountDiv.append(carrierIcon)
    shipCountDiv.append(battleShipIconDiv)
    shipCountDiv.append(destroyerIconDiv)
    shipCountDiv.append(patrolBoatDiv)
}

function endGame() {
    // Announce the winner
    setTimeout(() => {
        alert('You won!')
    }, 200)
}
