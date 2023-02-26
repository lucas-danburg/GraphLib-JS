import { Config } from './Config.js'

/**
 * Performs distance formula on a vector
 * @param {Vector} vector - The vector {base = [], tip = []} to operate on
 */
export function distance(vector) {
    return Math.hypot(...vector.base.map((value, index) => vector.tip[index] - value))
}

/**
 * Finds the angle (clockwise) that a vector is pointing
 * @param {Vector} vector - The vector {base = [], tip = []} to operate on
 */
export function angle(vector) {
    const xdif = vector.tip[0] - vector.base[0]
    var tan = Math.atan((vector.tip[1] - vector.base[1]) / xdif)
    if(xdif < 0) { tan += Math.PI }
    return tan
}

/**
 * Normalize a number min <= num <= max to a proportionally large number 0 <= num <= 1
 * @param {number} distance - The number to normalize
 * @param {object} field - A Field object with min and max attributes
 * @param {number} [lower] - Normalize the number to between lower and 1 instead
 */
export function relative(distance, field, lower = 0) {
    return (1 - lower) * ((distance - field.min) / (field.max - field.min)) + lower
}

/**
 * Scale a vector down to a proportionally sized vector between a min and max length
 * @param {Vector} vector - The vector {base = [], tip = []} to operate on
 * @param {Field} field - A Field object with min and max attributes
 * @param {number} max - Maximum length to scale to, in pixels
 * @param {number} [min] - Minimum length to scale to, in pixels
 */
export function scale(vector, field, max, min = 0) {
    const dist = distance(vector)
    const rel = relative(dist, field, min / max)
    const scalar = dist / (rel * max)

    const base = [], tip = []

    vector.base.forEach((coord, index) => {
        base.push(coord)
        tip.push((vector.tip[index] - coord) / scalar + coord)
    })

    return {base: base, tip: tip, rel: rel, scalar: scalar}
}

/**
 * Return an array of arrays, each being one possible combination of every point along each axis
 * @param {array} axes - An array of Axis objects to combine values from
 * @param {number} [density] - Combine every density'th point on each axis - increase point loop by density number
 * @param {Config} [config] - Configuration
 */
export function combos(axes, density = 1, config = new Config()) {
    var combos = Array.of(1)
    for(const axis of axes) { combos.length *= Math.ceil((axis.length - config.gap + 1) / density) }
    for(var index = 0; index < combos.length; index ++) { combos[index] = Array(axes.length) }
    
    axes.forEach((axis, index) => {
        var prevaxis
        if(axes[index - 1]) { prevaxis = axes[index - 1]} else { prevaxis = {length: 0} }
        
        for(var combo = 0; combo < combos.length;) {
            for(var pixel = config.gap; pixel <= axis.length; pixel += density) {
                for(var repeat = 0; repeat <= index * (prevaxis.length - config.gap); repeat += density) {
                    combos[combo][index] = axis.units(pixel)
                    combo ++
                }
            }
        }
    })

    return combos
}

/**
 * Convert an input [x, y, z, ...] in unit values to pixel values on each axis
 * @param {array} input - An array of numbers [x, y, z, ...] to convert
 * @param {array} axes - An array of Axis objects corresponding to each input
 */
export function units(input, axes) {
    const units = []
    axes.forEach((axis, index) => { units.push(axis.units(input[index])) })
    return units
}