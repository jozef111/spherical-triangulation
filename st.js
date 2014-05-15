"use strict"

module.exports = createSphericalTriangulation

var orient = require("robust-orientation")
var robustSum = require("robust-sum")
var dup = require("dup")

function Simplex(vertices, next, prev) {
  this.vertices = vertices
  this._children = null
  this._next = next
  this._prev = prev
}

var lproto = Simplex.prototype

lproto.unlink = function() {
  this._next._prev = this._prev
  this._prev._next = this._next
  this._next = this._prev = null
}

function SphericalTriangulation(center, points) {
  this.center = center
  this.points = points
  this._children = []
  this._next = this._prev = this
}

var proto = SphericalTriangulation.prototype

function cellOrient(points, center, vertices) {
  var d = center.length
  var p = new Array(d+1)
  for(var i=0; i<d; ++i) {
    p[i] = points[vertices[i]]
  }
  p[d] = center
  return orient.apply(undefined, p)
}

function contains(points, center, vertices, p) {
  var d = center.length
  var v = new Array(d+1)
  for(var i=0; i<d; ++i) {
    v[i] = points[vertices[i]]
  }
  v[d] = center
  var o = orient.apply(undefined, v)
  for(var i=0; i<d; ++i) {
    var x = v[i]
    v[i] = p
    var s = orient.apply(undefined,v)
    v[i] = x
    if(s > 0) {
      return false
    }
  }
  return true
}

function insertRec(triangles, node, p) {
  var children = node._children
  if(children) {
    //Insert recursively into children
    var count = 0
    for(var i=0,n=children.length; i<n; ++i) {
      var c = children[i]
      var v = c.vertices
      if(contains(triangles.points, triangles.center, v, p)) {
        insertRec(triangles, c, p)
        count += 1
      }
    }
  } else {
    //Split node
    node.unlink()
    var v = node.vertices
    var d = v.length
    var n = triangles.points.length-1
    var nc = []
    for(var i=0; i<d; ++i) {
      var vv = v.slice()
      vv[i] = n
      var o = cellOrient(triangles.points, triangles.center, vv)
      if(o === 0) {
        continue
      }
      if(o > 0) {
        var t = vv[0]
        vv[0] = vv[1]
        vv[1] = t
      }
      var c = new Simplex(vv, triangles._next, triangles)
      triangles._next._prev = c
      triangles._next = c
      nc.push(c)
    }
    node._children = nc
  }
}

proto.insert = function(p) {
  this.points.push(p)
  insertRec(this, this, p)
}

proto.locate = function(p) {
  var n = this
  var points = this.points
  var center = this.center
  while(n._children) {
    var children = n._children
    for(var i=0,m=children.length; i<m; ++i) {
      var c = children[i]
      if(contains(points, center, c.vertices, p)) {
        n = c
        break
      }
    }
    return []
  }
  return n.vertices
}

Object.defineProperty(proto, "cells", {
  get: function() {
    var cells = []
    for(var c=this._next; c!==this; c=c._next) {
      cells.push(c.vertices)
    }
    return cells
  }
})

function createSphericalTriangulation(simplex) {
  if(simplex.length <= 1) {
    throw new Error("spherical-triangulation: Dimension must be > 1")
  }
  var d = simplex[0].length
  if(simplex.length !== d+1) {
    throw new Error("spherical-triangulation: Initial simplex must have d+1 points")
  }
  var s = orient.apply(undefined, simplex)
  if(s === 0) {
    throw new Error("spherical-triangulation: Initial simplex must be non-degenerate")
  }
  //Compute best fp approximation of center of simplex
  var rcenter = dup([d,1], 0)
  for(var i=0; i<=d; ++i) {
    var p = simplex[i]
    for(var j=0; j<d; ++j) {
      rcenter[j] = robustSum(rcenter[j], p[j])
    }
  }
  var center = new Array(d)
  for(var i=0; i<d; ++i) {
    var f = rcenter[i]
    var v = 0
    for(var j=0; j<f.length; ++j) {
      v += f[j]/(d+1)
    }
    center[i] = v
  }
  //Initialize triangulation
  var triangles = new SphericalTriangulation(center, simplex.slice())
  for(var i=0; i<=d; ++i) {
    var f = new Array(d)
    var k = 0
    for(var j=0; j<i; ++j) {
      f[k++] = j
    }
    for(var j=i+1; j<=d; ++j) {
      f[k++] = j
    }
    if((s < 0) !== !!(i&1)) {
      var tmp = f[0]
      f[0] = f[1]
      f[1] = tmp
    }
    var c = new Simplex(f, triangles._next, triangles)
    triangles._next._prev = c
    triangles._next = c
    triangles._children.push(c)
  }
  return triangles
}