/**
 * Created by Administrator on 2017/9/28.
 */
//页面基本设置
$(function () {
    window.moveTo(0, 0);
    window.resizeTo(screen.availWidth, screen.availHeight);
    //设置页面高度
    var windowHeight = $(window).height();
    //地球页面高度为打开页面高度
    $(".wrapper").height(windowHeight+"px");

    //禁止ctrl+鼠标中键缩放页面，兼容IE/Opera/Chrome/Safari
    window.onmousewheel = document.onmousewheel = function (e) {
        e = e || window.event;
        if (e.wheelDelta && event.ctrlKey) {//IE/Opera/Chrome
            e.preventDefault();
        } else if (e.detail) {//Firefox
            e.preventDefault();
        }
    };

    //禁止鼠标右键
    $(document).bind('contextmenu', function (e) {
        return false;
    });


    window.onresize = function () {};
});
