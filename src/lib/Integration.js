import { Config } from './Config.js'

/**
 * A integration of a value in a vector field to that value / time on another graph
 */
export class Integration {
    /**
     * Create an integration
     * @param {Graph} graph - The graph that the integration curve will be placed on
     * @param {Axis} axis - The axis on that graph that is NOT time, that the value will be graphed against
     * @param {number} time - In milliseconds, how much time passes before a new value is received
     * @param {Function} lambda - The function that will be performed on the input to get the value to graph
     * @param {Config} [config] - Configuration
     */
    constructor(graph, axis, time, lambda, config = new Config()) {
        this.graph = graph
        this.index = this.graph.axes.indexOf(axis)
        this.time = time
        this.lambda = lambda
        this.config = config
    }

    /**
     * Send another value to the integration to be graphed
     * @param {array} input - The input of values from the vector field to operate on
     */
    update(input) {
        if(!this.stop) {
            const value = this.lambda(...input)
            
            if(this.previous == null) { this.previous = [value, -this.time] }
            const current = [value, this.previous[1] + this.time]

            if(!this.graph.draw({
                coords: this.graph.pixels([this.previous, current], this.index),
                flip: this.index
            }, false, this.config.trajColor)) {
                this.stop = true
                return false
            }

            this.previous = current
            return true
        }
    }

    /**
     * Reset an integration and start drawing from the beginning
     */
    reset() {
        this.graph.context.putImageData(this.graph.states.curves, 0, 0)
        this.previous = [this.previous[0], -this.time]
        this.stop = false
    }
}