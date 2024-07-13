import { Ship } from './ship'
import { Gameboard } from './gameboard'
import { Player } from './player'

// Main function to generate DOM.
export default function generateTheDOM() {
    // Initialize players
    const realPlayer = new Player()
    const computerPlayer = new Player()

    // Generate gameboard
    const realPlayerGameboard = document.getElementById('realPlayer')
    const computerPlayerGameboard = document.getElementById('computerPlayer')

    generateGameboard(realPlayer, realPlayerGameboard)
    generateGameboard(computerPlayer, computerPlayerGameboard)

    // Align gameboard coordinates between DOM and Gameboard class (this code can be converted into a func).
    let realPlayerDOMGameboard = Array.from(realPlayerGameboard.querySelectorAll('[data-coord]'))

    const alignedGameboard = realPlayer.gameboard.board.filter((row, idx) => {
        if (idx !== 0) return row
    })

    // Map each DOM coordinate to the player gameboard.
    // Playable gameboard is now 10 x 10
    alignedGameboard.forEach((row) => {
        row.pop()

        row.forEach((loc, idx) => {
            row[idx] = realPlayerDOMGameboard.shift().dataset.coord
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

            demoGameboardRow = demoGameboardRow.slice(0, demoGameboardRow.indexOf(NaN)).join('') - 1

            // Logs on player gameboard.
            alignedGameboard[demoGameboardRow].forEach((loc, idx) => {
                if (loc === e.target.dataset.coord) {
                    console.log(alignedGameboard[demoGameboardRow][idx])
                    alignedGameboard[demoGameboardRow][idx] = 'x'
                }
            })

            console.log(alignedGameboard)
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
