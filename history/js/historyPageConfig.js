/**
 * Created by Administrator on 2017/9/28.
 */
//页面基本设置
$(function () {
    window.moveTo(0, 0);
    window.resizeTo(screen.availWidth, screen.availHeight);
    //.wrapper全屏
    wrapperFullScreen();

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

    //禁止F1---F11键
    $("*").keydown(function (e) {//判断按键
        e = window.event || e || e.which;
        if (e.keyCode === 112 || e.keyCode === 113
            || e.keyCode === 114 || e.keyCode === 115
            || e.keyCode === 116 || e.keyCode === 117
            || e.keyCode === 118 || e.keyCode === 119
            || e.keyCode === 120 || e.keyCode === 121
            || e.keyCode === 122 || e.keyCode === 123
            || e.keyCode === 27) {
            return false;
        }
    });

    window.onresize = function () {
        //.wrapper全屏
        wrapperFullScreen();
    };
});

function wrapperFullScreen() {
    var wrapper = $(".wrapper");
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    wrapper.width(windowWidth + "px");
    wrapper.height(windowHeight + 8 + "px");
}
