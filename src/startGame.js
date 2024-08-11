import { refreshStyling, generateTheShips, hoverOverRealPlayerShips, flipTheShip } from './theDOM'

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
}
