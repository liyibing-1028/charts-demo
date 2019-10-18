const circleDataProcess = Symbol('circleDataProcess');
let durHalf = 1000;
let maxRadius = 10;
class canvasCircle {
    constructor (opt = {}) {
      let def = {
        points: 50,
        duration: 1000,
        delay: 0,
        repeatCount: Infinity
      }
      this.options = _.assign(def, opt)
      this.context = this.options.canvas.getContext('2d');
      this.width = this.options.canvas.width || 800;
      this.height = this.options.canvas.height || 600;
      this.elapsed = this.options.duration / 2
      this.tile = this.options.points / this.elapsed
      this.startTime = new Date().getTime()
      this.repeatNum = 1
      this.allLeaveTime = 0
    }

    setData (data) {
        if (!data.length) return
        this[ clear ]()
        this.datas = data
        this[ circleDataProcess ]()
    }

    [ circleDataProcess ] () {
      this.played = true
      this.options.runTime = this.options.duration + this.options.delay * (this.datas.length - 1)
      this.run()
    }

    run () {
      // 
      this.context.fillStyle = 'rgba(255, 255, 255, .9)';
      let prev = this.context.globalCompositeOperation; // 组合颜色
      this.context.globalCompositeOperation = 'destination-in';
      this.context.fillRect(0, 0, this.width, this.height);
      this.context.globalCompositeOperation = prev;
      this.datas.forEach((d, i) => {
        this.draw(d, i);
      })
      this.played && requestAnimationFrame(this.run.bind(this));
    }

    draw (data, i) {
      let elapsedTime = new Date().getTime() - this.allLeaveTime - (this.startTime + i * this.options.delay)
      if (elapsedTime <= this.options.duration) {
        this.context.save();
        this.createCircle(data.point, data.size, data.color);
        this.context.restore();
        let timeDeffer = new Date().getTime() - data.startTime;
        let speed = timeDeffer / durHalf * maxRadius;
        data.size = speed;
        if (data.size > maxRadius) { // 扩散尺寸大于半径
          data.size = 0;
          data.startTime = new Date().getTime();
        }
      }
      if (elapsedTime >= this.options.runTime) {
        if (this.options.repeatCount !== Infinity && this.repeatNum === this.options.repeatCount) {
          this.played = false
        } else {
          this.startTime = new Date().getTime() - this.allLeaveTime
          this.repeatNum += 1
        }
      }
    }

    createCircle (point, radius, color) {
      if (radius < 0) return;
      if (radius) {
        let alpha = 1 - radius / 10
        this.context.beginPath();
        this.context.strokeWidth = 2;
        this.context.strokeStyle = color + `${alpha})`;
        this.context.arc(point[0], point[1], radius, 0, Math.PI * 2);
        this.context.stroke();
        this.context.closePath();
        return this.context;
      }
    }

    [ clear ] () {
      this.context && this.context.clearRect(0, 0, this.width, this.height)
    }

    destroy () {
      this[ clear ]()
      this.played = false
    }
}
