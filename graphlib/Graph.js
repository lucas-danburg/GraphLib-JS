import { Axis } from './Axis.js'
import { Config } from './Config.js'

/**
 * A parent class to represent a simple x-y graph
 */
export class Graph {
    /**
     * Create a basic graph
     * @param {Element} canvas - Document element of the canvas the graph will be drawn on
     * @param {array} [x] - {min: -10, max: 10, step: 2, label: 'X'}
     * @param {array} [y] - {min: -10, max: 10, step: 2, label: 'Y'}
     * @param {Config} [config] - Configuration
     */
    constructor(
            canvas,
            x = {min: -10, max: 10, step: 2, label: 'X'},
            y = {min: -10, max: 10, step: 2, label: 'Y'},
            config = new Config()
        ) {
        this.config = config
        this.context = canvas.getContext('2d', {willReadFrequently: true})
        this.canvas = canvas
        this.axes = [
            new Axis(x, this.canvas.width, this),
            new Axis(y, this.canvas.height, this)
        ]
        this.config.init(this.context, this.canvas.height)

        this.axes.forEach((axis, index) => {
            const pixels = [[this.config.gap, this.config.gap]]
            for(var units = axis.specs.min + axis.specs.step; units < axis.specs.max; units += axis.specs.step) {
                const pixel = axis.pixels(units)

                pixels.push([pixel, this.config.gap])
                pixels.push([pixel, this.config.gap + this.config.markers])
                pixels.push([pixel, this.config.gap])

                this.text(axis.label(units, [pixel, this.config.gap], index), index, this.config.markerFont)
            }

            pixels.push([axis.length -1, this.config.gap])
            pixels.push([axis.length -1, this.config.gap + this.config.markers])
            pixels.push([axis.length -1, this.config.gap])
            
            this.text(axis.label(
                axis.specs.label,
                [(axis.length - this.config.gap) / 2 + this.config.gap, this.config.gap / 1.8],
                index,
            ), index, this.config.labelFont, this.config.axisColor)
            this.draw({coords: pixels, flip: index}, false, this.config.strokeStyle, this.config.lineWidth, true)
        })

        this.states = { axes: this.context.getImageData(0, 0, this.canvas.width, this.canvas.height) }
        this.states.curves = this.states.axes
    }

    /**
     * Write some text centered on a point
     * @param {object} label - {string: 'something', coords: [0, 0]}
     * @param {boolean} [side] - Write the text on it's side? defaults to false
     * @param {string} [font] - Text font, defaults to config style
     * @param {string} [color] - What color should the text be - defaults to config style
     */
    text(label, side = false, font = this.config.font, color = this.config.fillStyle) {
        this.context.save()
        this.context.fillStyle = color
        this.context.font = font
        this.context.translate(...label.coords)
        this.context.scale(1, -1)
        if(side) { this.context.rotate(-Math.PI / 2) }
        this.context.fillText(label.string, 0, 0)
        this.context.restore()
    }

    /**
     * Draw a line across a bunch of x points and y points. Returns if last point inside graph
     * @param {object} outputs - {coords: [[x, y], [x1, y1]], flip: true|false}
     * @param {boolean} [dash] - Make the line dashed? Defaults to false
     * @param {string} [color] - Color of the line, defaults to config style
     * @param {number} [width] - Width of the line, defaults to config style
     * @param {boolean} [outside] - Draw outside the graph space anyways? Defaults to false
     */
    draw(outputs, dash = false, color = this.config.strokeStyle, width = this.config.lineWidth, outside = false) {
        this.context.save()
        this.context.strokeStyle = color
        this.context.lineWidth = width
        if(dash) { this.context.setLineDash([5, 5]) }

        const path = new Path2D()
        outputs.coords.forEach((coord) => {
            if(coord[0] >= this.config.gap && coord[1] >= this.config.gap || outside) {
                if(+outputs.flip) { path.lineTo(...coord.reverse()) }
                else { path.lineTo(...coord) }
            }
        })
        
        this.context.stroke(path)
        this.context.restore()

        const check = outputs.coords[outputs.coords.length - 1]
        return (
            check[0] >= this.config.gap && check[1] >= this.config.gap &&
            check[0] <= this.canvas.width && check[1] <= this.canvas.height
        )
    }

    /**
     * Convert any amount of units into pixel coordinates against this' axes
     * @param {array} outputs - An array of coordinate arrays [[x, y], [x, y]] to convert
     * @param {boolean} [flip] - Convert against opposite axises? Defaults to false
     */
    pixels(outputs, flip = false) {
        const pixels = []

        outputs.forEach((output) => {
            pixels.push([
                this.axes[+flip].pixels(output[0]),
                this.axes[1 - +flip].pixels(output[1])
            ])
        })

        return pixels
    }
}