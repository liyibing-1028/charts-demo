认识THREE.JS

[THREE.js官网](https://threejs.org/)

![Mou icon](https://codropspz-tympanus.netdna-ssl.com/codrops/wp-content/uploads/2016/04/Animated3DScene_three-components.png)
**上面这张图已经将three的大部分主题内容呈现了出来,那么three.js到底是个什么东西?**
*接下来,切入正题~~~*
###### 一. 认识THREE.js的第一步
1. 在了解three之前,我们必须来了解了解他的底层实现 --- webGL
- WebGL是基于OpenGL ES2.0的web标准(*有兴趣的可以自行查看,我的理解就是一个标准*),可以通过HTML5, canvas元素作为DOM接口访问
- 不了解OpenGL标准也没关系, 正如three.js不需要你了解OpenGL或者WebGL一样,只知道webGL是一个底层的标准就可以了
2. 那three.js是什么?
- 一个javascript的开源三维引擎
- 主流的3D绘图的js引擎
- 底层依靠webGL网页3D绘图标准
- 和webGL的关系就像Jq简化啦htmlDom操作一样, three.js可以简化webGL编程
3. three.js究竟能够干什么?
- three.js封装啦底层的图形接口,使得程序员在无需熟悉繁冗的图形学知识的情况下就能用简单的代码实现三维场景进行一个渲染
- 强大的灵活性,几乎不会有webGL实现three.js实现不了的情况,就算有你也可以使用webgl去实现而不会和之前的three代码产生冲突
- 除了webGL之外,three.js还提供了基于canvas, svg标签的渲染器,但是通常还是webGL能够实现的三维的场景比较真实,还原度比较高,效果比较好
###### 二. THREE的Hello World
1. 开发环境
- three.js是javascript的库,所以可以像平常开发时,直接引入就可使用
- 但是three.js在使用皮肤,网格,文件下载等比较复杂的函数调用时就需要服务环境的搭载
- 所以最好就在开发文件下使用http-server开一个本地服务,这样加载本地图片作为皮肤,加载其他辅助类库文件就不会丢失
2. three.js下载
- 在https://github.com/mrdoob/three.js/tree/master/build可以看到three.js和three.min.js两个文件,都可使用,自己拿捏
- 可以直接在srcipt里面引入
3. 使用three.js编写hello world
```js
    //创建渲染器，添加到dom当中, antialias（是否启用抗锯齿）  
    var renderer = new THREE.WebGLRenderer({antialias: true});  
    //设置渲染器的尺寸  
    renderer.setSize(window.innerWidth, window.innerHeight);  
    //将渲染器放置到页面当中  
    document.body.appendChild(renderer.domElement); 
    //创建场景  
    var scene = new THREE.Scene();  
  
    //创建相机，设置位置  
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);  
    //设置相机的位置  
    camera.position.set(0, 0, 3);  
    //创建一个平行光光源照射到物体上  
	var light = new THREE.DirectionalLight(0xffffff, 1.5);  
	//设置平型光照射方向，照射方向为设置的点照射到原点  
	light.position.set(0, 0, 1);  
	//将灯光放到场景当中  
	scene.add(light);
        var material = new THREE.MeshPhongMaterial({color: red}
        //创建一个立方体的几何体  
	var geometry = new THREE.CubeGeometry(1, 1, 1);  
	//将集合体和材质放到一个网格中  
	var cube = new THREE.Mesh(geometry, material); 
	//将立方体网格添加到场景中  
        scene.add(cube); 
        //声明一个判断是否旋转的变量  
	var rotationBool = true;    
        (function animate() {  
            renderer.render(scene, camera);  
            if (rotationBool) {  
                cube.rotation.x += 0.02;  
                cube.rotation.y += 0.02;  
            }  
            requestAnimationFrame(animate);  
        })();  
	  
	document.body.onclick = function () {  
	    rotationBool = !rotationBool;  
	}
```
4. 以上代码会产生什么样的效果?
###### 三. THREE.js的主要成员
1. scene -- 场景(你可以将他想像成一个容器,一个空间,一块区域,一间房子)
- scene的用处是什么那?空间,区域,房子是用来做什么 --- 盛放,容纳,所以scene就是容纳你所要呈现的三维图的容器
-  在three.js中所加入的所有物体都是加到scene中的, 一般scene没有很复杂的操作,就在开始时实例化就可以啦
- 语法 -- var scene = new THREE.Scene();
2. render -- 渲染器(可以理解为播放器,电视机,屏幕)
- 渲染器,顾名思义就是将你添加到scene里面的所有物体渲染出来的机器,既然是机器,那就存在分类

- WebGLRenderer() -- webGL渲染器: 就是使用webGL来渲染你所添加的内容
    1. 支持参数的设置parameter(对象);

    2. canvas: 绘制输出的画布,如果这里没有传参,默认将创建一个新的画布元素;

    3. context: 用于呈现输出画布的上下文;

    4. precision: 着色器的精度;可以选值为'highp', 'mediump', 'lowp',三个值;

    5. alpha: 画布是否包含透明缓冲区,默认为false;

    6. premultipliedAlpha: 渲染器是否假设透明度已经预先叠乘啦;

    7. antialias: 是否执行反锯齿;

    8. stencil: 绘图缓冲区是否具有只少具有8位的钢网缓冲区;

    9. preserveDrawingBuffer : 是否保存缓冲区,直到手动清除;

    10. depth: 绘图缓冲区是否至少具有至少16位的深度缓冲区;

        其他的参数具体看https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer

- CSS2DRenderer() -- CSS2DRenderer是 CSS3DRenderer的简化版本这个渲染器的作用是将基于html标签与3D对象结合

    1. 例子: https://threejs.org/examples/#css2d_label;
    2. 方法: 
       1. getSize() -- 返回一个包含这个渲染器的宽度和高度的对象;
       2. render(scene, camera) -- 渲染参数里面的scene用参数camera;
       3. setSize(width, height) -- 重新设置宽度和高度.

- CSS3DRenderer()  -- 可以运用css3的转换样式,对Dom元素进行必要的3D转换

  1. 例子: https://threejs.org/examples/#css3d_molecules;
  2. 方法: 同上.

- SVGRenderer() -- 顾名思义,可以运用svg渲染;

      1. 优点: (1)可以使用svg般的矢量特点;(2)用css样式控制(3)有良好的访问性;
      2. 缺点: (1)不支持shader自定义(2)不支持贴图(3)不支持阴影设置;
      3. 方法:
            1. clear() -- 告诉浏览器删除所有用svgRenderer渲染的物体;
            2. render() -- 同上
            3. setClearColor(color, alpha) -- 设置清除的颜色和清除的透明度;
            4. setPrecision(precision) -- 设置被用来创造路径的数据的精度;
            5. setQuality() -- 设置渲染的质量,可能值有高有低;
            6. setSize() -- 同上.

3. camera 照相机 -- 定义了三维空间到二维屏幕的投影方式,用'照相机'这一生活化的物体来理解投影的这一概念;针对投影方式的不同,照相机又分为正交投影照相机与透视投影照相机

      1. 正交投影Orthography
      
         THREE.OrthographicCamera(left, right, top, bottom, near, far)
      
         这六个参数分别代表正交投影照相机拍摄的六个位置,六个面形成了一个长方体,成为视景体,只有在体内的物体才能显示在屏幕上;
      
      2. 透视投影PerspectiveCamera
      
         THREE.PerspectiveCamera(fov, aspect, near, far)
      
         fov是视景体的竖直方向上的张角,(角度制而非是弧度制)
      
         aspect 等于 width(相机水平宽) / height(相机垂直高)
      
         near 和 far 分别是相机到视景体的最近和最远的距离. 

###### 四. THREE.js的其他成员
- 几何形状
    1. 立方体
       THREE.CubeGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
       wdith x方向上的长度
       height y方向上的长度
       depth z方向上的长度
       后面的三个参数: 分别为三个方向上的分段数 缺省值为1
    2. 平面
       THREE.PlaneGeometry(width, height, widthSegments, heightSegments)
       wdith x方向长度
       height y方向上的长度
       后面的参数: 两个方向的分段数(1)
    3. 球体
       THREE.SphereGeometry(radius, segmentsWidth, phiStart, phiLength, thetaStart, thetaLength)
       radius半径
       segmentsWidth: 经度上的切片数
       segmentsHeight 纬度上的切片数
       phiStart: 经度开始的弧度
       phiLength: 表示经度跨过得弧度
       thetaStart: 表示纬度开始的弧度
       thetaLength:表示纬度跨过的弧度 
    4. 圆形
       THREE.CircleGeometry(radius, segments, thetaStart, thetaLength)
       参数介绍同上
    5. 圆柱体
       THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
       radiusTop: 顶面的半径
       radiusBottom: 地面的半径
       hegiht: 圆柱体的高度
       radiusSegments: 横向分段数
       heightSegments: 纵向分段数
       openEnded: 表示是否没有地面和顶面, 默认为false(表示有顶面和地面)
    6. 正四面体, 正八面体, 正二十面体
       THREE.TetrahedronGeometry(radius, detail)
       THREE.OctahedronGeometry(radius, detail)
       THREE.IcosahedronGeometry(radius, detail)
       radius: 半径
       detail: 细节层次
    7. 圆环面(甜甜圈的形状)
       THREE.TorusGeometry(radius, tube, radiusSegments, tubularSegments, arc)
       radius: 圆环的半径
       tube: 管道半径
       radiusSegments: 半径分段数
       tubularSegments: 管道分段数
       arc: 圆环面的弧度(默认为Math.PI * 2) 一圈
    8. 圆环结(打了结的甜甜圈)
       THREE.TorusKnotGeometry(radius, tube, radiusSegments, tubularSebmets, p, q, heightScale)
       前四个参数同上
       p, q是控制其样式的参数
       hegihtScale是在z轴方向上的缩放

- 文字形状
    1. THREE.TextGeometry(text, parameters)
       text: 文字字符串
       parameters: 一个对象,包含对文字样式的参数设置
       size: 字号大小
       height: 文字的厚度
       curveSegments: 弧线分段数, 使得文字的曲线更加光滑
       font: 字体
       weight: 值为'normal'或者'bold', 表示加粗
       style: 值为'normal'或者'italics', 表示是否斜体
       bevelenabled: 是否使用倒角, 意为在边缘处斜切
       bevelThickness: 倒角厚度;
       bevelSize: 倒角宽度

- 自定义形状
    1. THREE.Geometry()

       ```js
       // 初始化几何形状
       var geometry = new THREE.Geometry();
       // 设置顶点位置
       // 顶部4顶点
       geometry.vertices.push(new THREE.Vector3(-1, 2, -1));
       geometry.vertices.push(new THREE.Vector3(1, 2, -1));
       geometry.vertices.push(new THREE.Vector3(1, 2, 1));
       geometry.vertices.push(new THREE.Vector3(-1, 2, 1));
       // 底部4顶点
       geometry.vertices.push(new THREE.Vector3(-2, 0, -2));
       geometry.vertices.push(new THREE.Vector3(2, 0, -2));
       geometry.vertices.push(new THREE.Vector3(2, 0, 2));
       geometry.vertices.push(new THREE.Vector3(-2, 0, 2));
       
       // 设置顶点连接情况
       // 顶面
       geometry.faces.push(new THREE.Face3(0, 1, 2));
       // 底面
       geometry.faces.push(new THREE.Face3(4, 5, 6));
       // 四个侧面
       geometry.faces.push(new THREE.Face3(0, 1, 5));
       geometry.faces.push(new THREE.Face3(1, 2, 6));
       geometry.faces.push(new THREE.Face3(2, 3, 7));
       geometry.faces.push(new THREE.Face3(3, 0, 4));
       ```

       注意: 

       1. new THREE.Vector3(-1, 2, 1)创建的是一个矢量,作为定点位置追加到geometry.vertices数组中
       2. new THREE.Face3(0, 1, 2)创建一个面,三点连一个面,要放在geometry.faces数组中

- 材质

    1. 材质是独立于物体定点信息的之外的与渲染效果相关的属性.那材质能干什么?

           1. 改变物体的颜色;
           2. 纹理贴图;
           3. 光照模式.

    2. 基本材质

           THREE.MeshBasicMaterial(opt)
            
           opt为属性的值的对象

         常用的属性:

           visible: 是否可见 ,默认为true
            
           side: 渲染面片正面或者是反面, 默认为正面THREE.FrontSide,可设置为反面的THREE.BackSide或者双面THREE.DoubleSide()
            
           wireframe: 是否渲染线而非面, 默认为false
            
           color: 十六进制RGB颜色, 
            
           map: 使用纹理贴图

       对于基本材质,即使改变场景中的光源,材质也不会因为光源的改变而变化.

    3. Lambert材质

             Lambert材质(MeshLambertMaterial) 是符合lambert光照模型的材质.Lambert光照模式的主要特点是只考虑漫反射而不是考虑镜面反射的效果,因而对于金属,镜子等需要镜面反射效果的物体就不适应,对于其他物体的漫反射效果都是适用的
                
             1. new THREE.MeshLambertMaterial({})
             2. color是用来表现材质对散射光的反射能力，也是最常用来设置材质颜色的属性。除此之外，还可以用ambient和emissive控制材质的颜色
             3. ambient表示对环境光的反射能力，只有当设置了AmbientLight后，该值才是有效的，材质对环境光的反射能力与环境光强相乘后得到材质实际表现的颜色。
             4. emissive是材质的自发光颜色，可以用来表现光源的颜色.

    4. Phong材质

             Phong材质(MeshPhongMaterial)是符合Phong光照模型的材质.和lambert不同的是,Phong模型考虑了镜面反射的效果,对于金属,镜面的效果的表现尤为合适
                
             new THREE.MeshPhongMaterial({})

    5. 法向材质

             法向材质可以将材质的颜色设置为其法向量的方向,有时候对于调试很有帮助
                
             new THREE.MeshNormalMaterial()
                
             材质的颜色与照相机与该物体的角度相关

    6. 材质的纹理贴图

             之前使用的材质都是单一颜色的,那怎么用图像作为材质那?
                
             var texture = new THREE.ImageUtils.loadTexture('路径')
                
             然后将材质的map设置为
                
             var material = new THREE.MeshLambertMaterial({
                
               map: texture
                
             })



- 网格

  几何 + 材质 = 物体

  物体有哪几种类型:

  网格 线段 骨骼 粒子系统 等

  几何确定了物体的顶点信息, 位置

  材质确定了物体的颜色, 纹理等

  1. 创建网格

     new Mesh(geometry, material)

  2. 修改属性

     创建网格之后也可以修改网格的材质

     mesh.material = ...

     场景中显示最后修改后材质的网格

  3. 位置, 缩放, 旋转

     这三个属性是物体常用属性,在THREE里面顶层对象都是THREE.Object3D所以mesh也包含这三个属性,并且可以改变,进行动画的设计

-  光与影

  图像渲染的丰富效果很大程度上也要归功于光与影的利用。真实世界中的光影效果非常复杂，但是其本质——光的传播原理却又是非常单一的，这便是自然界繁简相成的又一例证。为了使计算机模拟丰富的光照效果，人们提出了几种不同的光源模型（环境光、平行光、点光源、聚光灯等），在不同场合下组合利用，将能达到很好的光照效果.

  1. 环境光

     环境光是指场景整体的光照效果,是由于场景内若干光源的多次反射形成的亮度一致的效果,通常用来为整个场景来提供一个基础的亮度.因此环境光没有明确的光源位置,在各处形成的光的强度也是一样的.

     new THREE.AmbientLight(0x000000) ---> 直接填颜色值就好

     如果场景中没有添加物体的话,只添加了环境光,那么还是一片黑色.

     注意: 环境光通常设置成白色或者是灰色 ---- 为什么?

     因为不透明物体的颜色其实是其反射光的颜色,而材质的ambient属性表示的是物体反射环境光的能力.比如物体的材质ambient属性是红色 , 而环境光的颜色也是红色,那么此时的红色的通道就是0,所以该物体不会反射任何颜色,渲染为黑色.

  2. 点光源

     点光源是不计光源的大小,可以看做是一个点发出的光源,点光源照到不同物体表面的亮度是线性递减的,因此,离点光源越远的物体会显得越暗.

     var light = new THREE.PointLight(hex, intensity, distance)

     颜色, 光亮强度(1), 最远照射距离(0) --- 参数

     点光源是有位置朝向的,在创建完光源实例后要进行位置设置

     light.position.set(0, 0, 0)

     注意: 点光源在每个物体的三角平面的亮度是不一样的,要进行插值运算,但是这是three内部引擎该做的工作.

  3. 平行光

     举个栗子: 太阳光就是最常见的平行光

     这是因为相对于地球上的物体的尺度而言,太阳离我们的距离够远.对于任意平行的平面,平行光照射的亮度都是相同的,而与平面所在的位置无关.

     var light = new THREE.DirectionLight(hex, intensity)

     颜色值, 光的强度(1)

     light.position.set(2, 5, 6)

     注意: 此时设置的光源位置并不意味着所有光源都是从(2, 5, 6)发出的(如果是的话,那就和点光源没什么区别啦),而是意味着平行光将以矢量(-2, -5, -6)的方向照射到所有的平面.因此平面的亮度与平面的位置无关,而只与平面的法向量相关.只要平面是平行的,那么得到的光照也是相同的.

  4. 聚灯光

     聚灯光其实是一种特殊的点光源,它能够朝着一个方向上投射灯光线.聚灯光投射出的类似圆锥形的光线,这与我们现实中看到的聚光灯是一致的.

     var light = new THREE.SpotLight(hex, intensity, distance, angle, exponent)

     相比较点光源,多了angle,exponent两个参数;angle是聚灯光的张角(Math.PI / 3),最大值为Math.PI / 2,exponent是光强在偏离target的衰减指数(target需要在之后定义,缺省值为(0, 0, 0)), 缺省值为10.

     light.position.set(10, 10, 10)

     除了设置灯光的位置意外,还要设置其照向的目标点

     light.target.position.set(0, 0, 0)

     target也还可以设置为物体.




















​          