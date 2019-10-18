import $ from 'jquery'
import * as d3 from 'd3'
import moment from 'moment'
import _ from 'lodash'

class Brush {
  constructor (options) {
    this.opts = $.extend({
      id: 'body'
    }, options)
    this.init()
    return this
  }
  init () {
    // 绘制brush柱状图
    let ele = this.opts.id
    this.width = $(`#${ele}`).width() // svg绘图区域的宽度
    this.height = $(`#${ele}`).height() // svg绘图区域的高度
    this.svg = d3.select(`#${ele}`) // 选择元素
      .append('svg') // 在元素中添加<svg>
      .attr('width', this.width) // 设置<svg>的宽度属性
      .attr('height', this.height) // 设置<svg>的高度属性
    this.paper = this.svg.append('g')
    this.x = d3.scaleBand().range([0, this.width])
    this.y = d3.scaleLinear().range([this.height - 20, 0])
    // 绘制brush开始
    this.brush = d3.brushX().extent([[0, 0], [this.width, this.height]])

    // 绘制新闻占比饼图
    this.pieW = $('#pieChart').width()
    this.pieH = $('#pieChart').height()
    this.pie = d3.select('#pieChart')
      .append('svg')
      .attr('width', this.pieW)
      .attr('height', this.pieH)
    this.piePaper = this.pie.append('g')
  }
  draw (datest) {
    if (!datest.length) return
    this.paper.remove()
    let x = this.x
    let y = this.y
    // let w = this.width
    let h = this.height
    this.paper = this.svg.append('g')
    x.domain(_.map(_.orderBy(datest, ['time']), 'time'))
    x.invert = (function () {
      var domain = x.domain()
      var range = x.range()
      var scale = d3.scaleQuantize().domain(range).range(domain)
      return function (x) {
        return scale(x)
      }
    })()
    y.domain([0, d3.max(datest, function (d) {
      return d.size + d.size2
    })])
    this.brush.on('end', brushed)
    // 添加文字部分
    this.paper.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + (this.height - 20) + ')')
      .call(d3.axisBottom(x))
      .selectAll('.tick text')
      .text(function (d) {
        return moment(d).format('D')
      })
    // 绘制矩形
    let flagArr = []
    datest.forEach((item, index) => {
      if (item.selected) {
        flagArr.push({
          time: item.time,
          index: index
        })
      }
    })
    this.paper.append('g').selectAll('.bar')
      .data(datest)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .each(function (d) {
        let rectX = x(d.time) + x.bandwidth() / 4
        let rectW = x.bandwidth() / 2
        let rectH = y(0) - y(d.size)
        let rectY = (h - 20) - rectH
        let rectH2 = y(0) - y(d.size2)
        let rectY2 = rectY - rectH2
        let belong = +moment(moment(flagArr[0].time).format('YYYY-MM-DD 00:00:00')).format('x')
        let now = +moment(moment(flagArr[flagArr.length - 1].time).format('YYYY-MM-DD 23:59:59')).format('x')
        if (+moment(d.time).format('x') >= belong && +moment(d.time).format('x') <= now) {
          d3.select(this)
          .append('rect')
          .attr('class', 'bar-green')
          .attr('x', rectX)
          .attr('width', rectW)
          .attr('y', rectY)
          .attr('height', rectH)
          d3.select(this)
          .append('path')
          .attr('class', 'bar-red')
          .attr('d', rightRoundedRect(rectX, rectY2, rectW, rectH2, 2))
        } else {
          d3.select(this)
          .append('rect')
          .attr('class', 'bar-green2')
          .attr('x', rectX)
          .attr('width', rectW)
          .attr('y', rectY)
          .attr('height', rectH)
          d3.select(this)
          .append('path')
          .attr('class', 'bar-red2')
          .attr('d', rightRoundedRect(rectX, rectY2, rectW, rectH2, 2))
        }
      })
    this.paper.append('g')
      .attr('class', 'brush')
      .call(this.brush)
      .call(this.brush.move, [flagArr[0].index * x.bandwidth(), (flagArr[flagArr.length - 1].index + 1) * x.bandwidth()])

    // 鼠标移上柱状图效果
    let offsetTop = $(`#${this.opts.id}`).offset().top
    let offsetLeft = $(`#${this.opts.id}`).offset().left
    let tooltip = d3.select('#tooltip').append('div')
      .attr('class', 'brush-tooltip')
      .style('display', 'none')
    this.paper.selectAll('.bar').on('mouseover', (d, i) => {
      let top = d3.event.pageY - offsetTop - 70
      let left = d3.event.pageX - offsetLeft + (x.bandwidth() / 2)
      if (i < 16) {
        left = d3.event.pageX - offsetLeft + (x.bandwidth() / 2)
      } else {
        left = d3.event.pageX - offsetLeft - 125 - (x.bandwidth() / 2)
      }
      tooltip.style('display', 'block')
        .style('top', top + 'px')
        .style('left', left + 'px')
        .html(`${'时间：' + d.time + '<br/>正面：' + d.size + '<br/>负面：' + d.size2}`)
    }).on('mouseout', () => {
      tooltip.style('display', 'none')
    }).on('click', (d) => {
      this.paper.select('.brush').call(this.brush.move, [x(d.time), x(d.time) + x.bandwidth() / 2])
    })
    // 绘制圆角
    function rightRoundedRect (x, y, width, height, radius) {
      return 'M' + (x + radius) + ',' + y +
        'h' + (width - 2 * radius) +
        'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius +
        'v' + (height - radius) +
        'h' + (-width) +
        'v' + (-height + radius) +
        'a' + radius + ',' + -radius + ' 0 0 1 ' + radius + ',' + -radius + 'z'
    }
    let self = this
    function brushed () {
      if (!d3.event.selection) {
        d3.selectAll('.bar').each(function (d, i) {
          let barDottom = d3.select(this).select('.bar-green')
          let barTop = d3.select(this).select('.bar-red')
          barDottom.attr('class', 'bar-green2')
          barTop.attr('class', 'bar-red2')
        })
      }
      if (!d3.event.sourceEvent) return
      if (!d3.event.selection) return
      var extent = d3.event.selection
      var vextent = extent.map(x.invert)
      if (+moment(vextent[0]).format('x') >= +moment(vextent[1]).format('x')) {
        vextent[1] = moment(+moment(vextent[0]).format('x') + 86400000).format('YYYY-MM-DD')
      }
      var xWid = vextent.map(x)
      let sTime = vextent[0]
      let eTime = moment(vextent[1]).format('YYYY-MM-DD')
      if (extent[0] - x(vextent[0]) > x.bandwidth() / 2) {
        xWid[0] += x.bandwidth()
        let sNum = +moment(vextent[0]).format('x') + 86400000
        sTime = moment(sNum).format('YYYY-MM-DD')
      }
      let xEnd = x(vextent[1]) || (x(vextent[0]) - x.bandwidth() / 2)
      if (extent[1] - xEnd > x.bandwidth() / 2) {
        let xw = xWid[1] || xWid[0]
        xw += x.bandwidth()
        xWid[1] = xw
      } else {
        eTime = moment(vextent[1]).subtract(1, 'd').format('YYYY-MM-DD')
      }
      d3.select(this).transition().call(d3.event.target.move, xWid)
      d3.selectAll('.bar').each(function (d, i) {
        if (moment(d.time).format('x') >= moment(sTime).format('x') && moment(d.time).format('x') <= moment(eTime).format('x')) {
          let barDottom = d3.select(this).select('.bar-green2')
          let barTop = d3.select(this).select('.bar-red2')
          barDottom.attr('class', 'bar-green')
          barTop.attr('class', 'bar-red')
        } else {
          let barDottom = d3.select(this).select('.bar-green')
          let barTop = d3.select(this).select('.bar-red')
          barDottom.attr('class', 'bar-green2')
          barTop.attr('class', 'bar-red2')
        }
      })
      self.opts.cb && self.opts.cb(sTime, eTime)
    }
    return this
  }
  drawPie (data) {
    if (!data.length) return
    this.piePaper.remove()
    this.piePaper = this.pie.append('g')
    let pieNum = data[0] / 50
    let arc = d3.arc()
      .innerRadius(0)
      .outerRadius(this.pieW / 2)
      .startAngle(0)
    this.piePaper.attr('transform', `translate(${this.pieW / 2}, ${this.pieH / 2})`)
    this.piePaper.append('path')
      .datum({endAngle: 2 * Math.PI})
      .style('fill', '#F5F5F6')
      .attr('d', arc)
    this.piePaper.append('path')
      .datum({endAngle: pieNum * Math.PI})
      .style('fill', '#F17C7B')
      .attr('d', arc)
  }
}

export { Brush }
