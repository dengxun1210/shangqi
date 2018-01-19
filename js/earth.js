/**
 * Created by Administrator on 2017/11/7.
 */
/*StampIp*/
//var StampIp = "http://10.203.103.24";
var StampIp = "http://192.168.107.99";
//地球obj
var earth;
var ballon;
var ballonParams;
var distance;
/*
 * 加载球*/
$(function () {
    getInitData2(900000);//从数据库取15分钟数据
});

function initMap(){
    $("#earthContainer").html('<object id="earthDX" ' +
        'classid="clsid:EA3EA17C-5724-4104-94D8-4EECBD352964" ' +
        'data="data:application/x-oleobject;base64,Xy0TLBTXH0q8GKFyFzl3vgAIAADYEwAA2BMAAA==" ' +
        'width="100%" height="100%"></object>');
    
    earth = document.getElementById("earthDX");
    earth.Event.OnCreateEarth = function () {
        earth.Load(StampIp, 1);//加载数据
        earth.Event.OnDocumentChanged = function (type, guid) {
            if (type === 1) {
                //1.设置界面视角
                setEarthView();
                //2.设置图层属性
                setLayerProperty();
                //3.加载动态模型
                earth.DynamicSystem.ApplyDynamicList();
                earth.Event.OnDynamicListLoaded = function () {
                    var width = 300;
                    var height = $("#earthContainer").height() - 20;
                    var url = window.location.href.substring(0, window.location.href.lastIndexOf("/")) +"/ballon.html";
                    ballonParams = {
                        earth: earth,
                        width: width,
                        height: height,
                        url: url
                    }
                    createBallon(ballonParams.width, ballonParams.height, ballonParams.url);

                    //4.初始化实时路径
                    initCurrent();
                }
            }
        };
    };
}

//设置地球视角,回复初始界面a
function setEarthView() {
    if(screen.availWidth>2000){
	distance = 2900;
    }else if(screen.availWidth>1500 && screen.availWidth<=2000){
	distance = 2794;
    }else if(screen.availWidth<=1500){
	distance = 2600;
    }
    earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance);
    $(document).on("keydown", function (event) {
        if (event.keyCode === 65) {
            earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance);
        }
    });
	$("*").keydown(function (e) {//判断按键
                e = window.event || e || e.which;
		if(e.keyCode ===27 && document.msFullscreenElement == null){
			earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance);
 			document.msExitFullscreen(); 
			setTimeout(function(){
				var windowHeight = $(window).height();
    	  			//地球页面高度为打开页面高度
    				$(".wrapper").height(windowHeight+8+"px"); 
			}, 1000);	
		}
                if (e.keyCode == 112 || e.keyCode == 113
                    || e.keyCode == 114 || e.keyCode == 115
                    || e.keyCode == 116 || e.keyCode == 117
                    || e.keyCode == 118 || e.keyCode == 119
                    || e.keyCode == 120 || e.keyCode == 121
                    || e.keyCode == 122 || e.keyCode == 123) {
                    e.keyCode = 0;
                    return false;
                }
            });
}


//设置图层显示隐藏、控制图层查询属性
function setLayerProperty(layer) {
    if (!layer) {
        layer = earth.LayerManager.LayerList;
    }
    var f = false;
    var layerData = [];
    var childCount = layer.GetChildCount();
    for (var i = 0; i < childCount; i++) {
        var childLayer = layer.GetChildAt(i);
        //map图层和wms图层不显示
        if (childLayer.LayerType.toLowerCase() === "map") {
            childLayer.Visibility = false;
        }
        if (childLayer.LayerType.toLowerCase() === "wms") {
            childLayer.Visibility = false;
        }
        if (childLayer.LocalSearchParameter !== null) {
            if (childLayer.LayerType === 'POI') {
                childLayer.LocalSearchParameter.ReturnDataType = f ? 5 : 1;
            } else {
                childLayer.LocalSearchParameter.ReturnDataType = f ? 6 : 4;
            }
        }

        if (childLayer.GetChildCount() > 0) {
            setLayerProperty(childLayer);
        }
    }
}

//生成气泡
function createBallon(width, height, url) {
    ballon = earth.Factory.CreateHtmlBalloon(earth.Factory.CreateGuid(), "全屏气泡");
    ballon.SetScreenLocation(0, 0);
    ballon.SetIsTransparence(true);
    ballon.SetRectSize(width, height);
    ballon.SetIsAddBackgroundImage(true);
    ballon.SetBackgroundAlpha(0);
    ballon.ShowNavigate(url);
    ballon.SetIsVisible(false);

    var obj = {
        width: width,
        height: height,
        earth: earth,
        funs:{
            hideVinTree:hideVinTree,
            showVinTree:showVinTree,
            changeColor:changeColor,
            clickView:clickView,
            chooseCarClick:chooseCarClick,
            changeTag:changeTag,
	    getOnOffStatus:getOnOffStatus,
            window: window
        }
    };

    earth.Event.OnDocumentReadyCompleted = function(guid) {
        if (ballon.Guid === guid) {
            ballon.InvokeScript("main", obj);
        }
        earth.Event.OnDocumentReadyCompleted = function () {}
    };

    window.onunload = function () {
        ballon.DestroyObject();
    }
    ballon.SetIsVisible(false);
}
