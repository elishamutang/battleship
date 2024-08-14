import { generateTheShips, hoverOverRealPlayerShips, flipTheShip } from './theDOM'
import endGame from './endGame'

// Get the gameboards
const realPlayerGameboard = document.getElementById('realPlayer')
const computerPlayerGameboard = document.getElementById('computerPlayer')

export default function startGame(realPlayer, computerPlayer) {
    // Get main tag
    const mainDiv = document.querySelector('main')
    mainDiv.className = 'start'

    // Remove event listeners on real player gameboard.
    realPlayerGameboard.removeEventListener('mouseover', hoverOverRealPlayerShips)
    realPlayerGameboard.removeEventListener('click', flipTheShip)

    const allTiles = Array.from(realPlayerGameboard.getElementsByClassName('loc'))

    allTiles.forEach((tile) => {
        tile.className = tile.className + ' no-pointer'
    })

    // Add computer gameboard after clicking start.
    computerPlayerGameboard.style.display = 'flex'

    generateTheShips(realPlayer, computerPlayer).computerPlayerShips()

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

    // Disable real player gameboard first, making it the user's move to attack computer player.
    // Insert overlay informing the user of his/her turn.
    realPlayerGameboard.className = realPlayerGameboard.className + ' move'

    const firstRowDiv = realPlayerGameboard.querySelector('.row')

    const overlay = document.createElement('div')
    overlay.className = 'overlay'

    const overlayText = document.createElement('p')
    overlayText.className = 'overlayText'
    overlayText.innerHTML = "It's <span>your move</span>, click on any tile on your opponent's board."

    overlay.append(overlayText)
    firstRowDiv.insertAdjacentElement('afterbegin', overlay)

    // Attach event listener to attack computer gameboard.
    attackGameboard(computerPlayer, realPlayer)
}

function attackGameboard(computerPlayer, realPlayer) {
    // Record hit logs on gameboard.
    function clickOnBoard(e) {
        // If the target is a valid coordinate and has not been clicked, enter here.
        if (e.target.dataset.row && e.target.dataset.col && !Array.from(e.target.classList).includes('clicked')) {
            // Marks tile on gameboard UI and identify it as "clicked".
            e.target.textContent = String.fromCharCode(0x25cf)

            const row = parseInt(e.target.dataset.row)
            const col = parseInt(e.target.dataset.col)

            e.target.className += ' clicked'

            // Remove overlay on real player gameboard.
            if (realPlayerGameboard.querySelector('.overlay') !== null) {
                realPlayerGameboard.querySelector('.overlay').remove()
            }

            // If a ship is clicked, mark the tile 'X' and record the attack on computer player's gameboard.
            if (computerPlayer.gameboard.board[row][col] !== 0) {
                // Mark on computer player and decide logic
                recordHit(computerPlayer, computerPlayerGameboard, row, col)

                // Player gets to move again.
                realPlayerMoves()
            } else {
                realPlayerGameboard.className = 'gameboard'

                // Disable computer gameboard
                computerPlayerGameboard.className = computerPlayerGameboard.className + ' move'

                // Reverts to computer move.
                setTimeout(() => {
                    computerMoves(realPlayer, computerPlayer)
                }, 1500)
            }

            // Check for the winner
            if (computerPlayer.gameboard.areAllShipsSunked) {
                endGame(realPlayer, computerPlayer)
            }
        }
    }

    computerPlayerGameboard.addEventListener('click', clickOnBoard)
}

function recordHit(player, playerGameboard, row, col) {
    const boardElem = playerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)

    // Mark on player gameboard.
    player.gameboard.receiveAttack([row, col])
    boardElem.textContent = player.gameboard.board[row][col]

    const classList = Array.from(boardElem.classList)

    // Narrow down the specific ship tile.
    const [ship] = player.gameboard.ships
        .filter((elem) => {
            if (classList.includes(elem.typeOfShip)) return elem
        })
        .filter((elem) => {
            for (let i = 0; i < elem.location.length; i++) {
                if (elem.location[i][0] === row && elem.location[i][1] === col) {
                    return elem
                }
            }
        })

    // Style boundary tiles
    const styleBoundary = (boundary) => {
        boundary.forEach((loc) => {
            let boundaryX = loc[0]
            let boundaryY = loc[1]

            let boundaryTile = playerGameboard.querySelector(`[data-row='${boundaryX}'][data-col='${boundaryY}']`)

            boundaryTile.textContent = 'X'

            if (!boundaryTile.className.includes('clicked')) {
                boundaryTile.className += ' clicked'
            }
        })
    }

    if (ship.sunk) {
        const shipTypeIcon = Array.from(playerGameboard.getElementsByClassName(`${ship.typeOfShip}Icon`))

        // Helper function to get the related ship icon.
        const getShipIcon = () => {
            const [shipIcon] = shipTypeIcon
                .filter((elem) => {
                    if (!elem.className.includes('sunk')) {
                        return elem
                    }
                })
                .toSpliced(1)

            return shipIcon
        }

        const shipIcon = getShipIcon()
        console.log(shipIcon)
        shipIcon.className = shipIcon.className + ' sunk'

        styleBoundary(ship.boundary)
    } else {
        // Style the diagonal boundary tiles.
        const getDiagonalBoundaries = () => {
            let diagonals = []

            diagonals.push([row - 1, col - 1])
            diagonals.push([row + 1, col - 1])
            diagonals.push([row - 1, col + 1])
            diagonals.push([row + 1, col + 1])

            diagonals = diagonals.filter((elem) => {
                let x = elem[0]
                let y = elem[1]

                if (x <= 9 && y <= 9 && x >= 0 && y >= 0) {
                    return elem
                }
            })

            return diagonals
        }

        const diagonalBoundaries = getDiagonalBoundaries()

        styleBoundary(diagonalBoundaries)
    }
}

function computerMoves(realPlayer, computerPlayer) {
    const randomizer = () => {
        return Math.floor(Math.random() * 10)
    }

    let [row, col] = [randomizer(), randomizer()]
    let realPlayerGameboardTile = realPlayerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)

    while (realPlayerGameboardTile.className.includes('clicked')) {
        ;[row, col] = [randomizer(), randomizer()]
        realPlayerGameboardTile = realPlayerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)
    }

    realPlayerGameboardTile.className = realPlayerGameboardTile.className + ' clicked'
    realPlayerGameboardTile.textContent = String.fromCharCode(0x25cf)

    if (realPlayer.gameboard.board[row][col] !== 0) {
        recordHit(realPlayer, realPlayerGameboard, row, col)
        setTimeout(() => {
            computerMoves(realPlayer, computerPlayer)
        }, 1500)
    } else if (realPlayer.gameboard.areAllShipsSunked) {
        endGame(realPlayer, computerPlayer)
    } else {
        setTimeout(() => {
            realPlayerMoves()
        }, 1000)
    }
}

function realPlayerMoves() {
    if (!realPlayerGameboard.className.includes('move')) {
        realPlayerGameboard.className = realPlayerGameboard.className + ' move'
    }

    computerPlayerGameboard.className = 'gameboard'
}
