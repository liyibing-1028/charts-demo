// 'use strict';
define([
    'snap', 'jquery'
], function(
    Snap, $
) {

    function BackGroundSvg () {
        var instance = {},
            opts = {
                el: "body",
                pointLength: 3.5,
                width: window.innerWidth,
                height: window.innerHeight,
                gird: 140,
                attr: {
                    point: {
                        stroke: 'rgba(205,205,205,0.2)',
                        opacity: 0.4,
                        "shape-rendering": "crispEdges"
                    },
                    path: {
                        stroke: 'rgba(205,205,205,0.15)',
                        opacity: 0.2,
                        "shape-rendering": "crispEdges"
                    }
                }
            }

        var paper,
            path = '',
            point = '',
            cx, cy

        instance.params = function (params) {
            opts = $.extend({}, opts, params)
            opts.$el = $(opts.el)

            cx = opts.width / 2 | 0,
            cy = opts.height / 2 | 0

            paper = Snap( opts.width, opts.height )
                .addClass("svg-background")       

            return instance
        }

        instance.render = function () {

            var width = opts.width,
                height = opts.height,
                gird = opts.gird

            for(var i = ( cx + gird/2 ), c = 0; i < width; i += gird, c++ ){

                var x2 = cx * 2 - i

                path += Snap.format("M{x},{y}v{h} M{x2},{y}v{h}", {
                    x: i,
                    x2: x2,
                    y: 0,
                    h: height
                })

                for(var j = ( cy + gird/2 ); j < height; j += gird ){

                    var y2 = cy * 2 - j ;

                    ( c == 0 ) && ( path += Snap.format("M{x},{y}h{h} M{x},{y2}h{h}", {
                        x: 0,
                        y: j,
                        y2: y2 ,
                        h: width
                    }))

                    var _p = [
                        [ i, j ],
                        [ x2, j ],
                        [ i, y2 ],
                        [ x2, y2 ]
                    ]

                    for(var m in _p){
                        point += Snap.format("M{x},{y}h{h}M{x},{y}h-{h}M{x},{y}v{h}M{x},{y}v-{h}", {
                            x: _p[m][0],
                            y: _p[m][1],
                            h: opts.pointLength
                        })
                    }
                    
                }
            }

            paper.path( path ).attr( opts.attr.path )
            paper.path( point ).attr( opts.attr.point )

            return instance
        }

        return instance
    }

    return BackGroundSvg

})
