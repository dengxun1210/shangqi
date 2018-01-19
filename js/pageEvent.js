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
            	//Chrome等   
        	else if (docElm.webkitRequestFullScreen) {  
            		docElm.webkitRequestFullScreen();  
        	}  
            	//IE11   
        	else if (docElm.msRequestFullscreen) {  
            		docElm.msRequestFullscreen();  
        	} 
		var windowHeight = $(window).width();
    		//地球页面高度为打开页面高度
    		$(".wrapper").width(windowHeight+"px"); 
		var windowHeight = $(window).height();
    	  	//地球页面高度为打开页面高度
    		$(".wrapper").height(windowHeight+125+"px"); 
		earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance+100);
	
	
	}else{
		
		earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance);
 		document.msExitFullscreen(); 
		setTimeout(function(){
			var windowHeight = $(window).height();
    	  		//地球页面高度为打开页面高度
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
    //alert("heeh");
	setInterval(function(){
	var time = new Date();
	var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var day = time.getDate();
        var hour = time.getHours();
        var minute = time.getMinutes();
        var second = time.getSeconds();
        var needAddZero = [month, day, hour, minute, second];
        for (var i = 0; i < 5; i++) {
            if (needAddZero[i] >= 0 && needAddZero[i] <= 9) {
                needAddZero[i] = "0" + needAddZero[i];
            }
        }



        var formatTime ={
            year: year,
            month: needAddZero[0],
            day: needAddZero[1],
            hour: needAddZero[2],
            minute: needAddZero[3],
            second: needAddZero[4]
        }
	$(".header-time").html(formatTime.year+"-"+formatTime.month+"-"+formatTime.day+" "+formatTime.hour+":"+formatTime.minute+":"+formatTime.second);
	
	}, 1000)

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
