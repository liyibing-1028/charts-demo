"use strict";
/*
 *===========================================================================================
 *
 * 球体控制器：BallController
 *
 *===========================================================================================
 */

define(["three", "tween"], function (THREE, TWEEN){

    var defaultOptions = {

        camera: new THREE.Camera(),     
        domElement: document,
        axis: new THREE.Vector3(0, 1, 0),       // camera 旋转轴
        target: new THREE.Vector3(0, 0, 0),     // camera 朝向坐标
        rotateSpeed: 0.05,
        zoomSpeed: 0.2,
        noRotate: false,
        noZoom: false,
        staticMoving: false,
        dynamicDampingFactor: 0.1,              // 阻尼
        minDistance: 1,                         // camera 到 target 的最小距离
        maxDistance: Infinity,                  // camera 到 target 的最大距离
        targetYRaitoRange: [0, 1],                        // 摄像机抬头比例，即从mindistance 到 maxdistance 的规划表示
        targetYDistanceRange: [0, 180],                        // 摄像机在 targetYRaitoRange 范围内的最大改变角度
    }

    var BallController = function (options){

        options || ( options = {} );

        this.screen = { left: 0, top: 0, width: 0, height: 0 };

        //privates
        var _this = this;

        var _clock = new THREE.Clock();

        var _zoomStart = 0,
            _zoomEnd = 0,
            _mousePreventPosition = new THREE.Vector2(),
            _mouseCurrentPosition = new THREE.Vector2();

        var _getMouseOnScreen = ( function () {

            var vector = new THREE.Vector2();

            return function ( pageX, pageY ) {

                vector.set(
                    ( pageX - _this.screen.left ) / _this.screen.width,
                    -( pageY - _this.screen.top ) / _this.screen.height
                );

                return vector;
            };

        }() );

        var _getMouseOnCircle = ( function () {

            var vector = new THREE.Vector2();

            return function ( pageX, pageY ) {

                vector.set(
                    ( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
                    ( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.width ) // screen.width intentional
                );

                return vector;
            };

        }() );

        var _coordToSphereVector = (function (){

            var v = new THREE.Vector3();

            return function (lon, lat, r){

                r = r !== undefined ? r : 200,
                lon *= Math.PI / 180,
                lat *= Math.PI / 180;

                v.x = r * Math.cos(lat) * Math.sin(lon);
                v.y = r * Math.sin(lat);
                v.z = r * Math.cos(lat) * Math.cos(lon);
                
                return v;
            };
        }());

        var _sphereVectorToCoord = (function (){

            var vectorForward = new THREE.Vector3(0, 0, 1);
            var vectorXZ = new THREE.Vector3();
            var lonlat = new THREE.Vector2();

            return function (v, r){

                r = r !== undefined ? v.length() : this.radius;
                
                var lon = Math.acos(vectorXZ.set(v.x, 0, v.z).normalize().dot(vectorForward)) * 180 / Math.PI;
                var lat = Math.asin(v.y / r) * 180 / Math.PI;
                
                lon = v.x >= 0 ? lon : -lon;
                
                return lonlat.set(lon, lat);
            };
        }());

        var _getTargetY = function (positionLenSq){

            //var percent = Math.pow(1 - THREE.Math.smoothstep(positionLenSq, Math.pow(_this.minRangeDistance, 2), Math.pow(_this.maxRangeDistance, 2)), 10.0);
            var percent = Math.pow( 1 - ( positionLenSq - Math.pow(_this.minRangeDistance, 2) ) / ( Math.pow(_this.maxRangeDistance, 2) - Math.pow(_this.minRangeDistance, 2)), 10);
            ( percent < 0 ) && ( percent = 0 );

            var targetY = percent * ( _this.targetYDistanceRange[1] - _this.targetYDistanceRange[0] ) + _this.targetYDistanceRange[0];

            return targetY;
        }

        var _zoomCamera = (function (){

            var isInit = true;
            var pos = new THREE.Vector3();

            return function (){

                var factor = 1.0 + ( _zoomEnd - _zoomStart ) * _this.zoomSpeed;

                if ( ( factor !== 1.0 && factor > 0.0 ) || isInit ) {

                    isInit = false;

                    pos.copy(_this.position);
                    pos.multiplyScalar( factor );
                    var posLenSq = _this.getDistanceSq(pos);

                    if ( _this.staticMoving ) {

                        _zoomStart = _zoomEnd;

                    } else {

                        _zoomStart += ( _zoomEnd - _zoomStart ) * _this.dynamicDampingFactor;
                    }

                    if ( posLenSq > _this.maxDistance * _this.maxDistance ) {

                        pos.setLength( _this.maxDistance );

                    }else if ( posLenSq < _this.minDistance * _this.minDistance ) {

                        pos.setLength( _this.minDistance );
                    }

                    _this.position.copy(pos);

                }

                _this.target.y = _getTargetY(_this.getDistanceSq());

            }
        }());

        var _rotateCamera = (function (){

            var factor,
                xAxis = new THREE.Vector3(),
                yAxis = new THREE.Vector3(),
                position = new THREE.Vector3(),
                positionNormalize = new THREE.Vector3(),
                moveDirection = new THREE.Vector2(),
                quaternionX = new THREE.Quaternion(),
                quaternionY = new THREE.Quaternion();

            return function (){

                position.copy(_this.position);
                yAxis.copy(_this.axis);
                xAxis.crossVectors(position, yAxis).normalize();
                moveDirection.subVectors( _mousePreventPosition, _mouseCurrentPosition);

                factor = 1.0 + moveDirection.lengthSq() * _this.rotateSpeed;

                if ( factor !== 1.0 && factor > 0.0 ) {

                    quaternionX.setFromAxisAngle( xAxis, moveDirection.y * factor );
                    quaternionY.setFromAxisAngle( yAxis, moveDirection.x * factor );

                    position.applyQuaternion( quaternionX );

                    if (Math.abs(positionNormalize.copy(position).normalize().dot(yAxis)) > 0.99){

                        position.copy(_this.position);
                    }

                    position.applyQuaternion( quaternionY );

                    if ( _this.staticMoving ) {

                        _mouseCurrentPosition.copy(_mousePreventPosition);
                    }else{

                        _mouseCurrentPosition.addVectors(_mouseCurrentPosition, moveDirection.multiplyScalar( _this.dynamicDampingFactor ));
                    }
                    _this.position.copy(position);
                }
            }
        }());
    
        //public
        this.setOptions = function (){

            for (var key in defaultOptions){

                _this[key] = options[key] !== undefined? options[key]: defaultOptions[key];
            }

            _this.position = _this.camera.position.clone();
            _this.up = _this.camera.up.clone();
            _this.minRangeDistance = _this.minDistance * ( 1 - _this.targetYRaitoRange[0] ) + _this.maxDistance * _this.targetYRaitoRange[0];
            _this.maxRangeDistance = _this.minDistance * ( 1 - _this.targetYRaitoRange[1] ) + _this.maxDistance * _this.targetYRaitoRange[1];
        }

        this.handleResize = function() {

            if ( _this.domElement === document ) {

                _this.screen.left = 0;
                _this.screen.top = 0;
                _this.screen.width = window.innerWidth;
                _this.screen.height = window.innerHeight;

            } else {

                var box = _this.domElement.getBoundingClientRect();
                // adjustments come from similar code in the jquery offset() function
                var d = _this.domElement.ownerDocument.documentElement;
                _this.screen.left = box.left + window.pageXOffset - d.clientLeft;
                _this.screen.top = box.top + window.pageYOffset - d.clientTop;
                _this.screen.width = box.width;
                _this.screen.height = box.height;
            }
        }

        this.getDistanceSq = (function () {

            var vertex = new THREE.Vector3();

            return function(v){

                ( v == undefined ) && ( v = _this.position );

                vertex.copy(v);
                vertex.subVectors(vertex, _this.target);

                return vertex.lengthSq();
            }
        })();

        this.rotateToVector = (function (){

            var yNormal = new THREE.Vector3(0, 1, 0);
            var cross1 = new THREE.Vector3();
            var cross2 = new THREE.Vector3();
            var fromVector = new THREE.Vector3();
            var toVector = new THREE.Vector3();
            var toNormal = new THREE.Vector3();
            var fromRadius = 0;
            var toRadius = 0;
            var fromLonlat = new THREE.Vector2();
            var toLonlat = new THREE.Vector2();

            var projectVector = new THREE.Vector3();
            var rotateStep = 0.0001;

            var animateTween = new TWEEN.Tween()
                .easing(TWEEN.Easing.Quartic.InOut)//Exponential Bounce 、、Quartic.InOut
                .onUpdate(function () {
                    
                    _this.position.copy(_coordToSphereVector(this.lon, this.lat, this.radius));//.setLength(this.radius);
                }).stop();

            var chainTween = new TWEEN.Tween()
                .easing(TWEEN.Easing.Sinusoidal.InOut)//Exponential Bounce 、、Quartic.InOut
                .onUpdate(function () {
                    
                    _this.position.copy(_coordToSphereVector(this.lon, this.lat, this.radius));//.setLength(this.radius);
                }).stop();

            animateTween.chain(chainTween);


            var foo = function(v, during, distance, callback){

                during || ( during = 2 );
                distance || ( distance = 50 );

                fromVector.copy(_this.position);
                toVector.copy(v);
                toNormal.copy(toVector).normalize();

                cross1.crossVectors(toNormal, yNormal);
                cross2.crossVectors(yNormal, cross1);
                cross2.multiplyScalar(distance);

                toVector.addVectors(toVector, cross2);

                fromRadius = fromVector.length();
                toRadius = toVector.length();

                fromLonlat.copy( _sphereVectorToCoord(fromVector, fromRadius) );
                toLonlat.copy( _sphereVectorToCoord(toVector, toRadius) );

                chainTween.from({
                        lon: toLonlat.x, 
                        lat: toLonlat.y, 
                        radius: toRadius
                    })
                    .to({
                        lon: toLonlat.x, 
                        lat: toLonlat.y, 
                        radius: toRadius + 50
                    }, 1000);

                animateTween.from({
                        lon: fromLonlat.x, 
                        lat: fromLonlat.y, 
                        radius: fromRadius
                    })
                    .to({
                        lon: toLonlat.x, 
                        lat: toLonlat.y, 
                        radius: toRadius
                    }, during * 1000)
                    .onComplete(function (){

                        callback && callback();
                    })
                    .start();
                
            };

            return foo;
        }.bind(_this)());

        this.rotateToCoord = function (lon, lat, r, during){

            _this.rotateToVector( _coordToSphereVector(lon, lat, r), during );
        };

        //update
        this.update = function (){

            _this.camera.position.copy(this.position);
            _this.camera.lookAt(_this.target);
            _this.camera.up.copy(_this.up);

            if ( !_this.noZoom ) {

                _zoomCamera();
            }

            if ( !_this.noRotate ) {

                _rotateCamera();
            }
        }

        //events
        function mousewheel(event){

            var delta = 0;

            if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

                delta = event.wheelDelta / 40;

            } else if ( event.detail ) { // Firefox

                delta = - event.detail / 3;
            }

            _zoomStart += delta * 0.01;
        }

        function mousedown(event){

            //event.preventDefault();
            //event.stopPropagation();

            if (event.button == 0){

                _mouseCurrentPosition.copy(_getMouseOnCircle( event.pageX, event.pageY ));
                _mousePreventPosition.copy(_mouseCurrentPosition);

                window.addEventListener( 'mousemove', mousemove, false );
                window.addEventListener( 'mouseup', mouseup, false );
            }
        }

        function mousemove(event){

            //event.preventDefault();
            //event.stopPropagation();

            _mousePreventPosition.copy(_mouseCurrentPosition);
            _mouseCurrentPosition.copy(_getMouseOnCircle( event.pageX, event.pageY ));
        }

        function mouseup(event){

            //event.preventDefault();
            //event.stopPropagation();

            window.removeEventListener( 'mousemove', mousemove, false );
            window.removeEventListener( 'mouseup', mouseup, false );
        }

        window.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, true );
        window.addEventListener( 'mousedown', mousedown, true );
        window.addEventListener( 'mousewheel', mousewheel, true );
        window.addEventListener( 'DOMMouseScroll', mousewheel, true ); // firefox

        this.setOptions();
        this.handleResize();
    }


    BallController.prototype = Object.create( THREE.EventDispatcher.prototype );
    BallController.prototype.constructor =  BallController;

    return BallController;
});
