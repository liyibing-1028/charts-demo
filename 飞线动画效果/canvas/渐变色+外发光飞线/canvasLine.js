// const draw = Symbol('draw');
const drawLines = Symbol('drawLines');
const dataProcess = Symbol('dataProcess');
const clear = Symbol('clear');

class canvasLine {
    constructor (opt = {}) {
        let def = {
          points: 50,
          duration: 1500,
          delay: 0,
          repeatCount: Infinity, // Infinity
          width: 2,
          color: 'red',
          addShadow: true,
          shadow: {
            x: 0,
            y: 0,
            blur: 10,
            color: '#fff'
          }
        }
        this.options = _.assign(def, opt)
        this.context = this.options.canvas.getContext('2d');
        console.log(this.options.canvas)
        this.width = this.options.canvas.width || 800;
        this.height = this.options.canvas.height || 600;
        this.elapsed = this.options.duration / 2
        this.tile = this.options.points / this.elapsed
        this.allLeaveTime = 0
        this.startTime = new Date().getTime()
        this.repeatNum = 1
        // console.log(calBezierLine)
        /**
         * 基于两个小函数实现
         * 设置数据
         * 初始化canvas
         * 定义贝塞尔曲线
         * 差值出贝塞尔曲线上所有点
         * 定义绘制形状函数
         * 绘制形状
         */
    }

    setData (data) {
        if (!data.length) return
        // this[ clear ]()
        this.datas = data
        this[ dataProcess ]()
    }

    [ dataProcess ] () {
      this.points = []
      let dist = -0.3
      this.datas.forEach(d => {
        let x = d.from
        let y = d.to
        this.points.push({
          data: calBezierLine([x, y], this.options.points, dist), // this.options.points,
          color: d.color || this.options.color
        })
      })
      console.log(this.points, '>>>>>>')
      this.played = true
      this._graphics = graphics(this.context)
      this.options.runTime = this.options.duration + this.options.delay * (this.points.length - 1) // 计算最大动画时长停止requestAnimationFrame
      this.run()
      // this[ drawLines ]()
    }

    run () {
      this[ clear ]()
      this.points && this.points.map((d, i) => {
        this.drawLine(d.data, i, d.color)
      })
      this.played && requestAnimationFrame(this.run.bind(this))
    }

    drawLine (data, i, color) {
      let elapsedTime = new Date().getTime() - this.allLeaveTime - (this.startTime + i * this.options.delay)
      if (elapsedTime <= this.options.duration) {
        let num = _.floor(this.tile * elapsedTime)
        // console.log(num)
        if (num > 0) {
          let points = _.take(data, num)
          if (elapsedTime >= this.elapsed) {
            points = data.slice((num - this.options.points) || 1, this.options.points)
          }
          // let newColor = 'red'
          let newColor = color || this.options.color
          let shadowColor = color
          if (newColor[1][1]) {
            shadowColor = newColor[1][1] // rgbaToRgb(newColor[1][1])
          }

          points.length && this._graphics.shadowLine(points, {
            color: newColor,
            width: this.options.width,
            addShadow: this.options.addShadow,
            shadow: {
              x: this.options.shadow.x,
              y: this.options.shadow.y,
              blur: this.options.shadow.blur,
              color: shadowColor
            }
          })
        }
      }
      if (elapsedTime >= this.options.runTime) {
        if ((this.options.repeatCount !== Infinity && this.repeatNum === this.options.repeatCount)) {
          this.played = false
        } else {
          this.startTime = new Date().getTime() - this.allLeaveTime
          this.repeatNum += 1
        }
      }
    }

    [ clear ] () {
      this.context && this.context.clearRect(0, 0, this.width, this.height)
    }

    [ drawLines ] () {
        let _graphics = graphics(this.context)
        this.datas.forEach((d, i) => {
            _graphics.line(d.from, d.to)
            _graphics.bezierLine(d.from, calControlPoint(d.from, d.to, -0.3), d.to)
        });
    }

    destroy () {
      this.played = false
    }
}
