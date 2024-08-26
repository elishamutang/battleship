import { Ship } from './ship'

const realPlayerGameboard = document.getElementById('realPlayer')

export default function enableDragAndDrop(realPlayerObj) {
    const locationDropZone = Array.from(realPlayerGameboard.getElementsByClassName('loc'))

    const attachEventListeners = (ships) => {
        ships.forEach((ship) => {
            ship.setAttribute('draggable', 'true')

            ship.addEventListener('dragstart', (e) => {
                dragStartHandler(e, realPlayerObj)
            })

            ship.addEventListener('dragend', (e) => {
                dragEndHandler(e, realPlayerObj)
            })
        })
    }

    // Get all ships
    const allShips = Array.from(realPlayerGameboard.getElementsByClassName('shipDiv'))
    attachEventListeners(allShips)

    // Open (or available) tiles to drop.
    locationDropZone.forEach((loc) => {
        if (loc.classList.length === 1 && loc.classList.contains('loc')) {
            loc.addEventListener('dragenter', (e) => {
                e.preventDefault()
                e.stopPropagation()

                e.target.classList.add('drop-here')
            })

            loc.addEventListener('dragover', (e) => {
                e.preventDefault()
                e.stopPropagation()

                e.target.classList.add('drop-here')
            })

            loc.addEventListener('dragleave', (e) => {
                e.preventDefault()
                e.stopPropagation()

                loc.classList.remove('drop-here')
            })

            loc.addEventListener('drop', (e) => {
                e.preventDefault()
                e.stopPropagation()

                e.target.classList.remove('drop-here')

                // Old Ship
                const shipRow = parseInt(e.dataTransfer.getData('shipRow'))
                const shipCol = parseInt(e.dataTransfer.getData('shipCol'))
                const shipDivClass = e.dataTransfer.getData('className')
                console.log(`Ship from ${shipRow}, ${shipCol}`)

                const shipElemParent = realPlayerGameboard.querySelector(
                    `[data-row='${shipRow}'][data-col='${shipCol}']`
                )

                // Old ship object
                const shipObj = getShip(realPlayerObj, shipElemParent)

                // New ship location
                const newRow = parseInt(e.target.dataset.row)
                const newCol = parseInt(e.target.dataset.col)

                if (isNaN(newRow) && isNaN(newCol)) {
                    return
                }

                // Update new location of old ship.
                changeLocation(realPlayerObj, shipObj, [newRow, newCol], shipDivClass)
            })
        }
    })
}

function getShip(realPlayerObj, shipElem) {
    const shipRow = parseInt(shipElem.dataset.row)
    const shipCol = parseInt(shipElem.dataset.col)

    const [shipType] = Array.from(shipElem.firstChild.classList).filter((name) => {
        if (name === 'patrolBoat' || name === 'battleShip' || name === 'destroyer' || name === 'carrier') {
            return name
        }
    })

    console.log(realPlayerObj)

    const relevantShips = realPlayerObj.gameboard.ships.filter((ship) => {
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

function changeLocation(realPlayerObj, shipObj, newLoc, shipDivClass) {
    // Destructure new location
    const [newRow, newCol] = newLoc
    console.log(`Ship moved to ${newLoc}`)

    // Create new ship object.
    const newShip = new Ship(shipObj.length)

    // Remove old ship from real player gameboard and place at new location.
    realPlayerObj.gameboard.removeShip(shipObj)

    if (shipDivClass.includes('vertical')) {
        realPlayerObj.gameboard.placeShip(newShip, [newRow, newCol], 'vertical')
    } else {
        realPlayerObj.gameboard.placeShip(newShip, [newRow, newCol])
    }

    const newShipParent = realPlayerGameboard.querySelector(`[data-row='${newRow}'][data-col='${newCol}']`)

    const newShipDiv = document.createElement('div')
    newShipDiv.className = shipDivClass
    newShipDiv.setAttribute('draggable', 'true')

    // Apply special last row styling.
    if (newRow === 9) {
        newShipDiv.classList.add('last-row')
    }

    // Re-attach event listeners.
    newShipDiv.addEventListener('dragstart', (e) => {
        dragStartHandler(e, realPlayerObj)
    })

    newShipDiv.addEventListener('dragend', (e) => {
        dragEndHandler(e, realPlayerObj)
    })

    newShipParent.append(newShipDiv)

    // Remove from DOM
    // BELOW NEEDS TO CHANGE TO SUIT SHIP LENGTH > 1
    const oldRow = shipObj.location[0][0]
    const oldCol = shipObj.location[0][1]

    const oldShipElem = realPlayerGameboard.querySelector(`[data-row='${oldRow}'][data-col='${oldCol}']`)
    oldShipElem.firstChild.remove()

    // If position changes, update classlist and attribute.
    if (newShipParent !== oldShipElem) {
        oldShipElem.classList.remove('hover')
        oldShipElem.removeAttribute('draggable')
    }
}

function toggleBoundary(realPlayerObj, currentLoc) {
    // If currentLoc is provided, add noDrop class to boundary location elements, else remove class.
    if (currentLoc) {
        const [currRow, currCol] = currentLoc

        const currShipElem = realPlayerGameboard.querySelector(`[data-row='${currRow}'][data-col='${currCol}']`)
        const currShipObj = getShip(realPlayerObj, currShipElem)

        realPlayerObj.gameboard.ships.forEach((ship) => {
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
        realPlayerObj.gameboard.ships.forEach((ship) => {
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

function dragStartHandler(e, realPlayerObj) {
    const selectedShipRow = e.target.parentNode.dataset.row
    const selectedShipCol = e.target.parentNode.dataset.col

    console.log(selectedShipRow, selectedShipCol)

    e.dataTransfer.setData('shipRow', selectedShipRow)
    e.dataTransfer.setData('shipCol', selectedShipCol)
    e.dataTransfer.setData('className', e.target.className)

    e.dataTransfer.effectAllowed = 'move'

    // Show boundary tiles, ensure user cannot drop it into any boundary/ship tiles.
    toggleBoundary(realPlayerObj, [selectedShipRow, selectedShipCol])
}

function dragEndHandler(e, realPlayerObj) {
    e.preventDefault()
    e.stopPropagation()

    toggleBoundary(realPlayerObj)
}
