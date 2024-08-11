import generateTheDOM from './theDOM'

export default function endGame(realPlayerGameboard, realPlayer, computerPlayerGameboard, computerPlayer) {
    // Disable gameboards.
    const allTiles = Array.from(computerPlayerGameboard.getElementsByClassName('loc'))

    allTiles.forEach((tile) => {
        tile.className = tile.className + ' no-hover'
    })

    computerPlayerGameboard.className = computerPlayerGameboard.className + ' gameover'
    realPlayerGameboard.className = realPlayerGameboard.className + ' gameover'

    // Add end game banner
    const bannerElem = document.getElementById('banner')
    const bannerElemClone = bannerElem.cloneNode(true)

    const announcement = document.createElement('h1')
    announcement.id = 'announcement'
    announcement.textContent = 'You won!' // Announce the winner

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
        const computerPlayerGameboardChildren = Array.from(computerPlayerGameboard.children)

        for (let i = 1; i < realPlayerGameboardChildren.length; i++) {
            realPlayerGameboardChildren[i].remove()
            computerPlayerGameboardChildren[i].remove()
        }

        // Re-generate the DOM.
        generateTheDOM()
    })
}
