export class Ship {
    constructor(length) {
        this.length = length
        this.hitsTaken = 0
        this.sunk = false
    }

    hit() {
        this.hitsTaken += 1

        if (this.hitsTaken === this.length) {
            this.isSunk()
        }
    }

    isSunk() {
        this.sunk = true
    }
}

const test = new Ship(3)
console.log(test)
