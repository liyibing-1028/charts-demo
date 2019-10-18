/**
 * 差值贝塞尔曲线上所有点
 * @param  arr = [x, y]
 * @param  t
 * https://nodei.co/npm/bezier
 */
function bezier (arr, t) {
  var ut = 1 - t
  return (arr[0] * ut + arr[1] * t) * ut + (arr[1] * ut + arr[2] * t) * t
}

/**
 * 计算二阶贝塞尔曲线的控制点
 * @param  s = [x, y]      起点
 * @param  d = [x, y]      终点
 * @param  dist            [0, 1]之间，表示中点距离
 * @return [x, y]  控制点坐标
 */
function calControlPoint (s, d, dist = 0.2) {
  var a, X, Y, len
  X = (s[0] + d[0]) / 2
  Y = (s[1] + d[1]) / 2
  // 控制贝塞尔曲线曲率
  // Math.sqrt(Math.pow((d[1] - s[1]), 2) + Math.pow((d[0] - s[0]), 2))
  // 利用勾股定理求出s到d的直线距离
  len = dist * Math.sqrt(Math.pow((d[1] - s[1]), 2) + Math.pow((d[0] - s[0]), 2))
  a = Math.atan2(d[1] - s[1], d[0] - s[0])
  // 在垂直平分线上某一点
  return [X - len * Math.sin(a), Y + len * Math.cos(a)]
}

/**
 * 计算二阶贝塞尔曲线
 * @param  points [[x1, y1], [x2, y2]]    所有经过点
 * @param  segment   插值点个数
 * @return points [[x, y]]  曲线所有插值点
 */
function calBezierLine (points, segment = 100, dist = 0.2) {
  let ret = []
  let total = segment - 1
  let newPoints
  if (points.length < 2) {
    console.error('calBezierLine length of points must over 2.')
  } else if (points.length === 2) {
    newPoints = [points[0]]
    points.reduce((prev, next) => {
      let mid = calControlPoint(prev, next, dist)
      newPoints.push(mid, next)
      return next
    })
  } else {
    newPoints = points
  }
  for (let i = 0; i < segment; i++) {
    let t = i / total
    let x = bezier(newPoints.map(a => a[0]), t)
    let y = bezier(newPoints.map(a => a[1]), t)
    ret.push([x, y])
  }
  return ret
}

/**
 * 获得颜色值
 * @param  ctx    context = canvas.node().getContext('2d')
 * @param  color  颜色
 * @param  p1     起点坐标[x, y]
 * @param  p2     终点坐标[x, y]
 */
function getColor (ctx, color, p1, p2) {
  let lineColor = color
  if (_.isArray(color)) { // 线性渐变
    let line = ctx.createLinearGradient(p1[0], p1[1], p2[0], p2[1])
    color.map((c) => {
      line.addColorStop(c[0], c[1])
    })
    lineColor = line
  }
  return lineColor
}

/**
 * addShadow
 * @param  ctx    context = canvas.node().getContext('2d')
 * @param  color  颜色
 * @param  x      x方向偏移量
 * @param  y      y方向偏移量
 * @param  blur   shadowBlur
 */
function addShadow (ctx, opt = {}) {
  let def = {
    x: 0,
    y: 0,
    blur: 10,
    color: '#fff'
  }
  let options = _.assign(def, opt)
  ctx.shadowColor = options.color
  ctx.shadowOffsetX = options.x
  ctx.shadowOffsetY = options.y
  ctx.shadowBlur = options.blur
}

/**
 * graphics
 * @param  ctx    context = canvas.node().getContext('2d')
 */
function graphics (ctx) {
  return {
    line: function line (p1, p2, width = 2, color = 'red') {
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();
    },
    bezierLine: function bezierLine (p1, p, p2, width = 2, color = 'red') {
        ctx.moveTo(p1[0], p1[1]);
        ctx.quadraticCurveTo(p[0], p[1], p2[0], p2[1]);
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();
    },
    shadowLine: function shadowLine (points, opt = {}) {
      if (!ctx) return
       let def = {
         color: 'red',
         width: 2,
         addShadow: false,
         shadow: {
           x: 0,
           y: 0,
           blur: 10,
           color: '#fff'
         }
       }
       let options = _.assign(def, opt)
       let p1 = points[0]
       let p2 = points[points.length - 1]
       ctx.beginPath()
       // ctx.moveTo(options.points[0][0], options.points[0][1])
       points.map((d, i) => {
         ctx.lineTo(d[0], d[1])
       })
       ctx.strokeStyle = getColor(ctx, options.color, p1, p2)
       ctx.lineWidth = options.width
       options.addShadow && addShadow(ctx, options.shadow)
       ctx.stroke()
       return ctx
    }
  }
}
