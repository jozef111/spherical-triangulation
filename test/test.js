"use strict"

var tape = require("tape")
var sc = require("simplicial-complex")
var parity = require("permutation-parity")
var createTriangulation = require("../st.js")

function normalize(c) {
  return sc.normalize(c.slice()).map(function(cell) {
    var s1 = parity(cell)
    cell = cell.slice()
    cell.sort(function(a,b) {
      return a-b
    })
    var s2 = parity(cell)
    if(s1 !== s2) {
      var t = cell[0]
      cell[0] = cell[1]
      cell[1] = t
    }
    return cell
  })
}

function compareSC(t, a, b, rem) {
  t.same(normalize(a), normalize(b), rem)
}

tape("2d", function(t) {

  var tri = createTriangulation([
    [-1,-1],
    [1,0],
    [0,1]
  ])

  t.same(tri.points, [[-1,-1],
    [1,0],
    [0,1]], "check points ok")
  compareSC(t, tri.cells, [[0,1], [2,0], [1,2]], "check cells ok")

  tri.insert([0.5,0.5])
  t.same(tri.points, [[-1,-1],
    [1,0],
    [0,1],
    [0.5,0.5]], "inserted point")
  compareSC(t, tri.cells, [[0,1], [2,0], [3,2], [1,3]], "check cells match")
  
  t.same(tri.locate([-1,1]), [2,0], "test locate")

  t.end()
})

tape("3d", function(t) {

  var tri = createTriangulation([
    [-1,-1,-1],
    [1,0,0],
    [0,1,0],
    [0,0,1]
  ])

  t.same(tri.points, [
    [-1,-1,-1],
    [1,0,0],
    [0,1,0],
    [0,0,1]
  ], "check points")

  compareSC(t, tri.cells, [
    [0,1,2],
    [1,3,2],
    [1,0,3],
    [0,2,3]
    ], "check cells")

  //Try inserting degenerate point

  tri.insert([0.5, 0.5, 0])

  t.same(tri.points, [
    [-1,-1,-1],
    [1,0,0],
    [0,1,0],
    [0,0,1],
    [0.5,0.5,0]
  ])

  compareSC(t, tri.cells, [
    [0,1,4],
    [2,0,4],
    [4,3,2],
    [1,3,4],
    [1,0,3],
    [0,2,3]
  ], "check cells")

  t.end()
})