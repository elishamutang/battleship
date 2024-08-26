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

    // Generate ships and hide them.
    generateTheShips(realPlayer, computerPlayer).computerPlayerShips()

    const computerShips = Array.from(computerPlayerGameboard.getElementsByClassName('shipDiv'))
    computerShips.forEach((ship) => {
        ship.parentNode.style.border = '1px solid black'
        ship.style.visibility = 'hidden'
    })

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
        if (e.target.dataset.row && e.target.dataset.col && !e.target.className.includes('clicked')) {
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
            console.log(loc)
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

function getAdjacentTiles(realPlayerGameboardTile) {
    const row = parseInt(realPlayerGameboardTile.dataset.row)
    const col = parseInt(realPlayerGameboardTile.dataset.col)

    // Narrow down the specific ship tile.
    let adjacentTiles = []

    adjacentTiles.push([row, col - 1])
    adjacentTiles.push([row - 1, col])
    adjacentTiles.push([row + 1, col])
    adjacentTiles.push([row, col + 1])

    adjacentTiles = adjacentTiles.filter((elem) => {
        let x = elem[0]
        let y = elem[1]

        if (x <= 9 && y <= 9 && x >= 0 && y >= 0) {
            return elem
        }
    })

    return adjacentTiles
}

// Keep track of previous ship
let lastShip

function computerMoves(realPlayer, computerPlayer, shipAdjTiles, currentShip) {
    // End game.
    if (realPlayer.gameboard.areAllShipsSunked) {
        console.log('end game')
        endGame(realPlayer, computerPlayer)
        return
    }

    const randomizer = () => {
        return Math.floor(Math.random() * 10)
    }

    // Initial coordinates, if no shipAdjTiles provided
    let [row, col] = [randomizer(), randomizer()]
    let realPlayerGameboardTile = realPlayerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)

    // Percentage of ship health
    let healthOfShip

    if (shipAdjTiles && !currentShip.sunk) {
        const randomTile = (tiles) => {
            let adjacentTiles = tiles || shipAdjTiles
            const randomIdx = Math.floor(Math.random() * adjacentTiles.length)

            const [tile] = adjacentTiles.splice(randomIdx, 1)

            return tile
        }

        let adjTile = randomTile()
        ;[row, col] = adjTile
        console.log(`Next adj: ${row}, ${col}`)

        realPlayerGameboardTile = realPlayerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)

        // Percentage of ship health
        healthOfShip = (currentShip.hitsTaken / currentShip.length) * 100

        if (healthOfShip > 50) {
            const remainingLoc = currentShip.location.filter((elem) => {
                let locX = elem[0]
                let locY = elem[1]

                const isClicked = realPlayerGameboard.querySelector(`[data-row='${locX}'][data-col='${locY}']`)

                if (!isClicked.className.includes('clicked')) {
                    return elem
                }
            })

            const randomRemainingTile = () => {
                const randomIdx = Math.floor(Math.random() * remainingLoc.length)

                const [tile] = remainingLoc.splice(randomIdx, 1)
                return tile
            }

            adjTile = randomRemainingTile()
            ;[row, col] = adjTile
            console.log(`Going to remaining loc: ${row}, ${col}`)
            realPlayerGameboardTile = realPlayerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)
        } else {
            // If adjacent tile has already been clicked, choose another tile.

            let baseTile

            const changeTile = (realPlayerGameboardTile, tiles) => {
                if (realPlayerGameboardTile.className.includes('clicked')) {
                    adjTile = randomTile(tiles)

                    if (adjTile) {
                        ;[row, col] = adjTile
                        console.log(`Re-locating to: ${row}, ${col}`)

                        realPlayerGameboardTile = realPlayerGameboard.querySelector(
                            `[data-row='${row}'][data-col='${col}']`
                        )

                        if (realPlayerGameboardTile.className.includes(currentShip.typeOfShip)) {
                            baseTile = adjTile
                        }

                        changeTile(realPlayerGameboardTile)
                    } else {
                        return false
                    }
                }
            }

            let tileChange = changeTile(realPlayerGameboardTile)

            // Go back to base tile and try adjacent tiles.
            if (!tileChange && baseTile) {
                console.log(realPlayerGameboardTile)
                console.log(`Base tile: ${baseTile}`)

                realPlayerGameboardTile = realPlayerGameboard.querySelector(
                    `[data-row='${baseTile[0]}'][data-col='${baseTile[1]}']`
                )

                const baseAdjTiles = getAdjacentTiles(realPlayerGameboardTile)

                changeTile(realPlayerGameboardTile, baseAdjTiles)
            }

            console.log(`shipAdjTiles length: ${shipAdjTiles.length}`)
        }
    } else {
        while (realPlayerGameboardTile.className.includes('clicked')) {
            ;[row, col] = [randomizer(), randomizer()]
            realPlayerGameboardTile = realPlayerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)
        }
    }

    // If previous move hit location occupied by ship and next move did not hit adjacent location of ship,
    // go back to previous ship and try other adjacent locations.
    if (lastShip !== currentShip && !lastShip.sunk) {
        const [firstClickedTile] = lastShip.location.filter((elem) => {
            let tileX = elem[0]
            let tileY = elem[1]

            let tileElement = realPlayerGameboard.querySelector(`[data-row='${tileX}'][data-col='${tileY}']`)

            if (tileElement.className.includes('clicked')) {
                return elem
            }
        })

        const firstClickedTileElem = realPlayerGameboard.querySelector(
            `[data-row='${firstClickedTile[0]}'][data-col='${firstClickedTile[1]}']`
        )

        const lastShipAdjTiles = getAdjacentTiles(firstClickedTileElem)

        const randomTile = () => {
            const randomIdx = Math.floor(Math.random() * lastShipAdjTiles.length)

            const [tile] = lastShipAdjTiles.splice(randomIdx, 1)

            return tile
        }

        let nextTileChoice = randomTile()
        ;[row, col] = nextTileChoice
        console.log(`Last ship not sunk, go back to ship and try adjacent tile: ${row},${col}`)

        realPlayerGameboardTile = realPlayerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)

        while (realPlayerGameboardTile.className.includes('clicked')) {
            nextTileChoice = randomTile()
            ;[row, col] = nextTileChoice

            realPlayerGameboardTile = realPlayerGameboard.querySelector(`[data-row='${row}'][data-col='${col}']`)
        }
    }

    console.log(realPlayerGameboardTile)
    realPlayerGameboardTile.className = realPlayerGameboardTile.className + ' clicked'
    realPlayerGameboardTile.textContent = String.fromCharCode(0x25cf)

    if (realPlayer.gameboard.board[row][col] !== 0) {
        // Find ship in realPlayer.gameboard.board
        let [ship] = realPlayer.gameboard.ships
            .filter((elem) => {
                if (realPlayerGameboardTile.className.includes(elem.typeOfShip)) return elem
            })
            .filter((elem) => {
                for (let i = 0; i < elem.location.length; i++) {
                    if (row === elem.location[i][0] && col === elem.location[i][1]) {
                        return elem
                    }
                }
            })

        // Overwrite last ship
        if (!lastShip || lastShip.sunk) {
            lastShip = ship
        }

        // Initialise adjTiles
        let adjTiles

        // First hit to get adjacent tiles (up, right, down, left tiles)
        if (realPlayer.gameboard.board[row][col] !== 'p') {
            adjTiles = getAdjacentTiles(realPlayerGameboardTile)
        }

        recordHit(realPlayer, realPlayerGameboard, row, col)
        console.log(`Hit recorded at ${row}, ${col}`)

        setTimeout(() => {
            computerMoves(realPlayer, computerPlayer, adjTiles, ship)
        }, 1500)
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
