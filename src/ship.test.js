import { Ship } from './ship'

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
})
