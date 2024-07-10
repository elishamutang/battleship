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
    // Test board
    it('board created', () => {
        const demoGameboard = new Gameboard()
        expect(demoGameboard.board).toBeDefined()
    })

    // Testing ship placement on gameboard
    describe('Test ship placement on gameboard', () => {
        const demoGameboard = new Gameboard()

        // First ship
        it('first ship', () => {
            const demoShip = new Ship(3)

            demoGameboard.placeShip(demoShip, [0, 0])

            expect(demoGameboard.ships).toEqual([demoShip])
            expect(demoGameboard.board[0][0]).toEqual('x')
        })

        // Second ship
        it('second ship', () => {
            const demoShip = new Ship(5)

            demoGameboard.placeShip(demoShip, [10, 0])

            expect(demoGameboard.ships).toEqual([demoGameboard.ships[0], demoGameboard.ships[1]])
            expect(demoGameboard.board[10][0]).toEqual('x')
        })
    })
})
