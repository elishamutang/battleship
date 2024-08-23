import { Ship } from './ship'

const realPlayerGameboard = document.getElementById('realPlayer')

export default function enableDragAndDrop(realPlayer) {
    const locationDropZone = Array.from(realPlayerGameboard.getElementsByClassName('loc'))

    const firstPatrolBoat = document.querySelector('.patrolBoat')
    firstPatrolBoat.setAttribute('draggable', 'true')

    locationDropZone.forEach((loc) => {
        loc.addEventListener('dragstart', (e) => {
            const targetShipRow = e.target.dataset.row
            const targetShipCol = e.target.dataset.col

            e.dataTransfer.setData('shipRow', targetShipRow)
            e.dataTransfer.setData('shipCol', targetShipCol)

            e.dataTransfer.effectAllowed = 'move'

            // Show boundary tiles, ensure user cannot drop it into any boundary/ship tiles?
            toggleBoundary(realPlayer, [targetShipRow, targetShipCol])
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

                // No dropping on boundary tiles

                e.target.classList.add('drop-here')
            })

            loc.addEventListener('dragover', (e) => {
                e.preventDefault()
                e.stopPropagation()

                // No dropping on boundary tiles

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
            const shipRow = parseInt(e.dataTransfer.getData('shipRow'))
            const shipCol = parseInt(e.dataTransfer.getData('shipCol'))
            console.log(`Ship from ${shipRow}, ${shipCol}`)

            const shipElem = realPlayerGameboard.querySelector(`[data-row='${shipRow}'][data-col='${shipCol}']`)

            // Add drag events to previously occupied ship location.
            shipElem.addEventListener('dragenter', (e) => {
                e.preventDefault()
                e.stopPropagation()

                shipElem.classList.add('drop-here')
            })

            shipElem.addEventListener('dragover', (e) => {
                e.preventDefault()
                e.stopPropagation()

                shipElem.classList.add('drop-here')
            })

            // Old ship object
            const shipObj = getShip(realPlayer, shipElem)

            // New ship location
            const newRow = parseInt(e.target.dataset.row)
            const newCol = parseInt(e.target.dataset.col)

            // Update new location of old ship.
            changeLocation(realPlayer, shipObj, [newRow, newCol])
        })

        loc.addEventListener('dragend', (e) => {
            // Remove noDrop styling
            toggleBoundary(realPlayer)
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

function changeLocation(realPlayer, shipObj, newLoc) {
    // Destructure new location
    const [newRow, newCol] = newLoc
    console.log(`Ship moved to ${newLoc}`)

    // Create new ship object.
    const newShip = new Ship(shipObj.length)

    // Remove old ship from real player gameboard and place at new location.
    realPlayer.gameboard.removeShip(shipObj)
    realPlayer.gameboard.placeShip(newShip, [newRow, newCol])

    const newShipElem = realPlayerGameboard.querySelector(`[data-row='${newRow}'][data-col='${newCol}']`)
    newShipElem.classList.add(`${newShip.typeOfShip}`)
    newShipElem.setAttribute('draggable', 'true')

    const newShipObj = getShip(realPlayer, newShipElem)
    console.log(newShipObj)

    // Remove from DOM
    // Below needs to change to suit other ships of length > 1
    const oldRow = shipObj.location[0][0]
    const oldCol = shipObj.location[0][1]

    const oldShipElem = realPlayerGameboard.querySelector(`[data-row='${oldRow}'][data-col='${oldCol}']`)

    // If position changes, update classlist and attribute.
    if (newShipElem !== oldShipElem) {
        oldShipElem.classList.remove(`${shipObj.typeOfShip}`)
        oldShipElem.classList.remove('hover')
        oldShipElem.removeAttribute('draggable')
    }
}

function toggleBoundary(realPlayer, currentLoc) {
    // If currentLoc is provided, add noDrop class to boundary location elements, else remove class.
    if (currentLoc) {
        const [currRow, currCol] = currentLoc

        const currShipElem = realPlayerGameboard.querySelector(`[data-row='${currRow}'][data-col='${currCol}']`)
        const currShipObj = getShip(realPlayer, currShipElem)

        realPlayer.gameboard.ships.forEach((ship) => {
            if (ship !== currShipObj) {
                ship.boundary.forEach((loc) => {
                    const boundaryX = loc[0]
                    const boundaryY = loc[1]

                    const boundaryElem = realPlayerGameboard.querySelector(
                        `[data-row='${boundaryX}'][data-col='${boundaryY}']`
                    )

                    boundaryElem.classList.add('noDrop')
                })
            }
        })
    } else {
        // Remove noDrop class
        realPlayer.gameboard.ships.forEach((ship) => {
            ship.boundary.forEach((loc) => {
                const boundaryX = loc[0]
                const boundaryY = loc[1]

                const boundaryElem = realPlayerGameboard.querySelector(
                    `[data-row='${boundaryX}'][data-col='${boundaryY}']`
                )

                if (boundaryElem.classList.contains('noDrop')) {
                    boundaryElem.classList.remove('noDrop')
                }
            })
        })
    }
}
