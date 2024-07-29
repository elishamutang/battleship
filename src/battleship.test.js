import { Ship } from './ship'
import { Gameboard } from './gameboard'
import { Player } from './player'

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
        expect(demoShip.typeOfShip).toBe('battleShip')
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
        const outOfBoundsCheck = () => {
            demoGameboard.board.forEach((row) => {
                expect(row.length).toBe(11)
            })
        }

        // First ship
        it('first ship (destroyer)', () => {
            const demoShip = new Ship(3) // Destroyer
            const coord = [2, 1]

            demoGameboard.placeShip(demoShip, coord)
            outOfBoundsCheck()
        })

        // Second ship
        it('second ship (carrier)', () => {
            const demoShip = new Ship(5) // Carrier
            const coord = [5, 5]

            demoGameboard.placeShip(demoShip, coord)
            outOfBoundsCheck()
        })

        // Third ship
        it('third ship (patrol boat)', () => {
            const demoShip = new Ship(2) // patrol boat
            const coord = [10, 10]

            demoGameboard.placeShip(demoShip, coord)
            outOfBoundsCheck()
        })

        // No out of bounds
        it('Gameboard not out of bounds', () => {
            demoGameboard.board.forEach((row) => {
                expect(row.length).toBe(11)
            })
        })

        // Flip the ship
        describe('Flip the ship', () => {
            it('Ship should not go out of bounds when flipped.', () => {
                const demoShip = new Ship(2)
                const coord = [9, 2]

                demoGameboard.placeShip(demoShip, coord)
                expect(demoGameboard.flip(demoShip, coord)).toEqual([8, 2]) // Final coordinate
            })

            it('Ship flip', () => {
                const demoShip = new Ship(2)
                const coord = [0, 3]

                demoGameboard.placeShip(demoShip, coord)
                expect(demoGameboard.flip(demoShip, coord)).toEqual([1, 3]) // Final coordinate
            })
        })

        // Ships cannot overlap
        it('Ships cannot overlap', () => {
            const demoShip = new Ship(4) // Battleship
            const coord = [10, 10]

            // Returns undefined.
            expect(demoGameboard.placeShip(demoShip, coord)).toBeUndefined()
        })
    })

    // Test receiveAttack method
    describe('Record hits', () => {
        // Mock function
        const hitsTakenMock = jest.fn((coord) => {
            let [x, y] = coord

            const [ship] = demoGameboard.ships.filter((elem) => {
                if (elem.typeOfShip.split('')[0] === demoGameboard.board[x][y]) return elem
            })

            demoGameboard.receiveAttack(coord)

            return ship
        })

        it('Logs and records hit on gameboard', () => {
            const coord = [0, 0]
            const [x, y] = coord

            demoGameboard.receiveAttack(coord)

            expect(demoGameboard.board[x][y]).toBe('x')
        })

        it('Determines if hit is on a ship or not, if yes log it.', () => {
            const coord = [10, 10]
            const [x, y] = coord

            expect(hitsTakenMock(coord).hitsTaken).toBe(1)
            expect(demoGameboard.board[x][y]).toBe('x')
        })

        it('Sink ship', () => {
            // Patrol boat
            expect(hitsTakenMock([10, 9]).sunk).toBe(true)

            hitsTakenMock([8, 2])
            expect(hitsTakenMock([9, 2]).sunk).toBe(true)

            hitsTakenMock([0, 3])
            expect(hitsTakenMock([1, 3]).sunk).toBe(true)

            // Destroyer
            hitsTakenMock([2, 1])
            hitsTakenMock([2, 2])
            expect(hitsTakenMock([2, 3]).sunk).toBe(true)

            // Carrier
            hitsTakenMock([5, 5])
            hitsTakenMock([5, 6])
            hitsTakenMock([5, 7])
            hitsTakenMock([5, 8])
            expect(hitsTakenMock([5, 9]).sunk).toBe(true)
        })

        it('All ships have sunked', () => {
            expect(demoGameboard.areAllShipsSunked).toBe(true)
        })
    })
})
