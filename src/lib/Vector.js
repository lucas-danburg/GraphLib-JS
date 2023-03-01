/**
 * A vector with a base and tip in unit coordinates
 */
export class Vector{
    /**
     * Initialize vector from a unit input and lambda functions
     * @param {array} input - An array [x, y, z, ...] of values in axis units of the base coordinates
     * @param {array} lambdas - An array of functions f, g, h(x, y, z, ...) to evaluate input and create tip coordinates
     * @param {array} axes - An array of axes that inputs are on
     */
    constructor(input, lambdas, axes) {
        this.base = input
        this.tip = Array(input.length)
        this.axes = axes
        this.lambdas = lambdas

        this.calculate()
    }

    /**
     * Recalculate vector
     */
    calculate() {
        this.lambdas.forEach((lambda, index) => { this.tip[index] = this.base[index] + lambda(...this.base) })
    }

    /**
     * Convert itself from unit values to pixel values and return
     */
    pixels() {
        const base = [], tip = []

        this.axes.forEach((axis, index) => {
            base.push(axis.pixels(this.base[index]))
            tip.push(axis.pixels(this.tip[index]))
        })

        return {base: base, tip: tip}
    }
}
