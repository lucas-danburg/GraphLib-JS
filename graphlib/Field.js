import { Graph } from './Graph.js'
import { combos, distance, scale, angle, units } from './ops.js'
import { Config } from './Config.js'
import { Vector } from './Vector.js'

/**
 * Class extending normal Graph representing a graph with a vector field
 * @extends Graph
 */
export class Field extends Graph {
    /**
     * Create a graph with a vector field, draw vectors
     * @param {Element} canvas - Document element of the canvas the graph will be drawn on
     * @param {array} lambdas - Array of functions that determine rates of change of vector states
     * @param {array} [x] - {min: -10, max: 10, step: 2, label: 'X'}
     * @param {array} [y] - {min: -10, max: 10, step: 2, label: 'Y'}
     * @param {Config} [config] - Configuration
     */
    constructor(
        canvas,
        lambdas,
        x = {min: -10, max: 10, step: 2, label: 'X'},
        y = {min: -10, max: 10, step: 2, label: 'Y'},
        config = new Config()
    ) {
        super(canvas, x, y, config)
        this.lambdas = lambdas
        this.inputs = combos(this.axes, this.config.vectorMax)
        
        this.vectors = []
        const distances = []
        for(const input of this.inputs) {
            const vector = new Vector(input, this.lambdas, this.axes)
            this.vectors.push(vector)
            distances.push(distance(vector.pixels()))
        }
        this.min = 0
        this.max = Math.max(...distances)

        this.vectors.forEach((vector) => { this.vector(vector) })
    }

    /**
     * Draw a vector arrow
     * @param {Vector} vector - The vector, in units, to draw
     * @param {string} [color] - The color of the arrow
     * @param {number} [width] - The width, in pixels, of the arrow
     * @param {number} [scalar] - A value to multiple the vector's distance by
     */
    vector(vector, color = this.config.vectorColor, width = this.config.vectorWidth, scalar = 1) {
        const scaled = scale(vector.pixels(), this, this.config.vectorMax * scalar, this.config.vectorMin * scalar)

        if(this.draw({coords: [scaled.base, scaled.tip], flip: false}, false, color, width)) {
            const tiplen = this.config.vectorHead * scaled.rel * scalar
            this.tip(scaled, tiplen, color, width)
        }
    }

    /**
     * Draw an arrow tip on a scaled pixel vector
     * @param {Vector} scaled - The vector that the tip is being drawn on
     * @param {number} tiplen - The maximum length of the lines of the arrow head ->
     * @param {string} [color] - The color of the arrow
     * @param {number} [width] - The width, in pixels, of the arrow
     */
    tip(scaled, tiplen, color = this.config.vectorColor, width = this.config.vectorWidth) {
        this.context.save()
        this.context.translate(...scaled.tip)
        this.context.rotate(angle(scaled))
        this.draw({coords: [
            [-tiplen, tiplen],
            [0, 0],
            [-tiplen, -tiplen]
        ], flip: false}, false, color, width, true)
        this.context.restore()
    }

    /**
     * Draw a smooth trajectory path on the field
     * @param {Vector} vector - A Vector object at the start of the trajectory
     * @param {boolean} [instant] - Draw the whole thing at once, or do it over time (returns rel strength)
     * @param {boolean} [stop] - Stop once the trajectory hits an equilibrium?
     * @param {string} [color] - The color of the trajectory, defaults to config style
     * @param {number} [width] - The width of the trajectory in pixels, defaults to config style
     * @param {number} [length] - The maximum length in pixels of the trajectory
     */
    trajectory(vector, instant = true, stop = true, color = this.config.trajColor, width = this.config.trajWidth, length = this.config.vectorMax) {
        const scaled = scale(vector.pixels(), this, length)

        if(
            !(this.draw({coords: [scaled.base, scaled.tip], flip: false}, false, color, width)) ||
            Math.abs(scaled.tip[0] - scaled.base[0]) < 0.001 &&
            Math.abs(scaled.tip[1] - scaled.base[1]) < 0.001 && stop
        ) { return null }

        if(instant) {
            try {
                this.trajectory(new Vector(units(scaled.tip, this.axes), this.lambdas, this.axes), instant, stop, color, width, length)
            } catch(error) {}
        } else {
            return scaled
        }
    }
}