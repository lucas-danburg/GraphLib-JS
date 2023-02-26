import { Config } from './Config.js'
import { combos } from './ops.js'

/**
 * Class representing an axis on a graph
 */
export class Axis {
    /**
     * Create axis
     * @param {object} specs - {min: -10, max: 10, step: 2, label: 'X Axis}
     * @param {number} length - TOTAL length in pixels of the axis, gap not subtracted
     * @param {Graph} graph - The parent Graph object to which this axis belongs
     * @param {Config} [config] - Configuration
     */
    constructor(specs, length, Graph, config = new Config()) {
        this.specs = specs
        this.length = length
        this.Graph = Graph
        this.config = config
        this.scale = (this.length - this.config.gap) / (this.specs.max - this.specs.min)

        this.combos = combos([this], 1)

        this.lambdas = []
    }

    /**
     * Convert from unit value to pixel value
     * @param {number} units - The value in units
     */
    pixels(units) {
        return (units - this.specs.min) * this.scale + this.config.gap
    }

    /**
     * Convert from pixel value to unit value
     * @param {number} pixels - The value in pixels
     */
    units(pixels) {
        return (pixels - this.config.gap) / this.scale + this.specs.min
    }

    /**
     * Return a nicely sized label marker for a point (no crazy decimals), and coordinates to place it ats
     * @param {number} value - The value to size nicely :)
     * @param {array} coords - The coordinates [x, y] of the point that is being labelled
     * @param {boolean} [side] - Will this label be placed on it's side? Adjust coordinate offset accordingly
     */
    label(value, coords, side = false) {
        if(typeof value != 'string') {
            if(value % 2 == 0) { value = value.toString() } else { value = value.toFixed(1).toString() }
        }

        var coordsoff = [coords[0], coords[1] - 10]
        if(side) { coordsoff = [coords[1] - 10, coords[0]] }  

        return {string: value, coords: coordsoff}
    }

    /**
     * Generate pixel points and call Graph.draw()
     * @param {Function} lambda - Function to call on axis input and return output
     * @param {boolean} [dash] - Make the line dashed?
     * @param {string} [color] - Line color, defaults to config style
     * @param {number} [width] - Width of the line, defaults to config style
     */
    graph(lambda, dash = false, color = this.config.strokeStyle, width = this.config.lineWidth) {
        var contains = false
        this.lambdas.forEach((func) => {
            if(lambda.toString() == func.lambda.toString()) { contains = true }
        })

        if(!contains) { this.lambdas.push({
            lambda: lambda,
            dash: dash,
            color: color,
            width: width
        })}

        const selfindex = this.Graph.axes.indexOf(this)
        const coords = []
        for(const combo of this.combos) {
            coords.push([this.pixels(combo[0]), this.Graph.axes[1 - selfindex].pixels(lambda(...combo))])
        }

        this.Graph.draw({coords, flip: selfindex}, dash, color, width)
        this.Graph.states.curves = this.Graph.context.getImageData(0, 0, this.Graph.canvas.width, this.Graph.canvas.height)
    }
}