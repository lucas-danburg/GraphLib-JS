/**
 * Class to hold a bunch of configuration values, with methods to auto configure for various operations
 */
export class Config {
    gap = 40
    markers = 5

    vectorColor = 'yellow'
    vectorWidth = 1
    vectorScalar = 1
    vectorMax = 30
    vectorMin = 5
    vectorHead = 4

    strokeStyle = 'white'
    lineWidth = 2
    fillStyle = 'white'
    textBaseline = 'middle'
    textAlign = 'center'

    markerFont = '10px sans-serif'
    labelFont = '15px sans-serif'
    axisColor = 'yellow'

    mouseVecScale = 3
    mouseVecWidth = 3
    mouseVecColor = 'red'

    trajColor = 'fuchsia'
    trajWidth = 1

    /**
     * Give context a bunch of default values
     * @param {CanvasRenderingContext2D} context - The CanvasRenderingContext2D to initialize
     * @param {number} height - The height of the canvas, in order to translate the context
     */
    init(context, height) {
        context.lineCap = 'round'
        context.strokeStyle = this.strokeStyle
        context.lineWidth = this.lineWidth
        context.fillStyle = this.fillStyle
        context.textBaseline = this.textBaseline
        context.textAlign = this.textAlign
        context.translate(0, height)
        context.scale(1, -1)
    }
}