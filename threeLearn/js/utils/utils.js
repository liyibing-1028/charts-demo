/*
 *===========================================================================================
 *
 * 工具类
 *
 *===========================================================================================
 */

var Utils = function (THREE, _) {
    // var THREE = require("three");
    // var _ = require("lodash");

    var tokenRegex = /\{([^\}]+)\}/g,
        objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,
        replacer = function (all, key, obj) {
            var res = obj;
            key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                name = name || quotedName;
                if (res) {
                    if (name in res) {
                        res = res[name];
                    }
                    typeof res == "function" && isFunc && (res = res());
                }
            });
            res = (res == null || res == obj ? all : res) + "";
            return res;
        };

    return {

        format: function (str, obj) {

            return String(str).replace(tokenRegex, function (all, key) {

                return replacer(all, key, obj);
            });
        },

        randPos: (function (){

            var v = new THREE.Vector3();

            return function(radius, isNew){

                radius || ( radius = 100 );

                v.set(

                    ( Math.random() * 2 - 1 ) * radius, 
                    ( Math.random() * 2 - 1 ) * radius, 
                    ( Math.random() * 2 - 1 ) * radius
                );

                if (isNew){

                    return new THREE.Vector3().copy(v);
                }

                return v;
            }

        })(),

        coord: {

            DefaultScale: 1.6,

            DefaultRadius: 100,

            toFlat: (function(){

                var vertex = new THREE.Vector3();

                return function (x, y, offetZ){

                    offetZ = offetZ !== undefined? offetZ: 0;

                    vertex.set(x, y, 0).multiplyScalar(this.DefaultScale);
                    vertex.z += offetZ;

                    return vertex;
                }
            }()),

            toSphere: (function (){

                var lon = 0.0, lat = 0.0;
                var vertex = new THREE.Vector3();

                return function (x, y, r){

                    r = r !== undefined ? r : this.DefaultRadius;

                    lon = x * Math.PI / 180;
                    lat = y * Math.PI / 180;

                    vertex.x = r * Math.cos(lat) * Math.sin(lon);
                    vertex.y = r * Math.sin(lat);
                    vertex.z = r * Math.cos(lat) * Math.cos(lon);

                    return vertex;
                }
            }()),

            toLonLat: (function (){

                var lon = 0.0, lat = 0.0;
                var xzPlane = new THREE.Vector3();
                var zAxis = new THREE.Vector3(0, 0, 1);
                var lonLatVector = new THREE.Vector2();

                return function (vertex, r){

                    r = r !== undefined ? r : this.DefaultRadius;

                    xzPlane.set(vertex.x, 0, vertex.z);

                    lon = Math.acos(xzPlane.normalize().dot(zAxis)) * 180 / Math.PI;
                    lat = Math.asin(vertex.y / r) * 180 / Math.PI;
                    lon = vertex.x >= 0 ? lon : -lon;
                    
                    lonLatVector.set(lon, lat);
                    
                    return lonLatVector;
                }
            }()),
        },

        ip : {

            encode: function (origiIp){

                return 16777216 * origiIp.x + 65536 * origiIp.y + 256 * origiIp.z + 1 * origiIp.w;
            },

            decode: function (compressedIp){

                compressedIp = parseInt(compressedIp);

                return [
                    
                    Math.floor( compressedIp / 16777216 % 256 ), 
                    Math.floor( compressedIp / 65536 % 256 ), 
                    Math.floor( compressedIp / 256 % 256 ), 
                    Math.floor( compressedIp % 256 )
                ].join(".");
            },
            randomString: function (){

                return [ 

                    THREE.Math.randInt(0, 255).toString(),
                    THREE.Math.randInt(0, 255).toString(),
                    THREE.Math.randInt(0, 255).toString(),
                    THREE.Math.randInt(0, 255).toString()
                ].join(".");
            }
        },

        Reg: {

            ShaderMatch: (function (){

                var regExp = new RegExp();
                var regSource = "";

                return function (para, str){

                    regSource = "/\\*.*" + para + ".*\\*/([\\w\\W]*?(?=/\\*[\\w\\W]*\\*/)|[\\w\\W]*)";

                    regExp.compile(regSource);

                    return regExp.exec(str);
                }
            }()),

            HtmlTemplateMath: (function (){

                var regExp = new RegExp();
                var regSource = "";

                return function (para, str){

                    regSource = "/\\*.*" + para + ".*\\*/([\\w\\W]*?(?=/\\*[\\w\\W]*\\*/)|[\\w\\W]*)";

                    regExp.compile(regSource);

                    return regExp.exec(str);
                }
            }()),
        },

        ConvertCountryName: function (name){

            var newName = name;

            switch(name){    //Dem. Rep. Korea, Samoa

                case "Hong Kong":
                case "Taiwan":
                    newName = "China";
                    break;
                case "Republic of Korea":
                    newName = "Korea";
                    break;
                case "British Virgin Islands":
                    newName = "United Kingdom";
            }

            return newName;
        },

        project: {

            toScreen: (function (){

                var projectVector = new THREE.Vector3();
                var screenVector = new THREE.Vector2();
                var screenSize = new THREE.Vector2(window.innerWidth, window.innerHeight);

                return function (camera, vec3, size){

                    ( size instanceof THREE.Vector2 ) || ( size = screenSize );

                    projectVector.copy(vec3);
                    projectVector.project(camera);

                    screenVector.set(

                        (projectVector.x + 1) / 2 * size.x,
                        (1 - projectVector.y) / 2 * size.y
                    );

                    return screenVector;
                }
            })(),

            toScene: (function (){

                var unprojectVector = new THREE.Vector3();
                var screenSize = new THREE.Vector2(window.innerWidth, window.innerHeight);

                return function (camera, vec2, size, depth){

                    ( size instanceof THREE.Vector2 ) || ( size = screenSize );
                    ( depth === undefined ) && ( depth = 0.998 );

                    unprojectVector.set(

                        ( vec2.x / size.x ) * 2 - 1,
                        -( vec2.y / size.y ) * 2 + 1,
                        depth
                    );

                    unprojectVector.unproject(camera);

                    return unprojectVector;
                }
            })()
        },

        forwardDirection: (function() {

            var v1 = new THREE.Vector3();
            var v2 = new THREE.Vector3();
            var y = new THREE.Vector3(0, 1, 0);

            return function (camera){

                v1.copy(camera.position).normalize();
                v2.copy(v1);

                v1.crossVectors(v1, y);
                v1.crossVectors(v1, v2);

                return v1.normalize();
            }
        })(),

        drawTextTexture: (function (str){

            /*var canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;*/

            return function (str){

                var canvas = document.createElement('canvas');
                    canvas.width = 256;
                    canvas.height = 256;

                var str = str.toString();
                var context = canvas.getContext('2d');

                var fontSize = parseInt( canvas.width / (str.length) - str.length * 2 );
                context.globalAlpha = 1;
                context.font = "bold " + fontSize + "px 微软雅黑";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillStyle = "#FFFFFF";
                context.fillText(str, canvas.width / 2, canvas.height / 2);

                var texture = new THREE.Texture(canvas);
                    texture.needsUpdate = true;

                return texture;
            }
        })()
    }
}