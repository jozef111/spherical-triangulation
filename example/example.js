"use strict"

//Load shell
var shell = require("gl-now")({ clearColor: [0,0,0,0] })
var camera = require("game-shell-orbit-camera")(shell)

var createSphereTriangulation = require("../st.js")
var sc = require("simplicial-complex")

//Mesh creation tools
var createMesh = require("gl-simplicial-complex")
var createAxes = require("gl-axes")

//Matrix math
var mat4 = require("gl-matrix").mat4

//Bounds on function to plot
var bounds = [[-5,-5,-5], [5,5,5]]

var triangulation = createSphereTriangulation([
  [0,1,0],
  [1,0,0],
  [0,0,1],
  [-1,-1,-1]
])

function updateTriangulation() {
  var v = [Math.random()-0.5, Math.random()-0.5, Math.random()-0.5]
  triangulation.insert(v)
  var positions = triangulation.points.map(function(p) {
      var d = Math.sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2])
      return [p[0]/d, p[1]/d, p[2]/d]
    })
  positions.push(triangulation.center)
  var cells = triangulation.cells
  cells.push([positions.length-1])
  mesh.update({
    positions: positions,
    cells: cells,
    pointSize: 10
  })
}

//State variables
var mesh, axes

shell.on("gl-init", function() {
  var gl = shell.gl

  //Set up camera
  camera.lookAt([1,1,1], [0,0,0], [0, 1, 0])

  //Create mesh
  mesh = createMesh(gl, {positions:[], cells:[]})
  updateTriangulation()

  //Create axes object
  axes = createAxes(gl, {
    bounds: bounds
  })
})

shell.on("tick", function() {
  if(shell.press("space")) {
    updateTriangulation()
  }
})

shell.on("gl-render", function() {
  var gl = shell.gl
  gl.enable(gl.DEPTH_TEST)

  //Compute camera parameters
  var cameraParameters = {
    view: camera.view(),
    projection: mat4.perspective(
        mat4.create(),
        Math.PI/4.0,
        shell.width/shell.height,
        0.1,
        1000.0)
  }

  //Draw mesh
  mesh.draw(cameraParameters)

  //Draw axes
  axes.draw(cameraParameters)
})