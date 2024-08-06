import { Ship } from './ship'
import { Player } from './player'

// ** Re-factor this code, kinda looks messy ** //
// Main function to generate DOM.
export default function generateTheDOM() {
    // Initialize players
    const realPlayer = new Player()
    const computerPlayer = new Player()

    // Generate gameboard in DOM.
    const realPlayerGameboard = document.getElementById('realPlayer')
    const computerPlayerGameboard = document.getElementById('computerPlayer')

    // **Instead of setting display to none, we can dynamically add the board so that initially it is not present in the DOM**//
    // Initial state of computer gameboard.
    computerPlayerGameboard.style.display = 'none'

    // Generate gameboards.
    generateGameboard(realPlayer, realPlayerGameboard)
    generateGameboard(computerPlayer, computerPlayerGameboard)

    // Attach board UI to gameboards.
    const generateBoardUI = () => {
        const div = document.createElement('div')
        div.className = 'boardUI'

        return div
    }

    const realPlayerBoardUI = generateBoardUI()
    const computerPlayerBoardUI = generateBoardUI()

    realPlayerGameboard.insertAdjacentElement('beforeend', realPlayerBoardUI)
    computerPlayerGameboard.insertAdjacentElement('beforeend', computerPlayerBoardUI)

    // Add ship counter to each gameboard.
    shipCounter(realPlayerGameboard)
    shipCounter(computerPlayerGameboard)

    // Add instructions, start button, and randomise ship placement button to real player gameboard.
    const tipDiv = document.createElement('div')
    tipDiv.className = 'tipDiv'

    const tipContainer = document.createElement('p')
    tipContainer.textContent = 'Drag and drop the ships. Ready? Click start below.'

    tipDiv.append(tipContainer)

    realPlayerGameboard.querySelector('.boardUI').append(tipDiv)

    // Add start button
    const startBtn = document.createElement('button')
    startBtn.className = 'startBtn'
    startBtn.textContent = 'START'

    tipDiv.append(startBtn)
    startBtn.addEventListener(
        'click',
        (e) => {
            // Add computer gameboard after clicking start.
            computerPlayerGameboard.style.display = 'flex'

            // Remove the tip div
            document.querySelector('.tipDiv').remove()

            const boardUIDiv = Array.from(document.getElementsByClassName('boardUI'))
            const shipCountDiv = Array.from(document.getElementsByClassName('shipCount'))

            boardUIDiv.forEach((div) => {
                div.style.border = 'none'
            })

            shipCountDiv.forEach((div) => {
                div.style.border = 'none'
                div.style.padding = '0.8rem 0'
            })
        },
        { once: true }
    )

    // Generate the ships.
    generateTheShips(realPlayer, computerPlayer)

    realPlayerGameboard.addEventListener('mouseover', (e) => {
        hoverOverRealPlayerShips(e, realPlayer)
    })

    // Before starting the game.

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
            e.target.textContent = String.fromCharCode(0x25cf)
            e.target.className += ' clicked'

            const { row } = e.target.dataset
            const { col } = e.target.dataset

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

// Hovering over real player ships.
function hoverOverRealPlayerShips(e, realPlayer) {
    const classList = Array.from(e.target.classList)

    const isShip = () => {
        if (
            classList.includes('carrier') ||
            classList.includes('battleShip') ||
            classList.includes('patrolBoat') ||
            classList.includes('destroyer')
        )
            return true
    }

    if (isShip()) {
        const shipType = classList[1]

        const gameboardRow = parseInt(e.target.dataset.row)
        const gameboardCol = parseInt(e.target.dataset.col)

        // Narrow down the specific ship tile.
        const [ship] = realPlayer.gameboard.ships
            .filter((elem) => {
                if (elem.typeOfShip === shipType) return elem
            })
            .filter((elem) => {
                for (let i = 0; i < elem.location.length; i++) {
                    if (elem.location[i][0] === gameboardRow && elem.location[i][1] === gameboardCol) {
                        return elem
                    }
                }
            })

        const onMouseLeave = () => {
            ship.location.forEach((loc) => {
                const x = loc[0]
                const y = loc[1]

                document.querySelector(`[data-row='${x}'][data-col='${y}']`).className = `loc ${shipType}`
            })
        }

        // Style the whole ship for hovering effect.
        ship.location.forEach((loc) => {
            const x = loc[0]
            const y = loc[1]

            document.querySelector(`[data-row='${x}'][data-col='${y}']`).className = `loc ${shipType} hover`

            document
                .querySelector(`[data-row='${x}'][data-col='${y}']`)
                .addEventListener('mouseleave', onMouseLeave, { once: true })
        })
    }
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
        const demoGameboardRow = parseInt(e.target.dataset.row)
        const demoGameboardCol = parseInt(e.target.dataset.col)

        const [shipName] = Array.from(e.target.classList).filter((className) => {
            if (className !== 'loc') return className
        })

        // If tile is occupied by a ship, enter here.
        if (shipName) {
            // Narrow down the relevant ships based on what tile was clicked.
            const relevantShips = Array.from(realPlayer.gameboard.ships).filter((ship) => {
                if (ship.typeOfShip === shipName) return ship
            })

            // Traverse through the relevantShips array and find the selected ship based on the clicked locations.
            relevantShips.forEach((ship) => {
                ship.location.forEach((loc) => {
                    const x = loc[0]
                    const y = loc[1]

                    if (x === demoGameboardRow && y === demoGameboardCol) {
                        // Keep track of old ship location coordinates, to remove the styling when ship is flipped.
                        const oldShipLoc = ship.location

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
    const randomizer = () => Math.floor(Math.random() * 10)

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

    playerGameboard.querySelector('.boardUI').append(shipCountDiv)

    const remainingFleetHeading = document.createElement('div')
    remainingFleetHeading.textContent = 'Remaining Fleet'
    remainingFleetHeading.className = 'remainingFleet heading'

    shipCountDiv.append(remainingFleetHeading)

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
