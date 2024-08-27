import setUp from './theDOM'

export default function endGame(realPlayer, computerPlayer) {
    const realPlayerGameboard = document.getElementById('realPlayer')
    const computerPlayerGameboard = document.getElementById('computerPlayer')

    computerPlayerGameboard.className = 'gameboard gameover'
    realPlayerGameboard.className = 'gameboard gameover'

    // Winner
    const winner = computerPlayer.gameboard.areAllShipsSunked ? 'You' : 'ChadGPZ'

    // Add end game banner
    const bannerElem = document.getElementById('banner')
    const bannerElemClone = bannerElem.cloneNode(true)

    const announcement = document.createElement('h1')
    announcement.id = 'announcement'
    announcement.textContent = `${winner} won!`

    bannerElem.innerHTML = ''
    bannerElem.className = 'endGame'
    bannerElem.append(announcement)

    // Add restart button.
    const restartBtn = document.createElement('button')
    restartBtn.id = 'restartBtn'
    restartBtn.textContent = 'Re-match?'

    bannerElem.append(restartBtn)

    restartBtn.addEventListener('click', (e) => {
        // Reset gameboards.
        realPlayer.gameboard.reset()
        computerPlayer.gameboard.reset()

        // Remove end game banner and gameboards.
        document.getElementById('banner').remove()

        // Replace end game banner with Battleship title.
        document.querySelector('main').insertAdjacentElement('afterbegin', bannerElemClone)

        realPlayerGameboard.className = 'gameboard'
        computerPlayerGameboard.className = 'gameboard'

        const realPlayerGameboardChildren = Array.from(realPlayerGameboard.children)
        const playerGameboardChildren = Array.from(computerPlayerGameboard.children)

        for (let i = 1; i < realPlayerGameboardChildren.length; i++) {
            realPlayerGameboardChildren[i].remove()
            playerGameboardChildren[i].remove()
        }

        // Re-generate the DOM.
        setUp()
    })
}
