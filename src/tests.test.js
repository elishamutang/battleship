import { Ship } from './ship'

// Re-check and re-do the testing
jest.mock('./ship')

it('hit function', () => {
    const demoShip = new Ship(3)

    const spy = jest.spyOn(demoShip, 'hit')
    demoShip.hit()

    expect(spy).toHaveBeenCalled()
})

it.todo('isSunk function')
