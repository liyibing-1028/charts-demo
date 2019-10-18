const circleDataProcess = Symbol('circleDataProcess');
let durHalf = 1000;
let maxRadius = 10;
class canvasCircle {
    constructor (opt = {}) {
      let def = {}
      this.options = _.assign(def, opt)
      this.context = this.options.canvas.getContext('2d');
      this.width = this.options.canvas.width || 800;
      this.height = this.options.canvas.height || 600;
    }

    setData (data) {
        // if (!data.length) return
        this.datas = data
        this.played = true
        this[ circleDataProcess ]()
    }

    [ circleDataProcess ] () {
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
      this.played = false
      this[ clear ]()
    }
}
