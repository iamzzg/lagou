/*
 * @Author: your name
 * @Date: 2021-01-10 18:19:53
 * @LastEditTime: 2021-01-15 14:44:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \lagou\js\index.js
 */
$(function(){

    //监听登录按钮
    $("#login").on('click',function(event){
        var event = event ||window.event;
        event.preventDefault()

        //显示遮罩层
        $("#mask").css('display','block')
        $(document.body).css('overflow','hidden')

        // 显示登录页
        $('#login_page').css('display','block')

    })

    //监听登录页关闭
    $('.close').on('click',function(){
        //隐藏登录页和遮罩层
        $("#mask").css('display','none')
        $(document.body).css('overflow','auto')

        
        $('#login_page').css('display','none')
    })

    //轮播图
    $.slideshow('#slider1',{width:840,height:364})

    //显示隐藏链接
    $('.toggle').on("click",function(){
        if($('.hide-links').hasClass('active')){
            $('.hide-links').removeClass('active')
            $('.toggle').html(`展开
            <i class="iconfont icon-xiajiantou"></i>`)
        }else{
            $('.hide-links').addClass('active')
            $('.toggle').html(`收起
            <i class="iconfont icon-xiajiantou"></i>`)
        }
    })

    $(window).on('scroll',function(e){
        var body_scrollTop = window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop
        // console.log(body_scrollTop)
        // console.log(document.documentElement.scrollTop)
        if(body_scrollTop>=160){
            $('.lg-search').css({position:'fixed',top:'40px',left:'0px',"padding-top":'5px',"padding-bottom":"5px","z-index":9,width:'1349px'})
            $('.lg-banner').css({"margin-bottom":'85px'})
        }else{
            $('.lg-search').css({position:'static',"padding-top":'5px',"padding-bottom":"5px","z-index":9,width:'1349px'})
            $('.lg-banner').css({"margin-bottom":'0'})
        }
    })
});