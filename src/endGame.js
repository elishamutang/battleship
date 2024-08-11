export default function endGame(realPlayerGameboard, computerPlayerGameboard) {
    // Announce the winner
    setTimeout(() => {
        alert('You won!')
    }, 200)

    // Disable gameboards.
    const allTiles = Array.from(computerPlayerGameboard.getElementsByClassName('loc'))

    allTiles.forEach((tile) => {
        tile.className = tile.className + ' no-hover'
    })

    computerPlayerGameboard.className = computerPlayerGameboard.className + ' gameover'
    realPlayerGameboard.className = realPlayerGameboard.className + ' gameover'

    // Add restart button.
}
