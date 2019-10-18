var _createClass = function () {
  function defineProperties (target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ('value' in descriptor) descriptor.writable = true
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps)
    if (staticProps) defineProperties(Constructor, staticProps)
    return Constructor
  }
}()
function _classCallCheck (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}
var tools = {
  drawPath: function drawPath (ctx, fn) {
    ctx.save()
    ctx.beginPath()
    fn()
    ctx.closePath()
    ctx.restore()
  },
  random: function random (min, max, int) {
    var result = min + Math.random() * (max + (int ? 1 : 0) - min)
    return int ? parseInt(result) : result
  },
  easing: function easing (t, b, c, d, s) {
    return c * ((t = t / d - 1) * t * t + 1) + b
  },
  cellEasing: function cellEasing (t, b, c, d, s) {
    return c * (t /= d) * t * t * t + b
  }
}

var doc = {
  height: 0,
  width: 0
}

var plane = {
  xCell: 0,
  yCell: 0,
  cells: []
}

var context = {
  plane: null,
}

var ui = {
  plane: '#plane-canvas'
}

App = function () {
  function App () {
    _classCallCheck(this, App)
    this.state = {
      area: 0,
      time: Date.now(),
      lt: 0,
      planeProgress: 0,
      dotsProgress: 0,
      planeIsDrawn: false,
      text: {},
      delta: 0,
      dlt: performance.now(),
      needRedraw: true
    }
    this.bindNodes()
    this.getDimensions()
    this.start()
  }
  _createClass(App, [{ key: 'start', value: function start () {
      this.initEvents()
      this.canvasInit()
      this.loop()
  } }, { key: 'getDimensions', value: function getDimensions () {
      doc.height = document.documentElement.clientHeight
      doc.width = document.documentElement.clientWidth
  } }, { key: 'updatePlane', value: function updatePlane () {
      var w = doc.width
      var h = doc.height
      var cell = Math.round(w / 35)
      var xPreSize = w / cell
      plane.xCell = w / xPreSize % 2 !== 0 ? w / (w / xPreSize + 1) : xPreSize
      var yPreSize = h / Math.round(cell * (h / w))
      plane.yCell = h / yPreSize % 2 !== 0 ? h / (h / yPreSize + 1) : yPreSize
      plane.cells = [Math.round(w / plane.xCell), Math.round(h / plane.yCell)]
      plane.xCenter = Math.round(plane.cells[1] / 2)
      plane.yCenter = Math.round(plane.cells[0] / 2)
      plane.centerCoords = [plane.yCenter * plane.xCell, plane.xCenter * plane.yCell]
  } }, { key: 'bindNodes', value: function bindNodes () {
      for (var selector in ui) {
        ui[selector] = document.querySelectorAll(ui[selector])
        if (ui[selector].length === 1) ui[selector] = ui[selector][0]
      }
  } }, { key: 'canvasInit', value: function canvasInit () {
      context.plane = ui.plane.getContext('2d')
  } }, { key: 'initEvents', value: function initEvents () {
      this.resizeHandler()
  } }, { key: 'resizeHandler', value: function resizeHandler () {
      var state = this.state
      state.area = doc.width * doc.height / 1000000
      ui.plane.height = doc.height
      ui.plane.width = doc.width
      this.updatePlane()
      state.needRedraw = true
  } }, { key: 'loop', value: function loop () {
      var _this2 = this
      var loop = function loop () {
        var state = _this2.state
        state.time = Date.now()
        _this2.updateState()
        _this2.draw()
        if (state.needRedraw) state.needRedraw = false
        _this2.raf = requestAnimationFrame(loop)
      }
      loop()
  } }, { key: 'updateState', value: function updateState () {
      var state = this.state
      var now = performance.now()
      state.delta = now - state.dlt
      state.dlt = now
      var dt = state.delta
      if (state.planeProgress >= 0.2) {
        state.dotsProgress += 0.00035 * dt
        if (state.dotsProgress >= 1) state.dotsProgress = 1
      }
      state.planeProgress += 0.00035 * dt
      if (state.planeProgress >= 1) state.planeProgress = 1
  } }, { key: 'draw', value: function draw () {
      var state = this.state
      if (this.state.planeProgress >= 1 && !state.planeIsDrawn) {
        state.planeIsDrawn = true
      }
      if (!state.planeIsDrawn || state.dotsProgress < 1 || state.planeIsDrawn && state.needRedraw) {
        this.drawPlane()
      }
  } }, { key: 'drawPlaneDotsAnimation', value: function drawPlaneDotsAnimation (props) {
      var ctx = context.plane
      var dp = props.dp,i = props.i,i2 = props.i2,x = props.x,y = props.y
      var xCenter = plane.xCenter
      var yCenter = plane.yCenter
      var position = [Math.abs(i2 - xCenter), Math.abs(i - yCenter)]
      var index = position[0] * position[1]
      var maxIndex = xCenter * yCenter
      var percent = 1 / maxIndex
      var point = percent * index
      var f = dp * (dp / point)
      if (f >= 1) f = 1
      var mf = f >= 0.5 ? (1 - f) / 0.5 : f / 0.5
      var size = 3
      if (!mf) return
      tools.drawPath(ctx, function () {
        ctx.fillStyle = 'rgba(255,255,255,' + mf * 0.15 + ')'
        ctx.fillRect(x - 1, y - 1, size, size)
      })
  } }, { key: 'drawPlaneCenterLines', value: function drawPlaneCenterLines (props) {
      var p = props.p
      var ctx = context.plane
      var centerCoords = plane.centerCoords
      tools.drawPath(ctx, function () {
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.fillRect(centerCoords[0], 0 + doc.height / 2 * (1 - p), 1, doc.height * p)
        ctx.fillRect(0 + doc.width / 2 * (1 - p), centerCoords[1], doc.width * p, 1)
      })
  } }, { key: 'drawYLines', value: function drawYLines (props) {
      var i = props.i
      var cp = props.cp
      var p = props.p
      var x = props.x
      var ctx = context.plane
      var yCenter = plane.yCenter
      var percent = 1 / yCenter
      var pos = Math.abs(i - yCenter)
      var point = percent * pos
      var f = cp * (cp / point)
      if (f >= 1) f = 1
      var ef = tools.cellEasing(f, 0, 1, 1)
      if (i) {
        tools.drawPath(ctx, function () {
          ctx.fillStyle = 'rgba(255,255,255,' + (0.05 + (1 - p) * 0.35) + ')'
          ctx.fillRect(x, 0 + doc.height / 2 * (1 - ef), 1, doc.height * ef)
        })
      }
  } }, { key: 'drawXLines', value: function drawXLines (props) {
      var ctx = context.plane
      var i2 = props.i2
      var cp = props.cp
      var p = props.p
      var y = props.y
      var xCenter = plane.xCenter
      var percent = 1 / xCenter
      var pos = Math.abs(i2 - xCenter)
      var point = percent * pos
      var f = cp * (cp / point)
      if (f >= 1) f = 1
      var ef = tools.cellEasing(f, 0, 1, 1)
      if (i2) {
        tools.drawPath(ctx, function () {
          ctx.fillStyle = 'rgba(255,255,255,' + (0.05 + (1 - p) * 0.35) + ')'
          ctx.fillRect(0 + doc.width / 2 * (1 - ef), y, doc.width * ef, 1)
        })
      }
  } }, { key: 'drawPlane', value: function drawPlane () {
      var state = this.state
      var ctx = context.plane
      ctx.clearRect(0, 0, doc.width, doc.height)
      var xCell = plane.xCell
      var yCell = plane.yCell
      var xCenter = plane.xCenter
      var yCenter = plane.yCenter
      var cells = plane.cells
      var p = tools.easing(state.planeProgress, 0, 1, 1)
      var cp = state.planeProgress
      var dp = state.dotsProgress
      this.drawPlaneCenterLines({ p: p })
      for (var i = 0; i < cells[0]; i++) {
        for (var i2 = 0; i2 < cells[1]; i2++) {
          var _x2 = i * xCell
          var _y2 = i2 * yCell
          if (i !== yCenter && i2 !== xCenter) {
            this.drawPlaneDotsAnimation({ dp: dp, i: i, i2: i2, x: _x2, y: _y2 })
          }
          if (i2 === xCenter && i !== yCenter) {
            this.drawYLines({ i: i, i2: i2, p: p, cp: cp, x: _x2, y: _y2 })
          }
          if (i2 !== xCenter && i === yCenter) {
            this.drawXLines({ i: i, i2: i2, p: p, cp: cp, x: _x2, y: _y2 })
          }
        }
      }
  } }])
  return App
}()

window.addEventListener('load', function () {
  window.app = new App()
})
