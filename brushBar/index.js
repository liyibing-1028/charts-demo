/**
 * Created by xufengchao on 16/8/22.
 */
import './style.less'
import template from './template.html'
import { Brush } from './brush'
import moment from 'moment'

export default{
  template,
  components: {
  },
  vuex: {},
  computed: {
  },
  data () {
    return {
      showNextBtn: true,
      brush: null,
      timeStr: '',
      timeArr: [],
      sDay: 0,
      nowDay: new Date().getTime()
    }
  },
  methods: {
    // 数据处理
    parseData () {
      let data = []
      for (let i = 0; i < 30; i++) {
        data.push({
          time: moment().subtract(i, 'd').format('YYYY-MM-DD'),
          size: parseInt(Math.random() * 120),
          size2: parseInt(Math.random() * 100)
        })
      }
      return data
    },
    // 获取brush类
    getBrush () {
      let data = this.parseData()
      this.timeStr = moment(data[data.length - 1].time).format('MM-DD') + ' ~ ' + moment(data[0].time).format('MM-DD')
      this.timeArr = [+moment(data[data.length - 1].time).format('x'), +moment(data[0].time).format('x')]
      this.brush = new Brush({
        id: 'svg',
        cb: (s, e) => {
          this.sDay = +moment(s).format('x')
          this.timeStr = moment(s).format('MM-DD') + ' ~ ' + moment(e).format('MM-DD')
        }
      })
      this.brush.draw(data).drawPie([64])
    },
    // 前30天
    prevTime () {
      let belong = 0
      let prev = 0
      let nowDate = ''
      let prevDate = ''
      if (this.sDay >= this.timeArr[0]) {
        belong = moment(this.sDay).format('x')
        prev = moment(this.sDay).subtract(30, 'd').format('x')
        nowDate = moment(+belong).format('MM-DD')
        prevDate = moment(+prev).format('MM-DD')
        this.sDay = prev
      } else {
        belong = moment(+this.nowDay).subtract(30, 'd').format('x')
        prev = moment(+belong).subtract(30, 'd').format('x')
        nowDate = moment(+belong).format('MM-DD')
        prevDate = moment(+prev).format('MM-DD')
      }
      this.nowDay = belong
      this.timeStr = prevDate + ' ~ ' + nowDate
      this.showNextBtn = false
      let data = this.parseData()
      this.brush.draw(data).drawPie([58])
    },
    // 后30天
    nextTime () {
      if (this.showNextBtn) return
      let now = moment(+this.nowDay).format('x')
      let next = +now + (86400000 * 30)
      let nowDate = moment(+now).format('MM-DD')
      let prevDate = moment(+next).format('MM-DD')
      this.nowDay = next
      this.timeStr = nowDate + ' ~ ' + prevDate
      if (next >= +moment(moment().format('YYYY-MM-DD')).format('x')) {
        this.showNextBtn = true
      }
      let data = this.parseData()
      this.brush.draw(data).drawPie([58])
    }
  },
  mounted () {
    this.getBrush()
  },
  watch: {
  }
}
