spherical-triangulation
=======================
Maintains a spherical triangulation under incremental vertex insertions.  This module is meant to be used internally for various convex hull implementations.

This module should work for spheres in any dimension > 1, though it is probably quite slow once you get past 4D spheres.

All computations are performed using adaptive/exact arithmetic.

# Example

```javascript
var createTriangulation = require("spherical-triangulation")

var st = createTriangulation([
  [1,0,0],
  [0,1,0],
  [0,0,1],
  [-1,-1,-1]
])

st.insert([1,1,0])
st.insert([0,1,1])
st.insert([1,0,1])
```

# Install

```
npm install spherical-triangulation
```

# API

```javascript
var createTriangulation = require("spherical-triangulation")
```

### `var st = createTriangulation(simplex)`
Creates an initial spherical triangulation from a simplex

* `simplex` is an array of points encoding a simplex

**Returns** A new spherical triangulation object

### `st.insert(point)`
Inserts a point into a spherical triangulation

* `point` is the point which is being inserted

### `st.locate(point)`
Locates a point in the triangulation

* `point` is a test point

**Returns** The cell containing `point`

### `st.points`
The list of all points in the cell complex

### `st.cells`
An array of all the cells in the complex.  Cells are all positively oriented according to the convention used in `robust-orientation`.

# Credits
(c) 2014 Mikola Lysenko. MIT License