/*
 * @Author: your name
 * @Date: 2021-01-14 18:03:14
 * @LastEditTime: 2021-01-15 14:29:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \原生js插件\slideshow.js
 */
; (function ($) {
    $.extend({
        slideshow: function (id,options) {
            $slideshow = $(id)
            var id = $(id)

            //默认参数
            var settings = {
                arrow: true,//显示箭头
                indicator: true,//指示器
                speed: 1000,//运动速度
                interval: 1000,//停留间隔
                width:840,//轮播图宽度
                height:346//轮播图高度
            }
            //参数合并
            A.extend(settings, options)

            var $container = $('.container',id)
            var container = $container[0]//原生dom
            var realImgCount = container.children.length//原先图片的数量

            //设置轮播图宽高
            $slideshow.css({width:settings.width+"px",height:settings.height+'px'})


            //判断是否需要左右箭头和指示器，插入dom
            if (settings.arrow) {
                $slideshow.html(`<span class="left-arrow">&lt;</span>
                <span class="right-arrow">&gt;</span>`, true)


            }
            if (settings.indicator) {
                var str = `<div class="indicator">`
                //遍历生成对应数量指示器
                for(var i=0,len= realImgCount;i<len;i++){
                    str += i===0?`<div data-index=${i} class="current"></div>`:`<div data-index=${i}></div>`
                }
                str+=`</div>`
                $slideshow.html(str, true)

            }

            var $left_arrow = $(".left-arrow",id),//左箭头
                $right_arrow = $(".right-arrow",id),//右箭头
                $indicator = $('.indicator',id),//指示器
                lock = false,//锁，防止频繁点击
                indicatorIdx = 0;//指示器索引
                lastIdcIdx = 0;//上一个指示器索引
            
            //如果左右箭头存在，就监听轮播图箭头点击
            if(settings.arrow){
                $left_arrow.on('click', function () {
                    if (lock) {
                        return;
                    }
                    lock = true
                    index--
                    //边界检测
                    if (index < 0) {
                        index = imgsCount - 3
                        left = -(imgsCount - 2) * slideshowW + 'px'
                        $container.css({ left: left })
                    }
    
                    left = -index * slideshowW + 'px'
    
                    $container.$animate({ left: left }, settings.speed, function () {
                        lock = false
                    })
    
                    //指示器联动
                    //记录上个选中得指示器
                    lastIdcIdx = indicatorIdx;
                    indicatorIdx--;
                    indicatorAnimate()
                })
                
                //监听轮播图右箭头点击
                $right_arrow.on('click', function () {
                    if (lock) {
                        return;
                    }
                    lock = true
                    index++
                    if (index > imgsCount - 1) {
                        index = 2
                        left = -slideshowW + 'px'
                        $container.css({ left: left })
                    }
                    left = -index * slideshowW + 'px'
                    $container.$animate({ left: left }, settings.speed, function () {
                        lock = false
                    })
    
                    //指示器联动
                    //记录上个选中得指示器
                    lastIdcIdx = indicatorIdx;
                    indicatorIdx++;
                    indicatorAnimate()
                })
            }

            //容器的宽度
            var slideshowW = parseFloat($slideshow.css('width'))

            //复制最后一张图插入到第一张图前面
            //复制第一张图插入到最后一张图后面
            var $container = $('.container',id)//由于是以innerhtml插入得dom，需要重新获取
            var container = $container[0]//原生dom
            var copyLastImg = container.lastElementChild.cloneNode(true)
            var copyFirstImg = container.firstElementChild.cloneNode(true)
            container.insertBefore(copyLastImg, container.firstElementChild)
            container.appendChild(copyFirstImg)

            //重新设置container宽度和,显示第一张图
            var imgsCount = container.children.length
            var containerW = imgsCount * slideshowW
            $container.css({ width: containerW + 'px', left: -slideshowW + 'px' })
            for(var i=0;i<imgsCount;i++){//设置每个图片容器的宽高
                $(container.children[i]).css({width:settings.width+"px",height:settings.height+'px'})
            }


            var index = 1,//指示当前显示图片索引
                timer = null;//轮播定时器
            left = index * slideshowW;//定位的left值

            //自动轮播
            autoPlay()
            //开启定时器轮播
            function autoPlay() {
                timer = setInterval(function () {
                    index++;

                    //边界检测
                    if (index > imgsCount - 1) {
                        index = 2
                        left = -slideshowW + 'px'
                        $container.css('left', left)
                    }

                    left = -index * slideshowW + 'px'
                    //平移动画
                    $container.$animate({ left: left },settings.speed)

                    //指示器联动
                    //记录上个选中得指示器
                    lastIdcIdx = indicatorIdx;
                    indicatorIdx++;
                    indicatorAnimate()
                }, settings.interval+settings.speed)
            }

            //指示器联动动画
            function indicatorAnimate() {
                //如果显示指示器
                if (settings.indicator) {
                    
                    //边界检测
                    if (indicatorIdx >= imgsCount - 2) {
                        indicatorIdx = 0
                    } else if (indicatorIdx < 0) {
                        indicatorIdx = imgsCount - 3
                    }

                    //指示器联动
                    $indicator[0].children[lastIdcIdx].className = ''
                    $indicator[0].children[indicatorIdx].className = 'current'

                    
                }
            }
            //如果存在指示器，注册点击事件
            if(settings.indicator){
                $indicator.on('click',function(e){
                    var target = e.target||e.srcElement
                    //如果没有点击到指示器，则返回
                    if(target.dataset['index'] === undefined) return;
                    
                    lastIdcIdx = indicatorIdx

                    indicatorIdx = parseInt(target.dataset['index'])

                    // 边界判断返回
                    if((indicatorIdx === index-1)||(index===0&&indicatorIdx===realImgCount-1)||(index===imgsCount-1&&indicatorIdx===0)) return;
                    
                    
                    index = indicatorIdx+1;
                    left = -index*slideshowW+'px'
                    $container.$animate({left:left})

                    //指示器联动
                    $indicator[0].children[lastIdcIdx].className = ''
                    $indicator[0].children[indicatorIdx].className = 'current'
                    
                })
            }
            

            //监听slideshow鼠标进入
            $slideshow.on('mouseover', function () {
                clearInterval(timer)
            })
            //监听slideshow鼠标移出
            $slideshow.on('mouseout', function () {
                autoPlay()
            })
        }
    })
})(A);
