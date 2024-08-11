import { refreshStyling, generateTheShips, hoverOverRealPlayerShips } from './theDOM'

export default function startGame(realPlayer, computerPlayer) {
    // Get the gameboards
    const realPlayerGameboard = document.getElementById('realPlayer')
    const computerPlayerGameboard = document.getElementById('computerPlayer')

    realPlayerGameboard.removeEventListener('mouseover', hoverOverRealPlayerShips)

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
