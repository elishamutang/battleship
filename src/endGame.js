export default function endGame(realPlayerGameboard, computerPlayerGameboard) {
    // Disable gameboards.
    const allTiles = Array.from(computerPlayerGameboard.getElementsByClassName('loc'))

    allTiles.forEach((tile) => {
        tile.className = tile.className + ' no-hover'
    })

    computerPlayerGameboard.className = computerPlayerGameboard.className + ' gameover'
    realPlayerGameboard.className = realPlayerGameboard.className + ' gameover'

    // Add end game banner
    const mainDiv = document.querySelector('main')

    const endGameBanner = document.createElement('div')
    endGameBanner.id = 'endGameBanner'
    endGameBanner.textContent = 'You won!' // Announce the winner

    mainDiv.insertAdjacentElement('afterbegin', endGameBanner)

    // Add restart button.
}
