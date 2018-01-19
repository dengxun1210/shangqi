/**
 * Created by Administrator on 2017/12/19.
 */
var hehe = true;
var ballonExist = true;
$(function () {
    //hu全屏按钮
    $(".fa-arrows-alt").click(function () {
        if(document.msFullscreenElement == null){
             var docElm = document.documentElement;  
            //W3C   
            if (docElm.requestFullscreen) {  
                    docElm.requestFullscreen();  
            }  
                //FireFox   
            else if (docElm.mozRequestFullScreen) {  
                    docElm.mozRequestFullScreen();  
            }  
                //Chrome��   
            else if (docElm.webkitRequestFullScreen) {  
                    docElm.webkitRequestFullScreen();  
            }  
                //IE11   
            else if (docElm.msRequestFullscreen) {  
                    docElm.msRequestFullscreen();  
            } 
        var windowHeight = $(window).width();
            //����ҳ��߶�Ϊ��ҳ��߶�
            $(".wrapper").width(windowHeight+"px"); 
        var windowHeight = $(window).height();
            //����ҳ��߶�Ϊ��ҳ��߶�
            $(".wrapper").height(windowHeight+125+"px"); 
        earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance+100);
        }else{
            earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance);
            document.msExitFullscreen();
            setTimeout(function(){
                var windowHeight = $(window).height();
                //����ҳ��߶�Ϊ��ҳ��߶�
                $(".wrapper").height(windowHeight+8+"px");
            }, 1000);

        }
    });
    
    $("#carChoose").click(function () {
        if($(this).hasClass("on")){
            $(this).removeClass("on");
            ballon.SetIsVisible(false);
        }else{
            $(this).addClass("on");
            ballon.SetIsVisible("true");
    }
        //if(ballonExist){
        //    ballonExist = false;
        //    ballon.DestroyObject();
        //}else{
        //    ballonExist = true;
        //    createBallon(ballonParams.width, ballonParams.height, ballonParams.url);
        //}
    })
});



function hideElements() {
    for(var i=0,len = arguments.length; i<len; i++){
        $("."+arguments[i]).addClass("hide");
    }
}


function showElements() {
    for(var i=0,len = arguments.length; i<len; i++){
        $("."+arguments[i]).removeClass("hide");
    }
}
