export class Ship {
    constructor(length) {
        this.length = length
        this.hitsTaken = 0
        this.sunk = false
        this.typeOfShip = this.shipType()
        this.location = []
        this.boundary = []
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

    shipType() {
        switch (this.length) {
            case 1:
                return 'patrolBoat'
            case 2:
                return 'destroyer'
            case 3:
                return 'battleShip'
            case 4:
                return 'carrier'
        }
    }
}
