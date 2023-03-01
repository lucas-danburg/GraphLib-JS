import { Config } from './Config.js'
import { Vector } from './Vector.js'
import { Field } from './Field.js'
import { units } from './ops.js'
import { Integration } from './Integration.js'

/**
 * Object to handle user interaction with Fields and Graphs
 */
export class Interface {
    /**
     * Create Interface
     * @param {Graph} Graph - Graph or Field object to interface with
     * @param {Config} [config] - Configuration
     */
    constructor(Graph, config = new Config()) {
        this.Graph = Graph
        this.config = config

        this.states = {
            field: this.Graph.context.getImageData(0, 0, this.Graph.canvas.width, this.Graph.canvas.height),
            curves: this.Graph.states.curves,
            axes: this.Graph.states.axes
        }

        if(this.Graph instanceof Field) {
            this.states.mouse = this.states.field

            this.mouse = {
                x: 10,
                y: 10
            }
            this.mouse.x = 200
            this.mouse.y = 200
            this.arrow = false

            this.integration = false

            this.Graph.canvas.addEventListener('mousemove', (event) => {
                this.stop = false

                const rect = this.Graph.canvas.getBoundingClientRect()

                this.mouse.x = event.clientX - rect.left
                this.mouse.y = this.Graph.canvas.height - (event.clientY - rect.top)

                if(this.mouse.x < this.config.gap || this.mouse.y < this.config.gap) {
                    this.mouse.x, this.mouse.y = undefined
                }

                this.update.mouse()
            })

            this.Graph.canvas.addEventListener('mouseleave', () => {
                this.mouse.x, this.mouse.y = undefined
                this.update.mouse()
            })
        }
    }

    /**
     * Draw a trajectory and integrate it if specified
     * @param {array} coords - The pixel coords of where the trajectory starts
     * @param {number} [wait] - The wait to proportion, defaults to 10
     */
    async traj(coords, wait = 10) {
        const ints = []
        if(this.integration) { this.integrations.forEach((int) => {
            ints.push(new Integration(int.graph, int.axis, int.time, int.lambda, int.config))
        })}

        while(!this.stop) {
            const result = this.update.trajectory(coords)

            if(result == null) { break }
            else {
                if(this.integration) { ints.forEach((int, index) => {
                    if(!int.update(units(result.base, this.Graph.axes))) {
                        if(this.integrations[index].repeat) {
                            int.reset()
                        } else {
                            ints.splice(index, 1)  
                        }
                    }
                })}

                await new Promise(r => setTimeout(r, result.rel / result.scalar * wait))
                coords = result.tip
            }
        }
    }

    update = {
        /**
         * Draw a vector or trajectory from the cursor on the Graph, if it's a field
         */
        mouse: () => {
            this.Graph.context.putImageData(this.states.mouse, 0, 0)

            if(this.arrow) {
                this.Graph.vector(new Vector(
                    units([this.mouse.x, this.mouse.y], this.Graph.axes),
                    this.Graph.lambdas,
                    this.Graph.axes
                ),
                this.config.mouseVecColor, this.config.mouseVecWidth, this.config.mouseVecScale)
            }

            else {
                this.Graph.trajectory(new Vector(
                    units([this.mouse.x, this.mouse.y], this.Graph.axes),
                    this.Graph.lambdas,
                    this.Graph.axes)
                )
            }
        },

        /**
         * Draw a timed trajectory, incoorporating appropriate mouse updates. Returns result of trajectory call
         * @param {array} coords - The pixel coordinates of where to draw the trajectory section from
         */
        trajectory: (coords) => {
            this.Graph.context.putImageData(this.states.mouse, 0, 0)

            const result = this.Graph.trajectory(new Vector(
                units(coords, this.Graph.axes),
                this.Graph.lambdas,
                this.Graph.axes
            ), false)

            this.states.mouse = this.Graph.context.getImageData(0, 0, this.Graph.canvas.width, this.Graph.canvas.height)
            this.update.mouse()
            
            this.Graph.tip(result, 4, this.config.trajColor)

            return result
        },

        /**
         * Update lamdas. This will re-draw field arrows, function curves, and change current trajectories
         */
        lambdas: () => {
            this.Graph.context.putImageData(this.states.axes, 0, 0)
            
            if(this.Graph instanceof Field) {
                this.Graph.vectors.forEach((vector) => {
                    vector.calculate()
                    this.Graph.vector(vector)
                })
            }

            this.Graph.axes.forEach((axis) => {
                axis.lambdas.forEach((lambda) => {
                    axis.graph(lambda.lambda, lambda.dash, lambda.color, lambda.width)
                })
            })

            this.states.field = this.Graph.context.getImageData(0, 0, this.Graph.canvas.width, this.Graph.canvas.height)

            this.states.mouse = this.Graph.context.getImageData(0, 0, this.Graph.canvas.width, this.Graph.canvas.height)
        }
    }

    add = {
        /**
         * Add a onclick interaction with the canvas to draw a trajectory with time accuracy
         * @param {number} [wait] - In milliseconds, the wait to proportion. Defaults to 10
         */
        clicker: (wait = 10) => {
            this.arrow = true
            this.Graph.canvas.addEventListener('click', async () => {
                this.traj([this.mouse.x, this.mouse.y], wait)
            })
        },

        /**
         * Add a clear button that will erase any trajectories on the field
         * @param {Element} button - An element to add a click listener to for the clear action
         */
        clear: (button) => {
            button.addEventListener('click', () => {
                this.stop = true
                this.states.mouse = this.states.field
                this.Graph.context.putImageData(this.states.field, 0, 0)
                if(this.integration) {
                    this.integrations.forEach((integration) => {
                        integration.graph.context.putImageData(integration.graph.states.curves, 0, 0)
                    })
                }
            })
        },

        /**
         * Add a slider that updates a constant in a lambda function
         * @param {Element} input - The input type = slider element to receive a value from
         * @param {Element} label - The element to update with the input value
         * @param {object} value - An object {value: something} to update with slider input. (Object for shallow copy)
         */
        slider: (input, label, value) => {
            label.innerHTML = input.value

            input.oninput = () => {
                label.innerHTML = input.value
                value.value = parseFloat(input.value)
                this.update.lambdas()

                this.states.curves = this.Graph.context.getImageData(0, 0, this.Graph.canvas.width, this.Graph.canvas.height)
            }
        },

        /**
         * Connect main vector field to a variable / time graph, when adding click trajectory, draw on that graph too
         * @param {Graph} graph - Variable over time graph to draw on
         * @param {Axis} axis - Axis object on that graph, against which to display the variable
         * @param {number} time - In milliseconds, how long between value updates
         * @param {Function} lambda - The function to perform on the vector input that is passed to the integration
         * @param {string} [color] - Color of graphed line on integration graph, defaults to config traj color
         * @param {boolean} [repeat] - Clear and start at beginning when line hits the end of the graph? Default false
         */
        integration: (graph, axis, time, lambda, config = this.config, repeat = false) => {
            this.integration = true
            if(!this.integrations) { this.integrations = [] }
            this.integrations.push({
                graph: graph,
                axis: axis,
                time: time,
                lambda: lambda,
                config: config,
                repeat: repeat
            })
        }
    }
    
}