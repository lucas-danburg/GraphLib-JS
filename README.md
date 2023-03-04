# Library Dynamica

A JavaScript web graphics library for graphing dynamical systems.

## Features

- Graphing formulas
- Graphing vector fields
- Interactive displays of field trajectories
- Integration over time graphs
- Live updating of formula constants
- Very colorful

## Usage

Add
```
<script src = "https://cdn.jsdelivr.net/npm/library-dynamica/dist/main.js"></script>
```
to the `<head>` of an HTML page, and you will have access to a
`libdyn` object in any script you use throughout the page. That
object contains all the classes you see in `/lib`, minus `ops.js`
which contains functions that the classes use. You also have 
access to those functions through the `libdyn` object.

This code is also an [NPM project](https://www.npmjs.com/package/library-dynamica?activeTab=readme), so I assume you could use it
in a node application as well, but I've never tried.

## Documentation

Unfortunately, the best I can give you is some JSDoc comments.
If you happen to come across this repo and want to use it,
feel free to contact me and I can answer any questions you
might have. Check out [my website](coming soon) and inspect the page source for some code examples.

## Links

- [Github](https://github.com/lucas-danburg/library-dynamica)
- [NPM](https://www.npmjs.com/package/library-dynamica?activeTab=readme)
- [Examples](https://lucasdanb.org/rnd/libdyn.html)
