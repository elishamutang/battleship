export default function enableDragAndDrop(realPlayer) {
    const realPlayerGameboard = document.getElementById('realPlayer')

    const locationDropZone = Array.from(realPlayerGameboard.getElementsByClassName('loc'))

    const firstPatrolBoat = document.querySelector('.patrolBoat')
    firstPatrolBoat.setAttribute('draggable', 'true')

    console.log(firstPatrolBoat)

    locationDropZone.forEach((loc) => {
        loc.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('shipRow', e.target.dataset.row)
            e.dataTransfer.setData('shipCol', e.target.dataset.col)

            e.dataTransfer.effectAllowed = 'move'
        })

        if (
            !loc.classList.contains('patrolBoat') &&
            !loc.classList.contains('destroyer') &&
            !loc.classList.contains('battleShip') &&
            !loc.classList.contains('carrier')
        ) {
            loc.addEventListener('dragenter', (e) => {
                e.preventDefault()
                e.stopPropagation()

                e.target.classList.add('drop-here')
            })

            loc.addEventListener('dragover', (e) => {
                e.preventDefault()
                e.stopPropagation()

                console.log(`${e.target.dataset.row}, ${e.target.dataset.col}`)

                // e.dataTransfer.setData('hoverX', e.target.dataset.row)
                // e.dataTransfer.setData('hoverY', e.target.dataset.col)

                e.target.classList.add('drop-here')
            })
        }

        loc.addEventListener('dragleave', (e) => {
            e.preventDefault()
            e.stopPropagation()

            loc.classList.remove('drop-here')
        })

        loc.addEventListener('drop', (e) => {
            e.preventDefault()
            e.stopPropagation()

            // Old Ship
            const shipRow = e.dataTransfer.getData('shipRow')
            const shipCol = e.dataTransfer.getData('shipCol')
            console.log(`Ship from ${shipRow}, ${shipCol}`)

            const shipElem = realPlayerGameboard.querySelector(`[data-row='${shipRow}'][data-col='${shipCol}']`)

            // Ship object
            const shipObj = getShip(realPlayer, shipElem)

            changeLocation(realPlayer, shipObj)
        })
    })
}

function getShip(realPlayer, shipElem) {
    const shipRow = parseInt(shipElem.dataset.row)
    const shipCol = parseInt(shipElem.dataset.col)

    const [shipType] = Array.from(shipElem.classList).filter((name) => {
        if (name === 'patrolBoat' || name === 'battleShip' || name === 'destroyer' || name === 'carrier') {
            return name
        }
    })

    const relevantShips = realPlayer.gameboard.ships.filter((ship) => {
        if (ship.typeOfShip === shipType) {
            return ship
        }
    })

    for (let i = 0; i < relevantShips.length; i++) {
        for (let j = 0; j < relevantShips[i].location.length; j++) {
            const x = relevantShips[i].location[j][0]
            const y = relevantShips[i].location[j][1]

            if (shipRow === x && shipCol === y) {
                return relevantShips[i]
            }
        }
    }
}

function changeLocation(realPlayer, shipObj) {
    // Remove ship from realPlayer object
    realPlayer.gameboard.ships.forEach((ship, idx) => {
        if (ship === shipObj) {
            console.log(ship)
            console.log(`Index: ${idx}`)

            realPlayer.gameboard.ships.splice(idx, 1)
        }
    })

    // Remove from DOM.

    // Add new ship with placeShip method.
}
