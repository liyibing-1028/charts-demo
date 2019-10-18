//animation frame polyfill
(function() {
    var lastTime = 0
    var vendors = ['ms', 'moz', 'webkit', 'o']
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime()
            var timeToCall = Math.max(0, 16 - (currTime - lastTime))
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall)
                },
                timeToCall)
            lastTime = currTime + timeToCall
            return id
        }

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id)
        }
}())

//math2 utils
var Math2 = {}
Math2.random = function(t, n) {
    return Math.random() * (n - t) + t
}, Math2.map = function(t, n, r, a, o) {
    return (o - a) * ((t - n) / (r - n)) + a
}, Math2.randomPlusMinus = function(t) {
    return t = t ? t : .5, Math.random() > t ? -1 : 1
}, Math2.randomInt = function(t, n) {
    return n += 1, Math.floor(Math.random() * (n - t) + t)
}, Math2.randomBool = function(t) {
    return t = t ? t : .5, Math.random() < t ? !0 : !1
}, Math2.degToRad = function(t) {
    return rad = t * Math.PI / 180, rad
}, Math2.radToDeg = function(t) {
    return deg = 180 / (Math.PI * t), deg
}, Math2.rgbToHex = function(t) {
    function n(t) {
        return ("0" + parseInt(t).toString(16)).slice(-2)
    }
    t = t.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    var r = n(t[1]) + n(t[2]) + n(t[3])
    return r.toUpperCase()
}, Math2.distance = function(t, n, r, a) {
    return Math.sqrt((r - t) * (r - t) + (a - n) * (a - n))
}

//mouse
var mousePos = {
    x: 0,
    y: 0
}
window.onmousemove = function(e) {

    e = e || window.event

    var pageX = e.pageX
    var pageY = e.pageY
    if (pageX === undefined) {
        pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
        pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    }
    mousePos = {
        x: pageX,
        y: pageY,
    }
}

class CanvasText {
    constructor (opt = {}) {
        this.opts = $.extend({
            id: 'body'
        }, opt)
        console.log('this.opts', this.opts)
    }
}

let text = '赌博'
let fontSize = 30
var options = {
    width: fontSize * text.length,
    height: fontSize + 10,
    density: 15,
    densityText: 1,
    minDist: 20,
}

// initialize canvas
var canvas = document.createElement('canvas')
canvas.width = options.width
canvas.height = options.height
let context = canvas.getContext('2d')

var renderer = new PIXI.Application(options.width, options.height, {
    transparent: true
})
document.body.appendChild(renderer.view)
console.log('renderer.view', renderer.view)
var stage = renderer.stage
var imageData = false
var particles = []


function init() {
    // positionText()
    // update()
    test()
}

function test() {
    const app = new PIXI.Application({ antialias: true });
    document.body.appendChild(app.view);

    const bezier = new PIXI.Graphics();

    bezier.lineStyle(5, 0xAA0000, 1);
    bezier.bezierCurveTo(0, 75, 75, 100, 100, 100); // 控制点1 -- x,y ====  控制点2 -- x,y ===  结束的 -- x,y

    bezier.position.x = 50;
    bezier.position.y = 50;

    const bezier2 = new PIXI.Graphics();

    bezier2.lineStyle(5, 0xAA0000, 1);
    bezier2.bezierCurveTo(0, -75, 75, -100, 100, -100); // 控制点1 -- x,y ====  控制点2 -- x,y ===  结束的 -- x,y

    bezier2.position.x = 50;
    bezier2.position.y = 550;

    app.stage.addChild(bezier);
    app.stage.addChild(bezier2);
} 

function positionText() {
    // var canvas = document.createElement("canvas")
    // var context = canvas.getContext("2d")
    context.fillStyle = "#fff"
    context.font = `${fontSize}px 'Arial', sans-serif`
    context.fillText(text, 0, fontSize)
    var imageData = context.getImageData(0, 0, 400, 400)
    data = imageData.data
    // Iterate each row and column
    for (var i = 0; i < imageData.height; i += options.densityText) {
        for (var j = 0; j < imageData.width; j += options.densityText) {

            // Get the color of the pixel
            var color = data[((j * (imageData.width * 4)) + (i * 4)) - 1]

            // If the color is black, draw pixels
            if (color == 255) {
                var newPar = particle(true)
                newPar.setPosition(i, j)
                particles.push(newPar)
                stage.addChild(newPar)
            }
        }
    }
}

function particle(text) {

    $this = new PIXI.Graphics()

    if (text == true) {
        $this.text = true
    }

    $this.beginFill(0XFFFFFF)

    var radius
    $this.radius = radius = $this.text ? Math.random() * .5 : Math.random() * 8.5
    $this.drawCircle(0, 0, radius)
    $this.size = 10
    $this.x = 0
    $this.y = 0
    $this.free = false

    $this.timer = Math2.randomInt(0, 100)
    $this.v = Math2.randomPlusMinus() * Math2.random(.2, .6)
    $this.hovered = false

    $this.alpha = Math2.randomInt(10, 100) / 100 // 透明

    $this.vy = -5 + parseInt(Math.random() * 5) / 2
    $this.vx = -4 + parseInt(Math.random() * 2)
    $this.setPosition = function(x, y) {
        $this.x = x
        $this.y = y
    }
    
    return $this

}

// console.log('particles~~~~~~~~~~', particles)
function update() {
    renderer.render(stage)
    for (i = 0; i < particles.length; i++) {
        var p = particles[i]

        if (mousePos.x > p.x && mousePos.x < p.x + p.size && mousePos.y > p.y && mousePos.y < p.y + p.size) {
            p.hovered = true
        }

        p.scale.x = p.scale.y = scale = Math.max(Math.min(2.5 - (Math2.distance(p.x, p.y, mousePos.x, mousePos.y) / 160), 160), 1)

        p.x = p.x + .1 * Math.sin(p.timer * .15)
        p.y = p.y + .1 * Math.cos(p.timer * .15)
        p.timer = p.timer + p.v * 5
    }
    window.requestAnimationFrame(update)
}

init()
