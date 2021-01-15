/*
 * @Descripttion: 
 * @version: 
 * @Author: Z
 * @Date: 2021-01-12 21:40:10
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-01-15 02:37:26
 */


;(function(window){
    
    /**
     * @name: 框架单体对象A,类似jQuery
     * @param {*} selector 选择器或者页面加载回调
     * @param {*} context 查找元素上下文
     * @return {*} 
     */
    var A =function(selector,context){
        //如果selector为方法则为窗口添加页面加载完成事件监听
        if(typeof selector === 'function'){
            A(window).on('load',selector)
        }else{
            //创建A对象
            return new A.fn.init(selector,context);
        }
    }
    
    //原型方法
    A.fn = A.prototype = {
        //强化构造函数
        constructor:A,
        init:function(selector,context){
            //selector选择器为元素
            if(typeof selector === 'object'){
                this[0] = selector;
                this.length = 1;
                return this;
            }
            //获取到得元素得长度属性
            this.length = 0;
            // 矫正上下文
            context = document.getElementById(context)||document;
            //如果是id选择器
            if(~selector.indexOf('#')){
                this[0] = document.getElementById(selector.slice(1));
                this.length = 1;
                return this;
            //如果是类名选择器
            }else if(~selector.indexOf('.')){
                var doms =[],className = selector.slice(1)
                //支持通过类获取元素得方法
                if(context.getElementsByClassName){
                    doms = context.getElementsByClassName(className)
                }else{
                    doms = context.getElementsByTagName('*')
                }
                //设置获取到的元素
                for(var i=0,len = doms.length;i<len;i++){
                    //如果包含类名
                    if(doms[i].className&&!!~doms[i].className.indexOf(className)){
                        this[this.length] = doms[i]
                        // 矫正长度
                        this.length++
                    }
                }
            // 否则是元素名选择器
            }else{
                var doms = context.getElementsByTagName(selector),i =0,len = doms.length;
                for(;i<len;i++){
                    this[i] = doms[i]
                }
                this.length = len;
            }
            // 设置当前对象的选择上下文
            this.context = context;
            this.selector = selector;
            return this;
        },
        //元素长度
        length:0,
        // 增强数组
        push:[].push,
        splice:[].splice         
    }

    //设置构造函数原型
    A.fn.init.prototype = A.fn;

    /**
     * @name: 对象拓展
     * @param [0] 目标
     * @param [1,...] 拓展对象
     * @return 
     */
    A.extend = A.fn.extend = function(){
        var i = 1,
            len = arguments.length,
            target = arguments[0],
            j;
        //如果只有一个参数，则为当前对象拓展方法
        if(i === len){
            target = this;
            i--;
        }
        //遍历拓展对象
        for(;i<len;i++){
            //遍历拓展对象中的方法和属性，浅复制
            for(j in arguments[i]){
                target[j] = arguments[i][j]
            }
        }
        //返回目标对象
        return target;
    }

    //单体对象A方法拓展,相当于静态方法
    A.extend({
        /**
         * @name: 将命名转为驼峰式,如'test-demo'->'testDemo'
         * @param {*} str
         * @return {*}
         */
        camelCase:function(str){
            return str.replace(/\-(\w)/g,function(match,letter){
                return letter.toUpperCase();
            })
        },
        /**
         * @name: 去除字符串两端空白
         * @param {*} str
         * @return {*}
         */
        trim:function(str){
            return str.trim()
        },
        /**
         * @name: 创建一个元素并包装成A对象
         * @param {*} type 元素类型，如'div'
         * @param {*} attrObj 元素的属性对象
         * @return {*}
         */
        create:function(type,attrObj){
            var dom = document.createElement(type)
            return A(dom).attr(attrObj)
        },
        /**
         * @name: 格式化模板
         * @param {*} str 模板字符串
         * @param {*} data 渲染数据
         * 例如：'<div>{#value#}</div>'+{value:'test'}->'<div>test</div>'
         * @return {*}
         */
        formatString:function(str,data){
            var html = ''
            // 如果渲染数据是数组，则遍历数组并渲染
            if(data instanceof Array){
                for(var i=0,len = data.length;i<len;i++){
                    html+= arguments.callee(str,data[i])
                }
                return html;
            }else{
                return str.replace(/\{#(\w+)#\}/g,function(match,key){
                    return typeof data === 'string' ? data:(typeof data[key] === 'undefined'?'':data[key])
                })
            }
        }
    })

    // 事件绑定方法,第一次加载就判断出使用哪个方法
    var _on = (function(){
            // 标准浏览器
            if(document.addEventListener){
                return function(dom,type,fn,data){   
                    dom.addEventListener(type,function(e){
                        fn.call(dom,e,data)
                    },false)
                }
            // ie浏览器
            }else if(document.attachEvent){
                return function(dom,type,fn,data){
                    dom.attachEvent('on'+type,function(e){
                        fn.call(dom,e,data)
                    })
                }
                // 老版本浏览器
            }else{
                return function(dom,type,fn,data){
                    dom['on'+type] = function(e){
                        fn.call(dom,e,data)
                    }
                }
            }
    }()); 

    //事件移除方法,移除不成功，添加时用了封装导致处理函数不一致，TODO
    var _off = (function(){
        //标准浏览器
        if(document.removeEventListener){
            return function(dom,type,fn){
                dom.removeEventListener(type,fn,false)
            }
        //ie
        }else if(document.detachEvent){
            return function(dom,type,fn){
                dom.detachEvent('on'+type,fn)
            }
        //老版本浏览器
        }else{
            return function(dom,type,fn){
                dom['on'+type]=null;
            }
        }
    }());
    //给A实例对象添加原型方法
    A.fn.extend({
        //A实例对象里的所有dom元素添加事件
        on:function(type,fn,data){
            var i = this.length-1;
            for(;i>=0;i--){
                _on(this[i],type,fn,data)
            }
            return this
        },
        //A实例对象里的所有dom元素移除事件
        off:function(type,fn){
            var i = this.length-1;
            for(;i>=0;i--){
                _off(this[i],type,fn)
            }
            return this;
        },
        //设置或者获取元素样式
        css:function(){
            var arg = arguments,
                len = arguments.length;
            //如果无法获取到元素则返回
            if(this.length<1){
                
                return this;
            }
            //如果是一个参数
            if(len === 1){
                //参数是字符串，表明返回第一个元素的样式
                if(typeof arg[0] === 'string'){
                    var name = arg[0]
                    //ie浏览器
                    if(this[0].currentStyle){
                        return this[0].currentStyle[name]
                    }else{
                        return window.getComputedStyle(this[0],false)[name];
                    }
                //如果参数是对象，则是为获取到的所有元素设置样式
                }else if(typeof arg[0] === 'object'){
                    for(var key in arg[0]){
                        for(var j = this.length-1;j>=0;j--){
                            this[j].style[A.camelCase(key)] = arg[0][key]
                        }
                    }
                }
            //如果是两个参数
            }else if(len === 2){
                //为获取到的所有元素设置样式
                for(var i = this.length-1;i>=0;i--){
                    this[i].style[A.camelCase(arg[0])] = arg[1]
                }
            }
            return this
        },
        //设置或获取属性
        attr:function(){
            var arg = arguments,
                len = arg.length;
            //如果一个参数
            if(len === 1){
                //如果参数是字符串，返回第一个元素的属性
                if(typeof arg[0] === 'string'){
                    return this[0].getAttribute(arg[0])
                //如果参数是对象，则为所有元素设置属性
                }else if(typeof arg[0] === 'object'){
                    for(var i in arg[0]){
                        for(var j=this.length-1;j>=0;j--){
                            this[j].setAttribute(i,arg[0][i])
                        }
                    }
                }
            //如果是两个参数
            }else if(len===2){
                //为获取到的所有元素设置属性
                for(var i = this.length-1;i>=0;i--){
                    this[i].setAttribute(arg[0],arg[1])
                }
            }
            return this;
        },
        //获取或设置元素内容
        html:function(){
            var arg = arguments,
                len = arg.length;
            //如果没有参数，返回第一个元素内容
            if(len===0){
                return this[0].innerHTML;
            //如果一个参数，为所有元素设置相同的内容
            }else if(len===1){
                for(var i=this.length-1;i>=0;i--){
                    this[i].innerHTML = arg[0]
                }
            //如果两个元素，第二个元素是true，则为获取的所有元素添 追加 内容
            }else if(len===2){
                for(var i=this.length-1;i>=0;i--){
                    this[i].innerHTML +=arg[0]
                }
            }
            return this;
        },
        /**
         * @name: 判断类名存在
         * @param {*} val 类名
         * @return {*}
         */
        hasClass:function(val){
            //如果无法获取元素则返回
            if(!this[0])return;

            //去除首尾空白
            var value = A.trim(val)
            return this[0].className&&(!!~this[0].className.indexOf(value))
        },
        /**
         * @name: 添加类
         * @param {*} val 类名
         * @return {*}
         */
        addClass:function(val){
            var value = A.trim(val),
            str = '';
            //遍历所有获取到的元素
            for(var i=0,len = this.length;i<len;i++){
                str = this[i].className;
                //如果元素类名不包含类则为元素添加
                if(!~str.indexOf(value)){
                    this[i].className += ' ' + value
                }
            }
            return this;
        },
        /**
         * @name: 移除类
         * @param {*} val 类名
         * @return {*}
         */
        removeClass:function(val){
            var value = A.trim(val),
                classNameArr,
                result='';

            //遍历所有获取到的元素
            for(var i=0,len = this.length;i<len;i++){
                // 如果类名包含移除类
                if(this[i].className&&~this[i].className.indexOf(value)){
                    //以空格符切割字符串
                    classNameArr = this[i].className.split(' ')
                    for(var j=classNameArr.length-1;j>=0;j--){
                        classNameArr[j] = A.trim(classNameArr[j])
                        //类名存在且不等于要移除的类，则保留
                        result += classNameArr[j]&&classNameArr[j]!=value?' '+classNameArr[j]:''
                    }
                    this[i].className = result;
                }
            }
            return this;
        },
        /**
         * @name: 插入元素
         * @param {*} parent 父元素
         * @return {*}
         */
        appendTo:function(parent){
            var doms = A(parent);
            if(doms.length){
                //遍历父元素
                for(var i=this.length-1;i>=0;i--){//指向第一个父元素插入子元素
                    doms[0].appendChild(this[i])
                }
            }
        }
    })

    //运动框架单体对象
    var Tween = {
        //计数器句柄
        timer:0,
        //运动成员队列
        queen:[],
        //运动间隔
        interval:16,
        //缓冲函数
        easing:{
            //默认运动缓存算法，匀速运动,0<=time<=duration,startValue<=返回值<=startValue+changeValue
            def:function(time,startValue,changeValue,duration){
                return changeValue * time /duration + startValue
            },
            //缓慢结束
            easeOutQuart:function(time,startValue,changeValue,duration){
                return -changeValue*((time=time/duration-1)*time*time*time-1)+startValue;
            }
        },
        /**
         * @name: 添加运动成员
         * @param {*} instance 运动成员
         * @return {*}
         */
        add:function(instance){
            //添加成员
            this.queen.push(instance);
            //运行框架
            this.run()
        },
        /**
         * @name: 停止框架运行 
         * @param {*}
         * @return {*}
         */
        clear:function(){
            clearInterval(this.timer)
            this.timer = 0;
        },
        /**
         * @name: 运行框架
         * @param {*}
         * @return {*}
         */
        run:function(){
            //如果框架在运行，则返回
            if(this.timer){
                return;
            }
            //框架没运行，则重置计时器
            this.clear();
            //运行框架，interval定时器，执行loop函数
            this.timer = setInterval(this.loop,this.interval)
        },
        /**
         * @name: 运动框架循环方法
         * @param {*}
         * @return {*}
         */
        loop:function(){
            //如果框架中运动成员队列为空
            if(Tween.queen.length===0){
                //停止运行框架
                Tween.clear();
                // 返回
                return;
            }
            //每次循环都换取当前时间
            var now = +new Date();
            //遍历运动成员
            for(var i = Tween.queen.length-1;i>=0;i--){
                //获取当前运动成员
                var instance = Tween.queen[i];
                //当前运动成员已运动的时间
                instance.passed = now - instance.start;
                //如果当前成员运动的时间小于成员指定的运动时间
                if(instance.passed < instance.duration){
                    //执行当前成员主函数
                    Tween.workFn(instance)
                }else{
                    //结束当前运动成员运行
                    Tween.endFn(instance)
                }
            }
        },
        /**
         * @name: 运行方法 
         * @param {*} instance 运动成员
         * @return {*}
         */
        workFn:function(instance){
            //运动成员当前状态
            instance.tween = this.easing[instance.type](instance.passed,instance.from,instance.to-instance.from,instance.duration);
            //执行主函数
            this.exec(instance)
        },
        /**
         * @name: 结束方法 
         * @param {*} instance 运动成员
         * @return {*}
         */
        endFn:function(instance){
            instance.passed = instance.duration;
            instance.tween = instance.to;
            this.exec(instance);
            this.distory(instance)
        },
        /**
         * @name: 执行主函数
         * @param {*} instance
         * @return {*}
         */
        exec:function(instance){
            try{
                //执行当前成员主函数
                instance.main(instance.dom)
            }catch(e){

            }
        },
        /**
         * @name: 注销运动成员
         * @param {*} instance 运动成员
         * @return {*}
         */
        distory:function(instance){
            this.queen.splice(this.queen.indexOf(instance),1)
            //执行当前成员结束函数
            instance.end(this.queen)
            for(var i in instance){
                delete instance[i]
            }
        }

    }

    /**
     * @name: 获取当前成员在运动队列中的位置
     * @param {*}
     * @return {*}
     */
    Tween.queen.indexOf = (function(){
        var that = this;
        //又indexOf方法则方法，没有则自己创建一个
        return Tween.queen.indexOf||function(instance){
            // 遍历每个成员
            for(var i=0,len = that.length;i<len;i++){
                if(that[i]===instance){
                    //找到返回索引
                    return i;
                }else{
                    //没找到返回-1
                    return -1;
                }
            }
        }
    }());

    A.fn.extend({
        /**
         * @name: 动画模块
         * @param {*} obj 动画对象成员
         * $('.div').animate({
                from:100,
                to:150,
                duration:2000,
                main:function($dom){
                    $dom.css({width:this.tween+'px'})
                },
                end:function($dom){
                    
                    console.log('done')
                }
            })
         * @return {*}
         */
        animate:function(obj){
            //适配运动对象
            var obj = A.extend({
                duration:400,       //默认运行时间
                type:'def',         //默认动画默认函数
                from:0,             //开始点
                to:1,               //结束点
                start:+new Date(),  //当前元素
                dom:this,           //当前元素
                main:function(){},  //运行主函数,这里暴漏了A框架对象
                end:function(){}    //结束函数，暴漏了A框架对象
            },obj)

            // 向运动框架载入运动对象成员
            Tween.add(obj)
        },
        
        /**
         * @name: 类似jQuery的动画
         * @param {*} cssObj css属性对象
         * @param {*} duration 动画执行时间
         * @param {*} callback 动画完成回调函数
         * @return {*}
         */
        $animate:function(cssObj,duration,callback){
            //求出当前css值
            var startCss = {}//{width:100}
            for(var key in cssObj){
                startCss[key] = parseFloat(this.css(key))
                cssObj[key] = parseFloat(cssObj[key])
            }
            // console.log('startCss:',startCss)
            // console.log('cssObj:',cssObj)
            //遍历css对象做动画
            var that = this;
            for(var key in cssObj){
                // console.log(key)
                ;(function(that,key){
                    that.animate({
                        from:startCss[key],
                        to:cssObj[key],
                        duration:duration||400,
                        main:function($dom){
                            if(key==='opacity'||key==='zIndex'||key==='scrollTop'){
                                var value = this.tween+''
                            }else{
                                var value = this.tween+'px'
                            }
                            $dom.css(key,value)
                        },
                        end:function(queen){
                            //运动队列里没有运动成员对象时，执行回调
                            if(queen['length']===0){
                                callback&&callback()
                            }
                        }
                    })
                }(that,key));
            }
        }
    })

    /**
     * @name: 释放$别名，避免框架冲突
     * @param {*} library 其他框架名
     * @return {*}
     */
    A.noConflict = function(library){
        if(library){
            window.$ = library
        }else{
            window.$ = null;
            delete window.$;
        }
        // 返回A对象
        return A;
    }
    //为全局对象绑定A框架，并绑定别名$
    window.$ = window.A = A;
})(window);