import { generateTheShips, hoverOverRealPlayerShips, flipTheShip } from './theDOM'
import endGame from './endGame'

export default function startGame(realPlayer, computerPlayer) {
    // Main
    const mainDiv = document.querySelector('main')
    mainDiv.className = 'start'

    // Get the gameboards
    const realPlayerGameboard = document.getElementById('realPlayer')
    const computerPlayerGameboard = document.getElementById('computerPlayer')

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
    attackGameboard(computerPlayer, computerPlayerGameboard, realPlayer, realPlayerGameboard)
}

function attackGameboard(computerPlayer, computerPlayerGameboard, realPlayer, realPlayerGameboard) {
    // Record hit logs on gameboard.
    function clickOnBoard(e) {
        // If the target is a valid coordinate and it has not been clicked, enter here.
        if (e.target.dataset.row && e.target.dataset.col && !Array.from(e.target.classList).includes('clicked')) {
            // Marks tile on gameboard UI and identify it as "clicked".
            e.target.textContent = String.fromCharCode(0x25cf)

            const row = parseInt(e.target.dataset.row)
            const col = parseInt(e.target.dataset.col)

            // If a ship is clicked, mark the tile 'X' and record the attack on computer player's gameboard.
            if (computerPlayer.gameboard.board[row][col] !== 0) {
                e.target.textContent = 'X'

                computerPlayer.gameboard.receiveAttack([row, col])

                const classList = Array.from(e.target.classList)

                // Narrow down the specific ship tile.
                const [ship] = computerPlayer.gameboard.ships
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

                const shipTypeIcon = Array.from(
                    computerPlayerGameboard.getElementsByClassName(`${ship.typeOfShip}Icon`)
                )

                if (ship.sunk) {
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
                    shipIcon.className = shipIcon.className + ' sunk'

                    ship.boundary.forEach((loc) => {
                        let boundaryX = loc[0]
                        let boundaryY = loc[1]

                        let boundaryTile = computerPlayerGameboard.querySelector(
                            `[data-row='${boundaryX}'][data-col='${boundaryY}']`
                        )

                        boundaryTile.textContent = 'X'
                        boundaryTile.className = boundaryTile.className + ' clicked boundaryLoc'
                    })
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

                    diagonalBoundaries.forEach((boundary) => {
                        let diagonalX = boundary[0]
                        let diagonalY = boundary[1]

                        let boundaryTile = computerPlayerGameboard.querySelector(
                            `[data-row='${diagonalX}'][data-col='${diagonalY}']`
                        )

                        if (!boundaryTile.className.includes('clicked')) {
                            boundaryTile.textContent = 'X'
                            boundaryTile.className = boundaryTile.className + ' clicked boundaryLoc'
                        }
                    })
                }
            }

            if (computerPlayer.gameboard.areAllShipsSunked) {
                computerPlayerGameboard.className = 'gameboard lost'

                computerPlayerGameboard.removeEventListener('click', clickOnBoard)

                endGame(realPlayerGameboard, realPlayer, computerPlayerGameboard, computerPlayer)
            }

            e.target.className += ' clicked'
        }
    }

    computerPlayerGameboard.addEventListener('click', clickOnBoard)
}
