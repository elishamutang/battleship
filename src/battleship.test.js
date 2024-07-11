import { Ship } from './ship'
import { Gameboard } from './gameboard'

// Test ship class
describe('Test ship class', () => {
    // Test whether ship takes hit.
    it('test hits taken on ship', () => {
        const demoShip = new Ship(3)
        demoShip.hit()
        expect(demoShip.hitsTaken).toBe(1)
    })

    // Test sunk ship.
    it('test whether ship function sinks after taking certain number of hits', () => {
        const demoShip = new Ship(3)
        for (let i = 0; i < demoShip.length; i++) {
            demoShip.hit()
        }

        expect(demoShip.sunk).toBe(true)
    })

    // Test type of ship.
    it('ship with length 4 should be a carrier type', () => {
        const demoShip = new Ship(4)
        expect(demoShip.typeOfShip).toBe('battleship')
    })
})

// Test gameboard class
describe('Test gameboard class', () => {
    // Demo gameboard
    const demoGameboard = new Gameboard()

    // Test board
    it('board created', () => {
        expect(demoGameboard.board).toBeDefined()
    })

    // Testing ship placement on gameboard
    describe('Test ship placement on gameboard', () => {
        const placeShipMock = jest.fn((ship, coord) => {
            demoGameboard.placeShip(ship, coord)

            let [x, y] = coord

            expect(demoGameboard.ships).toContain(ship)

            let finalY = y + ship.length

            if (finalY > 10) {
                for (let i = 0; i < ship.length; i++) {
                    expect(demoGameboard.board[x][y - 1]).toBe(ship.typeOfShip.split('')[0])
                }
            } else {
                for (let i = 0; i < ship.length; i++) {
                    expect(demoGameboard.board[x][y + 1]).toBe(ship.typeOfShip.split('')[0])
                }
            }

            // Testing out of bounds ship placement
            demoGameboard.board.forEach((row) => {
                expect(row.length).toBe(11)
            })
        })

        // First ship
        it('first ship (destroyer)', () => {
            const demoShip = new Ship(3) // Destroyer
            const coord = [2, 1]

            placeShipMock(demoShip, coord)
        })

        // Second ship
        it('second ship (carrier)', () => {
            const demoShip = new Ship(5) // Carrier
            const coord = [5, 5]

            placeShipMock(demoShip, coord)
        })

        // Third ship
        it('third ship (patrol boat)', () => {
            const demoShip = new Ship(2) // patrol boat
            const coord = [10, 10]

            placeShipMock(demoShip, coord)
        })

        // Number of ships
        it('Number of ships and type of ships', () => {
            expect(demoGameboard.ships.length).toBe(3)
            expect(demoGameboard.ships[0].typeOfShip).toBe('destroyer')
            expect(demoGameboard.ships[1].typeOfShip).toBe('carrier')
            expect(demoGameboard.ships[2].typeOfShip).toBe('patrol boat')
        })
    })
})