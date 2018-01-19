/**
 * Created by Administrator on 2017/8/2.
 */
/*球加载、气泡设置生成*/

/*node服务器*/
//var nodeIp = "http://172.16.182.148:3000/getData";
var nodeIp = "http://localhost:3000/getData";

//页面宽度
var pageWidth = parseInt($(".wrapper").width());
//页面分辨率
var pageReslolution = 10000;
//开始时间
var startCurrentTime = 1504157327000;
//0实时妆台， 1历史状态
var systemStatus = 0;
//实施车辆数据
var currentInterval;             //实时轨迹时间间隔
var currentTimeout;              //实时添加点时间间隔
var currentIndex = 0;            //！！！！！暂时用于文件读取，正式接口修改！！！！！
var groupData = {};              //树状列表信息
var oldGroupData = {};           //用于保存树状列表信息, 用于页面操作
var vinNumbers = [];             //所有车辆
var oldVinNumbers = [];          //old 车辆vin
var trackVin = {};               //轨迹
var oldTrackVin = {};
var vinTrack = {};
var oldVinTrack = {};
var currentCarData = {};        //车辆信息
var tempCarData = {};           //暂时保存车辆信息，用于添加轨迹点
var oldCarData = {};            //用于保存车辆信息, 用于页面操作
var currentTrackData = {};      //轨迹点信息
var tempTrackData = {};         //暂时用于保存轨迹信息，用于添加轨迹点
var oldTrackData = {};
var needAddTrack = [];           //需要删除轨迹
var needDeleteTrack = [];       //需要添加轨迹
var samePosition = [0, 0];           //解决位置相等
var samePositionAdd = [0, 0, 0];
//视角选择所需变量
var chooseCar;                   //当前选择车辆
var viewPoint = 4;                //视角4自由视角， 1第一人称视角， 3第三人称视角
//离线在线所需变量
var offline = 0;
var online = 0;
var onlineStatus = true;
var offlineStatus = false;
var tagName;
var addSpeedSetTimeArr = [];     //速度时间间隔

var oldTrackIndexInGroup = {};   //20秒内，track在同一辆车中的index
var trackIndexInGroup = {};
var trackIndexSetTimeArr = [];     //track bk时间间隔

var colors = [
            '009911', '993300', '339393', '000080', '333399', '399339', '800000', 'FF6600',
            '808000', '008000'
        ];

var timerec = 0;
var vinTrackPlaying = {};            //保存正在播放的轨迹（只针对有多条轨迹的车辆）
var vinVisibility = {};             //车辆是否开启显示（只代表车辆对应左边树上的checkbox是否开启，不代表实际车辆是否在地图上显示隐藏）


var timeBias = 500;
var speedTimeBias = 10000.0;  //速度标签刷新频率 单位：毫秒

var timeMonitorTemp = 0;

var trackLastTime = {};   //轨迹最后一个点的时间戳


$(function () {
    
    //点击在线
    $("#online").click(function () {
        clickOnlineOffline($(this), "1");
    });

    //点击离线
    $("#offline").click(function () {
        clickOnlineOffline($(this), "0");
    });   
});

//CURRENT 初始化实时路径
function initCurrent() {
    currentIndex = 0;
    systemStatus = 0;
    oldVinNumbers = [];
    oldTrackVin = {};
    oldTrackIndexInGroup = {};
    oldVinTrack = {};
    oldGroupData = {};
    oldTrackData = {};
    oldCarData = {};

    vinNumbers = [];
    vinTrack = {};
    trackIndexInGroup = {};
    trackVin = {};
    groupData = {};
    currentTrackData = {};
    currentCarData = {};

    onlineStatus = true;
    offlineStatus = false;
    tagName = undefined;
    chooseCar = undefined;
    viewPoint = 4;


    chooseColors = {};
    carHideOrNot = {};
    groupHideOrNot = {};
    groupBackGroudColors = {};
    groupOpen = {};
    carOnlineOrNot = {};
    carHistory = {};
    carPlusMinusColor = {};
    historyTracks = [];


    $(".mainSidebar, #currentCover").show();
    if(pageWidth>pageReslolution){
        $(".earthContainer").css({height: "calc(100% - 50px)"});
    }else{
        $(".earthContainer").css({height: "calc(100% - 2rem)"});
    }
    $("#vinNumber").addClass("on").siblings().removeClass("on");
    $("#online").html("在线：");
    $("#offline").html("离线：");
    $("#carView").find(".on").removeClass("on");
    $("#freeView").addClass("on");
    
    console.log("开始...");
    tryTimeRecord();
    
}

function tryTimeRecord(){    
    timeRecordInterval = setInterval(function () {
        var carSql = {
            sql: "select TimeRecord from timerec"
        };
        $.ajax({
            type: "POST",
            url: nodeIp,
            cache: false,
            data: carSql,
            success: function (result1) {
                var recordTime = result1[0].TimeRecord;
                if(recordTime >= timerec){
                    //console.debug('tryTimeRecord数据库rec时间戳有效：'+recordTime);
                    timerec = recordTime+20000;
                    makeTrack(recordTime);                    
                    tryMakeTrack();
                    clearInterval(timeRecordInterval);
                }
            }
        });
    }, 500);
}

//CURRENT 首先获取实时路径数据，1秒钟之后向路径添加轨迹点
function makeTrack(recordTime) {
    //获得实时数据
    getCurrentData(recordTime);
    //给轨迹添加点
    currentTimeout = setTimeout(function () {
        showTrack();
    },1000);
}

function tryMakeTrack() {
    currentInterval = setInterval(function () {
        var carSql = {
            sql: "select TimeRecord from timerec"
        };
        $.ajax({
            type: "POST",
            url: nodeIp,
            cache: false,
            data: carSql,
            success: function (result1) {
                var recordTime = result1[0].TimeRecord;
                if(recordTime >= timerec){
                    //console.debug('tryMakeTrack数据库rec时间戳有效：'+recordTime);    
                    timerec = recordTime+20000;               
                    makeTrack(recordTime);                  
                }
                else{
                    clearInterval(currentInterval);
                    tryTimeRecord(); 
                }
            }
        });
    }, 20000);
}

function deleteCurrentData(timeFrom,timeTo){
    var sql = {
        sql: "delete from track where SamplingTime BETWEEN "+timeFrom+" and "+timeTo
    };
    $.ajax({
        type: "POST",
        url: nodeIp,
        cache: false,
        data: sql,
        success: function (result) {
        }
    });
}

//CURRENT 获得数据
function getCurrentData(recordTime) {
    var timeFrom = recordTime-900000;
    var timeTo = timeFrom+20000;

    var timenow = new Date().getTime();
    var trackSql = {
        sql: "select * from track where SamplingTime >= "+timeFrom+" and SamplingTime <"+timeTo
    };
    var results = [];
    $.ajax({
        type: "POST",
        url: nodeIp,
        cache: false,
        data: trackSql,
        success: function (result0) {
            //deleteCurrentData(timeFrom,timeTo);//删除数据库中的track数据
            var ttt = new Date().getTime()-timenow;
            console.debug('取数据：'+timeFrom+'--'+timeTo+',取出数据条数：'+result0.length+',耗时：'+ttt);
            results.push(result0);
            if (result0.length === 0) {
                return;
            }
            var carSql = {
                sql: "select * from vehicleinfo"
            };
            $.ajax({
                type: "POST",
                url: nodeIp,
                cache: false,
                data: carSql,
                success: function (result1) {
                    results.push(result1);
                    setCurrentData(results);
                    //基础更新根据新旧数据增减来增加轨迹
                    basicUpdateData();
                    //console.debug('needAddTrack增加track：'+needAddTrack.length);
                    createTrack(needAddTrack);
                }
            });
        }
    });
}


//整理实时数据格式
function setCurrentData(result) {
    vinNumbers = [];
    groupData = {};
    currentCarData = {};
    currentTrackData = {};
    offline = 0;
    online = 0;
    var groupNames = [];

    var trackData = result[0];
    var carData = result[1].reverse();
    var carDataLen = carData.length;
    var trackDataLen = trackData.length;
    var i, groupName, vinNumber, carNode, states;

    //车辆信息
    for (i = 0; i < carDataLen; i++) {
        carNode = carData[i];
        groupName = carNode.GroupName;
        vinNumber = carNode.VinNumber;
        states = carNode.States;

        // 树状列表所需数据groupData
        if (groupNames.indexOf(groupName) === -1) {
            groupNames.push(groupName);
            groupData[groupName] = [];
        }

        // 车辆信息
        if (vinNumbers.indexOf(vinNumber) === -1) {
            groupData[groupName].push(vinNumber);
            vinNumbers.push(vinNumber);
            currentCarData[vinNumber] = [];
            currentTrackData[vinNumber] = [];

        }
        // 车辆信息
        if (currentCarData[vinNumber].length === 0) {
            currentCarData[vinNumber].push(carNode.States, groupName, carNode.Code, carNode.PatacId, carNode.States, carNode.TestId, carNode.Vsid);
        }
        //路径点位信息，将info表的点加入第一条轨迹的第一个点
        if (currentTrackData[vinNumber].length === 0) {
            currentTrackData[vinNumber].push([[carNode.LastLongtitude, carNode.LastLatitude, carNode.height, carNode.LastSamplingTime, carNode.LasSpeed]]);
        }
    }


    i=0;
    for(x in groupData){
        if(chooseColors[x] === undefined){
            chooseColors[x] = colors[i++];
        }
    }


    //路径点信息
    var vinNumber_before = '';
    var bk_before = 0;
    var tempii = 0;
    for (i = 0; i < trackDataLen; i++) {
        var trackNode = trackData[i];
        vinNumber = trackNode.VinNumber;
        if(vinNumber != vinNumber_before){
            bk_before = 0;
            tempii++;
        }
        if(vinNumbers.indexOf(vinNumber) !== -1){//如果track的vinnumber在车辆表中存在
            var bk = trackNode.BK;
            var len = currentTrackData[vinNumber].length;
            //dengxun
            if(bk_before===0){
                /*
                if(currentTrackData[vinNumber][len-1].length>3){
                    continue;
                }*/
                //前0，加点到track
                currentTrackData[vinNumber][len-1].push([trackNode.Longtitude, trackNode.Latitude, trackNode.height, trackNode.SamplingTime, trackNode.Speed]);
            }
            else if(bk===0){
                //前1后0，创建track
                currentTrackData[vinNumber].push([[trackNode.Longtitude, trackNode.Latitude, trackNode.height, trackNode.SamplingTime, trackNode.Speed]]);
            }
            bk_before = bk;
        }
        vinNumber_before = vinNumber;
    }
    //console.debug('在线distinct：'+tempii+',轨迹总条数：'+trackDataLen);
    //确定离线在线
    for(i in currentTrackData){
        var firstTrackLen = currentTrackData[i][0].length;//第一条轨迹的点数
        if(firstTrackLen === 1){
            //离线车辆
            currentCarData[i][0] = "0";
            ++offline;
        }else{
            //在线车辆
            currentTrackData[i][0] = currentTrackData[i][0].slice(1);//在线车辆：删除info表的点
            currentCarData[i][0] = "1";
            ++online;
        }
        //新增的车辆，此时还没有在树上显示，所以完全由在线离线判断其是否显示轨迹
        if(vinVisibility[i] === undefined){    
            vinVisibility[i] =  firstTrackLen === 1? offlineStatus:onlineStatus;
        }
    }
    //console.debug('在线:'+online+'离线:'+offline);
}


//更新轨迹数据---以前没有轨迹，现在有轨迹，以前有轨迹，现在没有轨迹
function basicUpdateData() {
    needDeleteTrack = [];
    needAddTrack = [];
    //如果数据以前没有轨迹，现在出现，则添加轨迹
    for (var i = 0; i < vinNumbers.length; i++) {
        var vinNumber = vinNumbers[i];
        if (oldVinNumbers.indexOf(vinNumber) === -1) {
            //dengxun
            vinTrack[vinNumber] = [];
            var preguid = '';
            for (var j = 0; j < currentTrackData[vinNumber].length; j++) {
                var guid = earth.Factory.CreateGuid();
                needAddTrack.push(guid);
                vinTrack[vinNumber].push(guid);
                trackVin[guid] = vinNumber;
                //这里看一下
                var thisTrackData = currentTrackData[vinNumber][j];
                var firstTrackData = currentTrackData[vinNumber][0];
                var time = thisTrackData[0][3]-firstTrackData[0][3];
                trackIndexInGroup[guid] = {'index':j,'preguid':preguid,'time':time};//只能在这里更新，因为需要guid
                preguid = guid;
            }
        }
        else{
            //dengxun
            //前后20秒都有的车辆，删除该车辆前20s的track，但保留一个track，作为下一个20s的第一个track
            var oldTrackNum = vinTrack[vinNumber].length;
            var currentTrackNum = currentTrackData[vinNumber].length;
            if(oldTrackNum<1 || currentTrackNum<1){
                console.debug('异常，丢失轨迹信息');
            }
            var status = currentCarData[vinNumber][0];
            var oldStatus =  oldCarData[vinNumber][0];
            var saveOldLastGuid = true;
            if (oldStatus === "0" && status === "1") { //以前离线，现在在线
                saveOldLastGuid = false;
            }
            var leftGuid;//保留guid
            //删除track
            for (var j = 0; j < oldTrackNum; j++) {
                if(j===oldTrackNum-1){
                    if(saveOldLastGuid){
                       leftGuid = vinTrack[vinNumber][j]; 
                       continue;
                    }                    
                }
                var guid = vinTrack[vinNumber][j];
                needDeleteTrack.push(guid);
                delete trackVin[guid];
                delete trackIndexInGroup[guid];
            }
            //增加track
            vinTrack[vinNumber] = [];
            var preguid = '';
            for (var j = 0; j < currentTrackNum; j++) {
                var guid;
                if(j==0 && saveOldLastGuid){
                    guid = leftGuid;
                }
                else{
                    guid = earth.Factory.CreateGuid();
                    needAddTrack.push(guid);
                }
                vinTrack[vinNumber].push(guid);
                trackVin[guid] = vinNumber;
                var thisTrackData = currentTrackData[vinNumber][j];
                var firstTrackData = currentTrackData[vinNumber][0];
                var time = thisTrackData[0][3]-firstTrackData[0][3];
                trackIndexInGroup[guid] = {'index':j,'preguid':preguid,'time':time};
                preguid = guid;
            }
        }
    }

    //如果数据以前有轨迹，现在没有，则添加删除
    for (i = 0, len = oldVinNumbers.length; i < len; i++) {
        vinNumber = oldVinNumbers[i];
        if (vinNumbers.indexOf(vinNumber) === -1) {
            //dengxun
            for (var j = 0, len = vinTrack[vinNumber].length; j < len; j++) {
                guid = vinTrack[vinNumber][j];
                needDeleteTrack.push(guid);
                delete trackVin[guid];
                delete trackIndexInGroup[guid];
            }
            delete vinTrack[vinNumber];
            /*
            guid = vinTrack[vinNumber];
            needDeleteTrack.push(guid);
            delete vinTrack[vinNumber];
            delete trackVin[guid];*/
        }
    }
}



//显示轨迹，删除不存在的轨迹，和由于更新不需要的老轨迹，即向轨迹加点，页面的设置
function showTrack() {
    //删除轨迹
    //console.debug('needDeleteTrack删除轨迹：'+needDeleteTrack.length);
    deleteTracks(needDeleteTrack);

    tempCarData = oldCarData;
    tempTrackData = oldTrackData;
    oldTrackVin = trackVin;
    oldTrackIndexInGroup = trackIndexInGroup;
    oldVinTrack = vinTrack;              //用于操作
    oldVinNumbers = vinNumbers;          //用于更新轨迹
    oldGroupData = groupData;            //用于历史轨迹
    oldTrackData = currentTrackData;
    oldCarData = currentCarData;         //用于在生成轨迹之前对原有轨迹进行操作

    //页面遮盖隐藏，更改在线离线
    $("#currentCover").hide();
    $("#online").html("在线：" + online);
    $("#offline").html("离线：" + offline);

    //更新人称视角
    var trackId = oldVinTrack[chooseCar];
    if (trackId === undefined) {
        //viewPoint = 4;
        trackId = oldVinTrack[oldVinTrack[0]];
        earth.GPSTrackControl.SetMainTrack(trackId, viewPoint);
    } else {
        earth.GPSTrackControl.SetMainTrack(trackId, viewPoint);
    }


    addPoint();
    //更新气泡
    if (ballon != null) {
        ballon.InvokeScript("updateBallon", [oldGroupData, true, oldCarData, vinVisibility]);
    }
    //根据以前选择状态车辆显示，名称类型
    setTrackStatus();
}

// 给路径添加点
//情况一 点数大于三，直接添加
//情况二 点数小于三，以前没有轨迹，添加最后一个点
//情况三 在线，点数小于三，以前有轨迹，但是没有轨迹点，添加最后一个点
//情况四 在线，点数小于三，以前有轨迹，有轨迹点， 直接添加
function addPoint() {
    clearSpeedTimeout();
    var trackName, points, indexInGroup, track, oldStatus, status, pointNum, oldPointNum;
    var tempii1 = 0;
    var tempii2 = 0;
    for (var x in oldTrackVin) {  //198个
        trackName = oldTrackVin[x]; //"d1cb2f89-ffa4-4415-9cfa-e0ccfb93b24a"
        indexInGroup = oldTrackIndexInGroup[x]['index'];
        track = earth.GPSTrackControl.GetTrack(x);//"LSGKG8411J0990118"
        status = oldCarData[trackName][0];
        //dengxun
        points = oldTrackData[trackName][indexInGroup];
        pointNum = points.length;
        if (tempCarData[trackName] !== undefined) {
            oldStatus = tempCarData[trackName][0];
            oldPointNum = tempTrackData[trackName].length;
        }
        var point;
        var step = 0.0000000001;
        var interval;
        //点数大于三  9
        var time;
        if (pointNum >= 3) {
            var timeBias_per = timeBias/pointNum;
            for (var i = 0; i < pointNum; i++) {
                if(i===0){
                    if(trackLastTime[x] != undefined){
                        time = points[i][3] - trackLastTime[x];
                    }
                    else{
                        time = 1000;
                    }
                }else{
                    time = points[i][3] - points[i-1][3];
                }
                time+=timeBias_per;
                if(time<=0){
                    time = 1000;
                }
                addPointToTrack(track, points[i], time);
            }
        }
        else if (pointNum > 0){
            point = points[pointNum - 1];
            if(trackLastTime[x] != undefined){
                time = point[3] - trackLastTime[x];
            }
            else{
                time = 1000;
            }
            if(time<=0){
                time = 1000;
            }
            track.AddGPS(point[0] + step, point[1], point[2], time);
            track.AddGPS(point[0] + step*2, point[1], point[2], 1000);
            track.AddGPS(point[0] + step*3, point[1], point[2], 1000);
            track.Information = "0 km/h";
        }
        else{
            console.debug('wrong:轨迹点数小于1');
        }
    }
    //给trackLastTime赋值
    trackLastTime = {};
    for (var x in oldTrackVin) { 
        trackName = oldTrackVin[x]; //"d1cb2f89-ffa4-4415-9cfa-e0ccfb93b24a"
        indexInGroup = oldTrackIndexInGroup[x]['index'];
        points = oldTrackData[trackName][indexInGroup];
        pointNum = points.length;
        if(pointNum>0){
            var timeBias_per = timeBias/pointNum;
            if(pointNum>=3){
                trackLastTime[x] = points[pointNum-1][3]+timeBias_per;
            }
            else{
                //trackLastTime[x] = points[pointNum-1][3]+2000;
                trackLastTime[x] = points[pointNum-1][3];
            }
        }
        
    }

}

//根据以前选择状态车辆显示，名称类型
function setTrackStatus() {
    clearIndexTrackTimeout();
    vinTrackPlaying = {};
    var temp1 = 0;
    var temp2 = 0;
    var temp3 = 0;
    var temp4 = 0;
    for (var x in oldTrackVin) {
        var vinNumber = oldTrackVin[x];
        var trackStatus = oldCarData[vinNumber][0];
        var groupName = oldCarData[vinNumber][1];
        var groupColor = chooseColors[groupName];
        
        //var groupColor = colors[Math.floor(Math.random()*10)];
        var track = earth.GPSTrackControl.GetTrack(x);


        //剩下判断tag按钮和颜色
        //未设置或vinNumber
        if (tagName === "vinNumber" || tagName === undefined) {
            track.ShowName = true;
            track.ShowInfomation = false;
        }
        //无标签状态
        if (tagName === "none") {
            track.ShowName = false;
            track.ShowInfomation = false;
        }
        // 工程标签
        if (tagName === "testId") {
            track.ShowName = true;
            track.ShowInfomation = false;
            track.Name = oldCarData[vinNumber][5];
        }
        //工程标签
        if (tagName === "project") {
            track.ShowName = true;
            track.ShowInfomation = false;
            track.Name = oldCarData[vinNumber][3];
        }

        if(tagName === "speedProject"){
            track.ShowName = true;
            track.ShowInfomation = true;
            track.Name = oldCarData[vinNumber][3];
        }

        if(tagName === "speedCode"){
            track.ShowName = true;
            track.ShowInfomation = true;
            track.Name = oldCarData[vinNumber][6];
        }

        //groupColor = "FF6600";
        var trackColor = parseInt("0xff" + groupColor, 16);
        if (trackStatus === "1") {
            changeColor(vinNumber, trackColor);
            //dengxun
            var indexInGroup = oldTrackIndexInGroup[x];
            if(indexInGroup['index']>0){
                //创建变量副本
                doSetTimeout_track(vinNumber,indexInGroup,x);
                setSpeedTimeout2(track, vinNumber, indexInGroup['index']);
            }
            else{
                vinTrackPlaying[vinNumber] = x;
                var visible = onlineStatus;
                if(visible && vinVisibility[vinNumber] !== undefined){
                    visible = vinVisibility[vinNumber];
                }
                showHideTrack(x, visible);
                setSpeedTimeout2(track, vinNumber, 0);
                /*
                if(visible){
                    temp1++;
                }
                else{
                    console.debug('隐藏在线车辆：'+vinNumber+','+vinVisibility[vinNumber]);
                    temp2++;
                }*/
                //console.debug('显示轨迹：'+x);
            }
        } else {
            changeColor(vinNumber, 0xff999999);
            var visible = offlineStatus;
            if(visible && vinVisibility[vinNumber] !== undefined){
                visible = vinVisibility[vinNumber];
            }
            showHideTrack(x, visible);
            /*
            if(visible){
                temp3++;
            }
            else{
                temp4++;
            }*/
        }
    }
    //console.debug('地图实际显示：在线：显示'+temp1+',隐藏'+temp2+'离线：显示'+temp3+',隐藏'+temp4);
}

function doSetTimeout_track(vinNumber,indexInGroup,x){
    showHideTrack(x, false);
    var indexTrackTime = setTimeout(function () {
        showHideTrack(indexInGroup['preguid'], false);
        earth.GPSTrackControl.GetTrack(x).Play();
        vinTrackPlaying[vinNumber] = x;
        if(onlineStatus && vinVisibility[vinNumber]){
            showHideTrack(x, true);
        }
        else{
            console.debug('注意！下一条轨迹没有正确显示：'+vinNumber+','+onlineStatus+','+vinVisibility[vinNumber]+','+indexInGroup['time']);
        }
        //console.debug('切换同车轨迹：'+vinNumber+',时间为'+indexInGroup['time']);

    },indexInGroup['time']);
    trackIndexSetTimeArr.push(indexTrackTime);
}




//CURRENT 点击在线离线
function clickOnlineOffline(clickNode, line) {
    var trackId, trackName, status, x;
    var tii = 0;
    var show = false;
    if (clickNode.hasClass("on")) {
        //隐藏
        clickNode.removeClass("on");
        for (x in oldVinTrack) {
            if(oldCarData[x] != null) {
                status = oldCarData[x][0];
                if (status === line) {
                    vinVisibility[x] = false;
                    for (var i = 0; i <oldVinTrack[x].length; i++) {
                        showHideTrack(oldVinTrack[x][i], false)
                    }
                }
            }
        }
        if (line === "1") {
            onlineStatus = false;
        } else {
            offlineStatus = false;
        }
    } else {
        //显示
        show = true;
        clickNode.addClass("on");
        for (x in oldVinTrack) {
            if(oldCarData[x] != null){
                status = oldCarData[x][0];
                if (status === line) {
                    vinVisibility[x] = true;
                    for (var i = 0; i <oldVinTrack[x].length; i++) {
                        if(line === "1" && oldVinTrack[x].length>1){
                            //如果是显示在线车辆，则要特殊判断，只显示正在播放的唯一轨迹
                            if(vinTrackPlaying[x] === oldVinTrack[x][i])
                            {
                                showHideTrack(oldVinTrack[x][i], true)
                            }
                        }
                        else{
                            showHideTrack(oldVinTrack[x][i], true)
                        }
                    }
                }
            }
        }
        if (line === "1") {
            onlineStatus = true;
        } else {
            offlineStatus = true;
        }
    }
    //更新气泡
    if (ballon != null) {
        ballon.InvokeScript("setOnOffStatus", [show,line]);
    }
}


//
function setSpeedTimeout(track, data, index) {
    if(index ===  undefined){
        index = 2;
    }

    var point = data[index];
    if(point === undefined){
        // track.Information = "0 km/h";
        return;
    }
    var time = point[3] - data[1][3];
    var speedTime = setTimeout(function () {
        track.Information = point[4] + " km/h";
    }, time);
    addSpeedSetTimeArr.push(speedTime);
    setSpeedTimeout(track, data, ++index);
}

//index:轨迹的序号，对同一辆车
function setSpeedTimeout2(track, vinNumber, index){
    var points = oldTrackData[vinNumber][index];
    track.Information = points[0][4] + " km/h";//轨迹上第一个点的速度作为tarck的初始显示速度
    //console.debug('初始速度:'+vinNumber+','+points[0][4] + " km/h");
    var startTime = oldTrackData[vinNumber][0][0][3];
    for (var i = 0; i <points.length; i++) {
        var timeSpan = points[i][3]-startTime;
        if(timeSpan%speedTimeBias==0 && timeSpan>0){
            //创建变量副本
            doSetTimeout_speed(track,points[i][4] + " km/h",timeSpan);
            //console.debug('创建速度定时器:'+vinNumber+','+timeSpan+','+points[i][4] + " km/h");
        }
    }
}

function doSetTimeout_speed(track,speed,timeSpan){
    var speedTime = setTimeout(function () {
        track.Information = speed;
    }, timeSpan);
    addSpeedSetTimeArr.push(speedTime);
}

function clearSpeedTimeout() {
    for(var j in addSpeedSetTimeArr){
        clearTimeout(addSpeedSetTimeArr[j]);
    }
}

function clearIndexTrackTimeout(){
    for(var j in trackIndexSetTimeArr){
        clearTimeout(trackIndexSetTimeArr[j]);
    }
    trackIndexSetTimeArr = [];
}

function getNowFormatDate() {
    var date = new Date();
    var seperator2 = ":";
    return date.getHours() + seperator2 + date.getMinutes()+ seperator2 + date.getSeconds();;
}



//树上点击隐藏车辆
function hideVinTree(vinNumber) {
    for (var i = 0; i <oldVinTrack[vinNumber].length; i++) {
        showHideTrack(oldVinTrack[vinNumber][i], false)
    }
    vinVisibility[vinNumber] = false;
}

//树上点击显示车辆
function showVinTree(vinNumber) {
    var tracklen = oldVinTrack[vinNumber].length;  
    for (var i = 0; i <tracklen; i++) {
        if(tracklen>1){
            //如果多条轨迹，只显示正在播放的唯一轨迹
            if(vinTrackPlaying[vinNumber] === oldVinTrack[vinNumber][i])
            {
                showHideTrack(oldVinTrack[vinNumber][i], true)
            }
        }
        else{
            showHideTrack(oldVinTrack[vinNumber][i], true)
        }
    }
    vinVisibility[vinNumber] = true;
}

//树上点击改变车辆颜色
function changeColor(vinNumber, color,groupName,colorNumber) {
    chooseColors[groupName] = colorNumber;
    for (var i = 0; i <oldVinTrack[vinNumber].length; i++) {
        var trackId = oldVinTrack[vinNumber][i];
        var track = earth.GPSTrackControl.GetTrack(trackId);
        track.NameColor = color;
        track.InformationColor = color;
    }
}

//树上点击改变视角
function clickView(carView) {
    viewPoint = carView;
    if (chooseCar === undefined) {
        chooseCar = oldVinNumbers[0];
    }
    var trackId = oldVinTrack[chooseCar];
    earth.GPSTrackControl.SetMainTrack(trackId, viewPoint);
}

//树上点击选中车辆
function chooseCarClick(chooseVinNumber) {
    chooseCar = chooseVinNumber;
    for (var i = 0; i <oldVinTrack[chooseCar].length; i++) {
        var trackId = oldVinTrack[chooseCar][i];
        earth.GPSTrackControl.SetMainTrack(trackId, viewPoint);
    }                  
    
}

//树上点击选择标签
function changeTag(tagClass) {
    var track, x, vinNumber, tag, trackStatus;
    if (tagClass === "noTag") {
        if(tagName !== "none"){
            tagName = "none";
            for (x in oldTrackVin) {
                track = earth.GPSTrackControl.GetTrack(x);
                vinNumber = oldTrackVin[x];
                trackStatus = oldCarData[vinNumber][0];
                if (!vinVisibility[vinNumber]) {
                    continue;
                }
                if(track.ShowName){
                    track.ShowName = false;
                    track.ShowInfomation = false;
                }
            }
        }
    }
    else if (tagClass === "vinNumber") {
        if(tagName !== "vinNumber"){
            tagName = "vinNumber";
            for (x in oldTrackVin) {
                vinNumber = oldTrackVin[x];
                trackStatus = oldCarData[vinNumber][0];
                track = earth.GPSTrackControl.GetTrack(x);
                tag = oldTrackVin[x];
                track.Name = tag;
                if (!vinVisibility[vinNumber]) {
                    continue;
                }
                track.ShowName = true;
                track.ShowInfomation = false;
            }
        }
    }
    else if (tagClass === "testId") {
        if(tagName !== "testId"){
            tagName = "testId";
            for (x in oldTrackVin) {
                vinNumber = oldTrackVin[x];
                trackStatus = oldCarData[vinNumber][0];
                track = earth.GPSTrackControl.GetTrack(x);
                vinNumber = oldTrackVin[x];
                if (oldCarData[vinNumber] === undefined) {
                    console.log(vinNumber);
                    console.log(oldCarData);
                } else {
                    tag = oldCarData[vinNumber][5];
                    track.Name = tag;
                }
                if (!vinVisibility[vinNumber]) {
                    continue;
                }
                track.ShowName = true;
                track.ShowInfomation = false;

            }
        }
    } else if (tagClass === "project") {
        if(tagName !== "project"){
            tagName = "project";
            for (x in oldTrackVin) {
                vinNumber = oldTrackVin[x];
                trackStatus = oldCarData[vinNumber][0];
                track = earth.GPSTrackControl.GetTrack(x);
                vinNumber = oldTrackVin[x];
                if (oldCarData[vinNumber] === undefined) {
                    console.log(vinNumber);
                    console.log(oldCarData);
                } else {
                    tag = oldCarData[vinNumber][3];
                    track.Name = tag;
                }
                if (!vinVisibility[vinNumber]) {
                    continue;
                }
                track.ShowName = true;
                track.ShowInfomation = false;

            }
        }
    }else if(tagClass === "speedProject"){
        if(tagName !== "speedProject"){
            tagName = "speedProject";
            for (x in oldTrackVin) {
                vinNumber = oldTrackVin[x];
                trackStatus = oldCarData[vinNumber][0];
                track = earth.GPSTrackControl.GetTrack(x);
                vinNumber = oldTrackVin[x];
                if (oldCarData[vinNumber] === undefined) {
                } else {
                    tag = oldCarData[vinNumber][3];
                    track.Name = tag;
                }
                if (!vinVisibility[vinNumber]) {
                    continue;
                }

                track.ShowName = true;
                track.ShowInfomation = true;

            }
        }
    }else if(tagClass === "speedCode"){
        if(tagName !== "speedCode"){
            tagName = "speedCode";
            for (x in oldTrackVin) {
                vinNumber = oldTrackVin[x];
                trackStatus = oldCarData[vinNumber][0];
                track = earth.GPSTrackControl.GetTrack(x);
                vinNumber = oldTrackVin[x];
                if (oldCarData[vinNumber] === undefined) {
                    console.log(vinNumber);
                    console.log(oldCarData);
                } else {
                    tag = oldCarData[vinNumber][6];
                    track.Name = tag;
                }
                if (!vinVisibility[vinNumber]) {
                    continue;
                }

                track.ShowName = true;
                track.ShowInfomation = true;

            }
        }
    }
}


//树上获取在线离线按钮状态
function getOnOffStatus(type) {
    if(type==1){
        return onlineStatus;
    }
    return offlineStatus;
}





