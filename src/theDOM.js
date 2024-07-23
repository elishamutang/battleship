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

    // Generate gameboard
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

    // const destroyers = Array(3).fill(new Ship(3))
    // const battleships = Array(2).fill(new Ship(4))
    // const carrier = [new Ship(5)]

    realPlayer.gameboard.placeShip(patrolBoats.shift(), [0, 0]) // Patrol boat
    realPlayer.gameboard.placeShip(patrolBoats.shift(), [9, 2])
    realPlayer.gameboard.placeShip(patrolBoats.shift(), [2, 4])
    realPlayer.gameboard.placeShip(patrolBoats.shift(), [5, 9])

    // realPlayer.gameboard.placeShip(destroyers.shift(), [0, 0]) // Destroyer

    console.log(realPlayer.gameboard.board)

    const getAllRowsRealPlayer = Array.from(realPlayerGameboard.getElementsByClassName('row'))

    realPlayer.gameboard.board.forEach((row, rowIdx) => {
        row.forEach((loc, idx) => {
            if (loc === 'p') {
                // console.log(rowIdx + 1, idx + 1)
                // console.log(getAllRowsRealPlayer[rowIdx + 1].children[idx + 1])
                getAllRowsRealPlayer[rowIdx + 1].children[idx + 1].className += ' patrolBoat'
            }
        })
    })

    // Add event listener to interact with gameboards.
    // Record hit logs on gameboard.
    realPlayerGameboard.addEventListener('click', (e) => {
        if (e.target.dataset.coord) {
            // Displays on gameboard UI.
            e.target.textContent = 'x'

            let demoGameboardRow = e.target.dataset.coord.split('').map((elem) => {
                return parseInt(elem)
            })

            demoGameboardRow = parseInt(demoGameboardRow.slice(0, demoGameboardRow.indexOf(NaN)).join('')) - 1

            // Use the referenceGameboard to identify the coordinate.
            // If coordinate is not present in realPlayer gameboard, then it is occupied by a type of 'Ship'.

            // The DOM has the coordinates of the tile that is clicked and the position of that coordinate in the realPlayer.gameboard.board can be
            // cross-checked with the referenceGameboard.
            if (!realPlayer.gameboard.board[demoGameboardRow].includes(e.target.dataset.coord)) {
                referenceGameboard.gameboard.board[demoGameboardRow].forEach((loc, idx) => {
                    // Tile that is clicked on the DOM is cross-checked against the referenceGameboard.
                    if (loc === e.target.dataset.coord) {
                        let x = demoGameboardRow
                        let y = idx

                        console.log(x, y)

                        realPlayer.gameboard.receiveAttack([x, y])
                    }
                })
            }

            console.log(realPlayer.gameboard)
        }
    })
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
