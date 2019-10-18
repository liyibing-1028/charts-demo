/*
 *===========================================================================================
 *
 * 球体控制器：BallController
 *
 *===========================================================================================
 */

function (THREE, TWEEN){

    var defaultOptions = {

        camera: new THREE.Camera(),
        domElement: document,
        axis: new THREE.Vector3(0, 1, 0),
        target: new THREE.Vector3(0, 0, 0),
        rotateSpeed: 0.05,
        zoomSpeed: 0.2,
        noRotate: false,
        noZoom: false,
        staticMoving: false,
        dynamicDampingFactor: 0.1,
        minDistance: 1,
        maxDistance: Infinity,
        upRange: [0, 1],
        upRangeAngle: 0.0,
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
        // 当前位置转为球上的点
        var _coordToSphereVector = (function (){

            var v = new THREE.Vector3();

            return function (lon, lat, r){

                r = r !== undefined ? r : 200,
                // 经纬度转为弧度制
                lon *= Math.PI / 180,
                lat *= Math.PI / 180;
                // 换算出球上地理位置的点
                v.x = r * Math.cos(lat) * Math.sin(lon);
                v.y = r * Math.sin(lat);
                v.z = r * Math.cos(lat) * Math.cos(lon);
                
                return v;
            };
        }());
        // 根据球上某点的坐标和球的半径算出该点的经纬度
        var _sphereVectorToCoord = (function (){

            var vectorForward = new THREE.Vector3(0, 0, 1);
            var vectorXZ = new THREE.Vector3();
            var lonlat = new THREE.Vector2();

            return function (v, r){

                r = r !== undefined ? r : this.radius;
                // dot --- 计算这个向量与这个点得点积
                var lon = Math.acos(vectorXZ.set(v.x, 0, v.z).normalize().dot(vectorForward)) * 180 / Math.PI;
                var lat = Math.asin(v.y / r) * 180 / Math.PI;
                
                lon = v.x >= 0 ? lon : -lon;
                
                return lonlat.set(lon, lat);
            };
        }());
        // 缩放相机
        var _zoomCamera = (function (){

            var isInit = true;

            return function (){
                // 设置缩放银子
                var factor = 1.0 + ( _zoomEnd - _zoomStart ) * _this.zoomSpeed;

                if ( ( factor !== 1.0 && factor > 0.0 ) || isInit ) {

                    isInit = false;

                    _this.position.multiplyScalar( factor );

                    if ( _this.staticMoving ) {

                        _zoomStart = _zoomEnd;

                    } else {

                        _zoomStart += ( _zoomEnd - _zoomStart ) * _this.dynamicDampingFactor;
                    }
                }

                var positionLenSq = _this.position.lengthSq();

                if ( positionLenSq > _this.maxDistance * _this.maxDistance ) {

                    _this.position.setLength( _this.maxDistance );
                    positionLenSq = _this.maxDistance * _this.maxDistance;

                }else if ( positionLenSq < _this.minDistance * _this.minDistance ) {

                    _this.position.setLength( _this.minDistance );
                    positionLenSq = _this.minDistance * _this.minDistance;
                }

                //var percent = Math.pow(1 - THREE.Math.smoothstep(positionLenSq, Math.pow(_this.minRangeDistance, 2), Math.pow(_this.maxRangeDistance, 2)), 10.0);
                var percent = Math.pow( 1 - ( positionLenSq - Math.pow(_this.minRangeDistance, 2) ) / ( Math.pow(_this.maxRangeDistance, 2) - Math.pow(_this.minRangeDistance, 2)), 5);

                var angle = percent * _this.upRangeAngle;

                _this.target.y = Math.sqrt(Math.tan(Math.PI / 180 * angle) * positionLenSq);

                //isNaN(_this.target.y) && ( _this.target.y = 0 );
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
            _this.minRangeDistance = _this.minDistance * ( 1 - _this.upRange[0] ) + _this.maxDistance * _this.upRange[0];
            _this.maxRangeDistance = _this.minDistance * ( 1 - _this.upRange[1] ) + _this.maxDistance * _this.upRange[1];
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

        this.getDistances = function () {

            return _this.position.lengthSq();
        }

        this.rotateToVector = (function (){

            var fromVector = new THREE.Vector3();
            var toVector = new THREE.Vector3();
            var fromRadius = 0;
            var toRadius = 0;
            //var elapsedTime = 0;
            //var animationTime = 0;
            var animateTween = new TWEEN.Tween()
                .easing(TWEEN.Easing.Quartic.InOut)//Exponential Bounce 、、Quartic.InOut
                .onUpdate(function () {
                    
                    _this.position.set(this.x, this.y, this.z).setLength(this.radius);
                }).stop();


            var foo = function(v, during, callback){

                animateTween.stop();

                during || ( during = 1 );
                fromVector.copy(_this.position);
                toVector.copy(v); 
                fromRadius = fromVector.length();
                toRadius = v.length();
                
                /*
                foo.elapsedTime || ( foo.elapsedTime = 0 );

                if (foo.elapsedTime <= during){

                    animationTime = Math.min( foo.elapsedTime / during, 1 );
                    foo.elapsedTime += _clock.getDelta();

                    fromVector.lerp(toVector, foo.elapsedTime);
                    fromRadius += (toRadius - fromRadius) * foo.elapsedTime;
                    _this.position.copy(fromVector.setLength(fromRadius));

                    requestAnimationFrame(foo.bind(_this, v, during));
                }else{

                    foo.elapsedTime = 0;
                }
                */

                animateTween.from({
                        x: fromVector.x, 
                        y: fromVector.y, 
                        z: fromVector.z, 
                        radius: fromRadius
                    })
                    .to({
                        x: toVector.x, 
                        y: toVector.y, 
                        z: toVector.z, 
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

            event.preventDefault();
            event.stopPropagation();

            if (event.button == 0){

                _mouseCurrentPosition.copy(_getMouseOnCircle( event.pageX, event.pageY ));
                _mousePreventPosition.copy(_mouseCurrentPosition);

                _this.domElement.addEventListener( 'mousemove', mousemove, false );
                _this.domElement.addEventListener( 'mouseup', mouseup, false );
            }

            //console.info(_this.position)
        }

        function mousemove(event){

            event.preventDefault();
            event.stopPropagation();

            _mousePreventPosition.copy(_mouseCurrentPosition);
            _mouseCurrentPosition.copy(_getMouseOnCircle( event.pageX, event.pageY ));
        }

        function mouseup(event){

            event.preventDefault();
            event.stopPropagation();

            _this.domElement.removeEventListener( 'mousemove', mousemove, false );
            _this.domElement.removeEventListener( 'mouseup', mouseup, false );
        }

        this.setOptions();
        this.handleResize();

        window.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, true );
        _this.domElement.addEventListener( 'mousedown', mousedown, true );
        _this.domElement.addEventListener( 'mousewheel', mousewheel, true );
        _this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, true ); // firefox
    }


    BallController.prototype = Object.create( THREE.EventDispatcher.prototype );
    BallController.prototype.constructor = BallController;

    return BallController;
}