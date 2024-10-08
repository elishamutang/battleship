import { Ship } from './ship'

const realPlayerGameboard = document.getElementById('realPlayer')

export default function enableDragAndDrop(realPlayerObj) {
    const locationDropZone = Array.from(realPlayerGameboard.getElementsByClassName('loc'))

    // Ship drag and drop
    shipDragAndDrop(realPlayerObj)

    // Open (or available) tiles to drop.
    locationDropZone.forEach((loc) => {
        if (loc.classList.length === 1 && loc.classList.contains('loc')) {
            loc.addEventListener('dragenter', (e) => {
                e.preventDefault()
                e.stopPropagation()

                // Style available tiles for ships with length > 1
                styleOpenLocationsForBiggerShips(e)
            })

            loc.addEventListener('dragover', (e) => {
                e.preventDefault()
                e.stopPropagation()

                styleOpenLocationsForBiggerShips(e)
            })

            loc.addEventListener('dragleave', (e) => {
                e.preventDefault()
                e.stopPropagation()

                // Remove styling for available tiles for ships with length > 1
                styleOpenLocationsForBiggerShips(e, true)
            })

            loc.addEventListener('drop', (e) => {
                e.preventDefault()
                e.stopPropagation()

                // Remove styling after drop.
                styleOpenLocationsForBiggerShips(e, true)

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

                // Check if ship path is out of bounds of gameboard and return if it is.
                const shipOrientation = shipDivClass.substr(shipDivClass.search('horizontal'))
                const shipPath = createShipPath(newRow, newCol, shipOrientation)

                if (!shipPath) return

                // Check if ship path is clear
                if (!isPathClear(newRow, newCol, shipOrientation)) return

                // Update new location of old ship.
                changeLocation(realPlayerObj, shipObj, [newRow, newCol], shipDivClass)
            })
        }
    })
}

let shipLength
let shipOrientation

function styleOpenLocationsForBiggerShips(e, remove) {
    // Reset tiles with no-path class.
    Array.from(realPlayerGameboard.getElementsByClassName('no-path')).forEach((tile) => {
        tile.classList.remove('no-path')
    })

    // Get ship
    const shipLocX = !e.target.dataset.row ? parseInt(e.target.parentNode.dataset.row) : parseInt(e.target.dataset.row)
    const shipLocY = !e.target.dataset.col ? parseInt(e.target.parentNode.dataset.col) : parseInt(e.target.dataset.col)

    // Store all tiles that the ship might occupy.
    const tilesForDrop = []

    if (shipOrientation === 'horizontal') {
        for (let i = 0; i < shipLength; i++) {
            const element = realPlayerGameboard.querySelector(`[data-row='${shipLocX}'][data-col='${shipLocY + i}']`)
            tilesForDrop.push(element)
        }
    } else {
        for (let i = 0; i < shipLength; i++) {
            const element = realPlayerGameboard.querySelector(`[data-row='${shipLocX + i}'][data-col='${shipLocY}']`)
            tilesForDrop.push(element)
        }
    }

    // Ships with length > 1
    if (shipLength > 1) {
        // Generate expected ship pathway based on new location.
        const shipPath = createShipPath(shipLocX, shipLocY, shipOrientation)
        if (!shipPath) return

        // Check if path is clear (e.g all tiles are available to drop onto for the selected ships).
        // If path not clear, disable pointer events for the starting point tile.
        if (!isPathClear(shipLocX, shipLocY, shipOrientation)) {
            tilesForDrop.forEach((tile) => {
                tile.classList.add('no-path')
            })
        }

        tilesForDrop.forEach((tile) => {
            if (tile.classList.contains('noDrop')) {
                tilesForDrop[0].classList.remove('drop-here')
            } else {
                tile.classList.add('drop-here')
            }
        })
    } else {
        tilesForDrop[0].classList.add('drop-here')
    }

    // Remove blue border styling.
    if (remove && tilesForDrop) {
        tilesForDrop.forEach((tile) => {
            tile.classList.remove('drop-here')
        })
    }
}

// Checks if new proposed location is all clear to drop ship.
function isPathClear(shipRow, shipCol, shipOrientation) {
    if (shipOrientation === 'horizontal') {
        for (let i = 0; i < shipLength; i++) {
            const element = realPlayerGameboard.querySelector(`[data-row='${shipRow}'][data-col='${shipCol + i}']`)

            if (element.classList.contains('noDrop')) {
                return false
            }
        }
    } else {
        for (let i = 0; i < shipLength; i++) {
            const element = realPlayerGameboard.querySelector(`[data-row='${shipRow + i}'][data-col='${shipCol}']`)

            if (element.classList.contains('noDrop')) {
                return false
            }
        }
    }

    return true
}

// Generate ship path at a particular starting point.
function createShipPath(shipLocX, shipLocY, shipOrientation) {
    let result = []

    if (shipOrientation === 'horizontal') {
        for (let i = 1; i < shipLength; i++) {
            if (shipLocY + i > 9) {
                return false
            }

            result.push([shipLocX, shipLocY + i])
        }
    } else {
        for (let i = 1; i < shipLength; i++) {
            if (shipLocX + i > 9) {
                return false
            }

            result.push([shipLocX + i, shipLocY])
        }
    }

    result.unshift([shipLocX, shipLocY])
    return result
}

export function shipDragAndDrop(realPlayerObj) {
    // Ship drag and drop.
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

    insertDraggableShips(realPlayerObj)

    // Get all ships
    const allShips = Array.from(realPlayerGameboard.getElementsByClassName('shipDiv'))
    attachEventListeners(allShips)
}

export function insertDraggableShips(realPlayerObj) {
    // Get all ships
    const allShips = realPlayerObj.gameboard.ships

    // Function to generate icons for each type of ship.
    const generateShipGameboardIcon = (ships) => {
        ships.forEach((ship) => {
            const shipStartPoint = realPlayerGameboard.querySelector(
                `[data-row='${ship.location[0][0]}'][data-col='${ship.location[0][1]}']`
            )

            const shipDiv = document.createElement('div')
            shipDiv.className = `loc ${ship.typeOfShip} shipDiv`

            if (shipStartPoint.children.length === 0) {
                shipStartPoint.append(shipDiv)
            }

            if (ship.length > 1) {
                const shipAdjTile = realPlayerGameboard.querySelector(
                    `[data-row='${ship.location[1][0]}'][data-col='${ship.location[1][1]}']`
                )

                // Ship currently at last row, add special styling.
                if (ship.location[0][0] === 9) {
                    shipStartPoint.firstChild.classList.add('last-row')
                }

                // Ship currently vertical
                if (shipStartPoint.dataset.row < shipAdjTile.dataset.row) {
                    if (shipDiv.classList.contains('horizontal')) {
                        shipDiv.classList.remove('horizontal')
                    }

                    shipDiv.classList.add('vertical')
                } else if (shipStartPoint.dataset.row > shipAdjTile.dataset.row) {
                    shipDiv.classList.add('vertical')
                    shipDiv.classList.add('last-row')
                }

                // Ship currently horizontal
                if (shipStartPoint.dataset.col < shipAdjTile.dataset.col) {
                    if (shipDiv.classList.contains('vertical')) {
                        shipDiv.classList.remove('vertical')
                    }

                    shipDiv.classList.add('horizontal')
                }
            }
        })
    }

    generateShipGameboardIcon(allShips)
}

function getShip(realPlayerObj, shipElem) {
    const shipRow = parseInt(shipElem.dataset.row)
    const shipCol = parseInt(shipElem.dataset.col)

    const [shipType] = Array.from(shipElem.firstChild.classList).filter((name) => {
        if (name === 'patrolBoat' || name === 'battleShip' || name === 'destroyer' || name === 'carrier') {
            return name
        }
    })

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

    // Apply special styling for last row.
    if (newRow === 9) {
        newShipDiv.classList.add('last-row')
    } else if (newRow !== 9 && newShipDiv.classList.contains('last-row')) {
        newShipDiv.classList.remove('last-row')
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

function toggleNoDropTiles(realPlayerObj, currentLoc) {
    // If currentLoc is provided then add noDrop class to boundary location elements.
    // Else remove noDrop class.
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

                ship.location.forEach((loc) => {
                    const locX = loc[0]
                    const locY = loc[1]

                    const shipLocationElem = realPlayerGameboard.querySelector(
                        `[data-row='${locX}'][data-col='${locY}']`
                    )

                    shipLocationElem.classList.add('noDrop')
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

            ship.location.forEach((loc) => {
                const locX = loc[0]
                const locY = loc[1]

                const shipLocationElem = realPlayerGameboard.querySelector(`[data-row='${locX}'][data-col='${locY}']`)

                if (shipLocationElem.classList.contains('noDrop')) {
                    shipLocationElem.classList.remove('noDrop')
                }
            })
        })
    }
}

function dragStartHandler(e, realPlayerObj) {
    const selectedShipRow = parseInt(e.target.parentNode.dataset.row)
    const selectedShipCol = parseInt(e.target.parentNode.dataset.col)

    e.dataTransfer.setData('shipRow', selectedShipRow)
    e.dataTransfer.setData('shipCol', selectedShipCol)
    e.dataTransfer.setData('className', e.target.className)

    // Get selected ship and set ship length for styling of open tiles for ship length > 1
    const selectedShipElem = realPlayerGameboard.querySelector(
        `[data-row='${selectedShipRow}'][data-col='${selectedShipCol}']`
    )

    const selectedShip = getShip(realPlayerObj, selectedShipElem)
    shipLength = selectedShip.length

    if (selectedShipElem.firstChild.classList.contains('horizontal')) {
        shipOrientation = 'horizontal'
    } else {
        shipOrientation = 'vertical'
    }

    e.dataTransfer.effectAllowed = 'move'

    // Show boundary tiles, ensure user cannot drop it into any boundary/ship tiles.
    toggleNoDropTiles(realPlayerObj, [selectedShipRow, selectedShipCol])
}

function dragEndHandler(e, realPlayerObj) {
    e.preventDefault()
    e.stopPropagation()

    toggleNoDropTiles(realPlayerObj)
}
