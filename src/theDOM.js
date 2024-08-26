import { Ship } from './ship'
import { Player } from './player'
import startGame from './startGame'
import enableDragAndDrop, { shipDragAndDrop, insertDraggableShips } from './dragAndDrop'

// Initialize players
const realPlayer = new Player()
const computerPlayer = new Player()

// Get gameboard in DOM.
const realPlayerGameboard = document.getElementById('realPlayer')
const computerPlayerGameboard = document.getElementById('computerPlayer')

// Main function to generate DOM.
// Before starting the round, always re-direct user to his/her own gameboard to configure the ship placements.
export default function setUp() {
    // Prepare main tag
    const mainDiv = document.querySelector('main')
    mainDiv.className = 'prep'

    // Initial display of computer gameboard.
    computerPlayerGameboard.style.display = 'none'

    // Generate gameboards.
    generateGameboard(realPlayer, realPlayerGameboard)
    generateGameboard(computerPlayer, computerPlayerGameboard)

    // Generate the ships.
    generateTheShips(realPlayer, computerPlayer).realPlayerShips()

    // Setup flipping feature
    realPlayerGameboard.addEventListener('click', flipTheShip)

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
    tipContainer.textContent = 'Drag and drop the ships, or go random. Ready? Click start below.'

    tipDiv.append(tipContainer)

    realPlayerGameboard.querySelector('.boardUI').append(tipDiv)

    // Add randomise ship positions button.
    const randomiseBtn = document.createElement('button')
    randomiseBtn.className = 'randomiseBtn'
    randomiseBtn.innerHTML = '<i class="gg-sync"></i>'

    tipDiv.append(randomiseBtn)

    randomiseBtn.addEventListener('click', (e) => {
        realPlayer.gameboard.reset()

        // Remove onMouseLeave event listeners for each ship location
        realPlayer.gameboard.ships.forEach((ship) => {
            ship.location.forEach((loc) => {
                let x = loc[0]
                let y = loc[1]

                document
                    .querySelector(`[data-row='${x}'][data-col='${y}']`)
                    .removeEventListener('mouseleave', onMouseLeave)
            })
        })

        // Remove old ships
        refreshStyling(realPlayer, realPlayerGameboard, true)

        // Generate new ships and refresh gameboard.
        generateTheShips(realPlayer, computerPlayer).realPlayerShips()

        // Remove
        Array.from(realPlayerGameboard.getElementsByClassName('shipDiv')).forEach((div) => {
            div.remove()
        })

        // Attach drag and drop feature to new ships.
        shipDragAndDrop(realPlayer)
    })

    // Hover effect
    realPlayerGameboard.addEventListener('mouseover', hoverOverRealPlayerShips)

    // Add start button
    const startBtn = document.createElement('button')
    startBtn.className = 'startBtn'
    startBtn.textContent = 'START'

    tipDiv.append(startBtn)

    // Drag and drop
    enableDragAndDrop(realPlayer)

    startBtn.addEventListener(
        'click',
        () => {
            // Start game
            startGame(realPlayer, computerPlayer)
        },
        { once: true }
    )
}

// Hovering over real player ships.
export function hoverOverRealPlayerShips(e) {
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

        // Style the whole ship for hovering effect.
        if (ship) {
            ship.location.forEach((loc) => {
                const x = loc[0]
                const y = loc[1]

                document.querySelector(`[data-row='${x}'][data-col='${y}']`).classList.add('hover')

                document
                    .querySelector(`[data-row='${x}'][data-col='${y}']`)
                    .addEventListener('mouseleave', onMouseLeave, { once: true })
            })
        }
    }
}

// onMouseLeave event listener.
export function onMouseLeave() {
    realPlayer.gameboard.ships.forEach((ship) => {
        ship.location.forEach((loc) => {
            const x = loc[0]
            const y = loc[1]

            document.querySelector(`[data-row='${x}'][data-col='${y}']`).classList.remove('hover')
        })
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

    // Generate coordinates of gameboard and set as dataset coordinate for the DOM elements.
    getAllRowDivs.forEach((div, rowIdx) => {
        Array.from(div.children).forEach((loc, idx) => {
            loc.dataset.row = `${rowIdx}`
            loc.dataset.col = idx
        })
    })
}

// Render gameboard.
export function refreshStyling(player, playerGameboard, remove) {}

// Flip the ship functionality (horizontal to vertical and vice versa).
export function flipTheShip(e) {
    if (e.target.parentNode.dataset.row && e.target.parentNode.dataset.col) {
        const demoGameboardRow = parseInt(e.target.parentNode.dataset.row)
        const demoGameboardCol = parseInt(e.target.parentNode.dataset.col)

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
                            const shipTileElem = document.querySelector(
                                `[data-row='${oldShipLoc[i][0]}'][data-col='${oldShipLoc[i][1]}']`
                            )

                            // Get starting location of ship element.
                            const shipStartPoint = ship.location[0]
                            const shipStartPointElem = document.querySelector(
                                `[data-row='${shipStartPoint[0]}'][data-col='${shipStartPoint[1]}']`
                            )

                            const shipDiv = shipStartPointElem.querySelector('.shipDiv')

                            // Horizontal to vertical (including starting points at last row)
                            if (shipStartPoint[0] < ship.location[i][0] || shipStartPoint[0] > ship.location[i][0]) {
                                console.log('Horizontal to vertical ship')

                                if (shipDiv.classList.contains('horizontal')) {
                                    shipDiv.classList.remove('horizontal')
                                }

                                shipDiv.classList.add('vertical')
                            }

                            // Vertical to horizontal
                            if (shipStartPoint[1] < ship.location[i][1]) {
                                console.log('Vertical to horizonal ship')

                                if (shipDiv.classList.contains('vertical')) {
                                    shipDiv.classList.remove('vertical')
                                }

                                shipDiv.classList.add('horizontal')
                            }

                            shipTileElem.className = 'loc'
                        }
                    }
                })
            })

            // Re-render gameboard.
            refreshStyling(realPlayer, realPlayerGameboard)
        }
    }
}

export function generateTheShips(realPlayer, computerPlayer) {
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

        // Battleship
        realPlayerBattleShips.forEach((battleship) => {
            realPlayer.gameboard.placeShip(battleship, [randomizer(), randomizer()])
        })

        // Destroyer
        realPlayerDestroyers.forEach((destroyer) => {
            realPlayer.gameboard.placeShip(destroyer, [randomizer(), randomizer()])
        })

        // Patrol boat
        realPlayerPatrolBoats.forEach((boat) => {
            realPlayer.gameboard.placeShip(boat, [randomizer(), randomizer()])
        })

        refreshStyling(realPlayer, realPlayerGameboard)
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

        // Battleship
        compBattleShips.forEach((battleship) => {
            computerPlayer.gameboard.placeShip(battleship, [randomizer(), randomizer()])
        })

        // Destroyer
        compDestroyers.forEach((destroyer) => {
            computerPlayer.gameboard.placeShip(destroyer, [randomizer(), randomizer()])
        })

        // Patrol boat
        compPatrolBoats.forEach((boat) => {
            computerPlayer.gameboard.placeShip(boat, [randomizer(), randomizer()])
        })

        refreshStyling(computerPlayer, computerPlayerGameboard)
    }

    return {
        realPlayerShips,
        computerPlayerShips,
    }
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
