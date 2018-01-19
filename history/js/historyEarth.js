/**
 * Created by Administrator on 2017/11/7.
 */
// 三维球Ip
var StampIp = "http://10.203.103.24";
var nodeIp = "http://10.203.103.34:3000";
//三维球对象
var earth;
//记录车辆信息用于在树状列表中显示车辆
var carInfo = {}
//历史VinNumbers
var obj = {
    historyTracks: []
};
var historyLines = [];
var trackData = {};
var listballon;
var chartBallon
var historyStartTime;
var historyEndTime;
var lastPoint = [];
var pointTime;
var trackShowStatus = {};
var trackHideTime = {};
var trackShowTime = {};
var trackIds = [];
var idVin = {};
var carData = {};
var distance;


// 加载球
$(function () {
    $("#earthContainer").html('<object id="earthDX" ' +
        'classid="clsid:EA3EA17C-5724-4104-94D8-4EECBD352964" ' +
        'data="data:application/x-oleobject;base64,Xy0TLBTXH0q8GKFyFzl3vgAIAADYEwAA2BMAAA==" ' +
        'width="100%" height="100%"></object>');

    earth = document.getElementById("earthDX");
    earth.Event.OnCreateEarth = function () {
        earth.Load(StampIp, 1);//加载数据
        earth.Event.OnDocumentChanged = function (type, guid) {
            if (type === 1) {
                setEarthView();
                setLayerProperty();
                pageInit();
                getCarInfo();
                pageClick();
            }
        };
    };
});

//设置地球视角,回复初始界面a
function setEarthView() {
    if (screen.availWidth > 2000) {
        distance = 2900;
    } else if (screen.availWidth > 1500 && screen.availWidth <= 2000) {
        distance = 2794;
    } else if (screen.availWidth <= 1500) {
        distance = 2600;
    }
    earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance);
    $(document).on("keydown", function (event) {
        if (event.keyCode === 65) {
            earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance);
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
//页面初始设置初始显示时间
function pageInit() {
    var now = new Date(new Date().getTime() - 1800000);
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    $(".start .year input").val(year);
    $(".start .month input").val(month);
    $(".start .day input").val(day);
    $(".start .hour input").val(hour);
    $(".start .minute input").val(minute);
    $(".start .second input").val(second);
    var last = new Date();
    year = last.getFullYear();
    month = last.getMonth() + 1;
    day = last.getDate();
    hour = last.getHours();
    minute = last.getMinutes();
    second = last.getSeconds();
    $(".stop .year input").val(year);
    $(".stop .month input").val(month);
    $(".stop .day input").val(day);
    $(".stop .hour input").val(hour);
    $(".stop .minute input").val(minute);
    $(".stop .second input").val(second);
}
//获取车辆信息用于树状列表
function getCarInfo() {
    $.ajax({
        type: "POST",
        url: nodeIp+"/getData",
        cache: false,
        data: {sql:'select * from vehicleInfo'},
        success: function (result) {
            var resultObj = {};
            for(var x in result){
                var groupName = result[x].GroupName;
                var vinNumber = result[x].VinNumber;
                var states = result[x].States;
                if(resultObj[groupName] === undefined){
                    resultObj[groupName] = [];
                }
                if(resultObj[groupName].indexOf(vinNumber) === -1){
                    resultObj[groupName].push(vinNumber, states);
                }
            }
            carInfo = resultObj;
            console.log(carInfo);
        }
    });
}
//页面点击事件
function pageClick() {
    //时间禁止输入非数字，响应时间有最大值，点击键盘上下键数字加减
    $(".time input")
        .keyup(function (event) {
            var valInput = parseInt($(this).val());
            var keyPress = event.keyCode;

            if (keyPress === 38) {
                if (pressKey($(this), valInput) === undefined) {
                    $(this).val(valInput + 1);
                }
            }

            if (keyPress === 40) {
                if($(this).parent().hasClass("hour") ||$(this).parent().hasClass("minute") ||$(this).parent().hasClass("second")){
                    if (valInput !== 0) {
                        $(this).val(valInput - 1);
                    }
                }else{
                    if (valInput !== 1) {
                        $(this).val(valInput - 1);
                    }
                }

            }
            var correctValue = $(this).val().replace(/\D/g, '');
            if (pressKey($(this), correctValue) !== undefined) {
                if($(this).parent().hasClass("hour") ||$(this).parent().hasClass("minute") ||$(this).parent().hasClass("second")){
                    $(this).val(0);
                }else{
                    $(this).val(1);
                }

            } else {
                $(this).val(correctValue);
            }
        })
        .bind("paste", function () {
            var correctValue = $(this).val().replace(/\D/g, '');
            if (pressKey($(this), correctValue) !== undefined) {
                $(this).val(0);
            } else {
                $(this).val(correctValue);
            }
        });

    //全屏，退出全屏
    $(".fa-arrows-alt").click(function () {
        if (JSON.stringify(document.msFullscreenElement) === "null") {
            var docElm = document.documentElement;
            docElm.msRequestFullscreen();
            wrapperFullScreen();
            earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance+100);
        } else {
            document.msExitFullscreen();
            earth.GlobeObserver.GotoLookat(119.419431, 31.042377, 0, 73.522, 89, 0, distance);
            wrapperFullScreen();
        }
    });


    $("#carChoose").click(function () {
        if ($(this).hasClass("on")) {
            $(this).removeClass("on");
            if (listballon != null) {
                listballon.DestroyObject();
            }
            
        } else {
            
            $(this).addClass("on");
            if (chartBallon != null) {
                chartBallon.DestroyObject();
                $(".history-search").removeClass("on");
                $(this).addClass("on");
                $("#carCategory").removeClass("on");
                for (var i = 0, len = historyLines.length; i < len; i++) {
                    earth.DetachObject(historyLines[i]);
                }
                historyLines = [];
                trackData = {};
                historyStartTime = 0;
                historyEndTime = 0;
                trackShowStatus = {};
                trackHideTime = {};
                trackShowTime = {};
                trackIds = [];
                idVin = {};
                carData = {};
            }
            if (listballon != null) {
                listballon.DestroyObject();
            }
            createListBallon();
        }
    });


    $(".history-search").click(function () {
        //历史VinNumbers
        if (obj.historyTracks.length === 0) {
            return false;
        }

        if(listballon != null){
            listballon.DestroyObject();
            $("#carChoose").removeClass("on");
        }

        if(chartBallon != null){
            chartBallon.DestroyObject();
        }

        $("#carCategory").removeClass("on");

        var year = $(".start .year input").val();
        var month = $(".start .month input").val();
        var day = $(".start .day input").val();
        var hour = $(".start .hour input").val();
        var minute = $(".start .minute input").val();
        var second = $(".start .second input").val();
        var startTime = new Date(year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second).getTime();

        year = $(".stop .year input").val();
        month = $(".stop .month input").val();
        day = $(".stop .day input").val();
        hour = $(".stop .hour input").val();
        minute = $(".stop .minute input").val();
        second = $(".stop .second input").val();
        var endTime = new Date(year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second).getTime();

        var charObj = {};
        charObj.earth = earth;
        charObj.historyTracks = obj.historyTracks;
        charObj.startTime = startTime;
        charObj.endTime = endTime;
        var earthContainer = $("#earthContainer");
        var width = earthContainer.width();
        var height = 200;
        var earthContainerHeight = $("#earthContainer").height();
        if(earthContainerHeight>1000){
    		var top = earthContainerHeight -300;
    	}else{
    	    	var top = earthContainerHeight -160;
    	}
	top = earthContainerHeight;
        var left = 0;
        var url = window.location.href.substring(0, window.location.href.lastIndexOf("/")) + "/history/html/historyChart.html";
        chartBallon = createBallon(width, height, left, top, url, charObj);
        chartBallon.SetIsVisible(false);
    });

    $("#carCategory").click(function () {
        if (chartBallon == null) {
            return false;
        }
        if ($(this).hasClass("on")) {
            $(this).removeClass("on");
            chartBallon.SetIsVisible(false);
        } else {
            $(this).addClass("on");
            chartBallon.SetIsVisible(true);
        }
    });

    $("#backIndex").click(function () {
        window.location.href = nodeIp + "/index"
    });
}

function createListBallon() {
    var width = 300;
    var height = $("#earthContainer").height() * 0.96;
    var top = height / 48;
    var left = 0;
    var url = window.location.href.substring(0, window.location.href.lastIndexOf("/")) + "/history/html/historyList.html";
    obj.carInfo = carInfo;
    listballon = createBallon(width, height, left, top, url, obj, listballon);
}

//生成气泡
function createBallon(width, height, left, top, url, obj) {
    var ballon = earth.Factory.CreateHtmlBalloon(earth.Factory.CreateGuid(), "全屏气泡");
    ballon.SetScreenLocation(left, top);
    ballon.SetIsTransparence(true);
    ballon.SetRectSize(width, height);
    ballon.SetIsAddBackgroundImage(true);
    ballon.SetBackgroundAlpha(0);
    ballon.ShowNavigate(url);
    //获取车辆信息
    earth.Event.OnDocumentReadyCompleted = function (guid) {
        if (ballon.Guid === guid) {
            obj["ballon"] = ballon;
            ballon.InvokeScript("main", obj);
        }
        earth.Event.OnDocumentReadyCompleted = function () {
        }
    };
    window.onunload = function () {
        ballon.DestroyObject();
    };
    return ballon;
}

function pressKey(clickNode, valInput) {
    if (clickNode.parent().hasClass("month") && valInput > 12) {
        return false;
    }

    if (clickNode.parent().hasClass("hour") && valInput > 23) {
        return false;
    }

    var thisYear = parseInt(clickNode.parent().parent().find(".year input").val());
    var thisMonth = parseInt(clickNode.parent().parent().find(".month input").val());
    if (thisMonth === 12) {
        thisYear++;
        thisMonth = 1;
    } else {
        thisMonth++;
    }
    var thisMonthLastDay = new Date(new Date(thisYear + "/" + thisMonth + "/01").getTime() - 3600 * 24 * 1000).getDate();

    if (clickNode.parent().hasClass("day") && valInput > thisMonthLastDay) {
        return false;
    }


    if (clickNode.parent().hasClass("minute") && valInput > 59) {
        return false;
    }

    if (clickNode.parent().hasClass("second") && valInput > 59) {
        return false;
    }
}









