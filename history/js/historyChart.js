/**
 * Created by Administrator on 2017/12/31.
 */
// var earth, vins, ids, idVin, vinId, trackData, carData, startTime, endTime, hideTime, showTime;
//
// var historyChartPointer = 0;
// var datax = [];
// var historyChart;
// var realDataX =[];
// var historyChartOption;
// var histrorySetInterval;
// var trackSetTimeOut = [];
//
// var historyModels = [];
//
//
// var lastPoint = [];
// var pointTime = 0;
// var carChoose;
// var ballon;
// var speedCategory;
// var carView = 4;
// var chooseCar;
var nodeIp = "http://10.203.103.34:3000";
var earth;
var historyTracks;
var startTime;
var endTime;
var trackData = {};
var carData = {};
var colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff"];
var lineColors = ["ff0000", "00ff00", "0000ff", "ffff00", "00ffff"];
var historyLines =[];
var historyModels = [];


var lastPoint = [];
var pointTime = 0;

var trackIds = [];
var idVin = {};
var trackShowStatus = {};
var trackShowTime = {};
var trackHideTime = {};

var trackSetTimeOut = [];


var historyChart;
var historyChartOption;
var datax = [];
var realDataX = [];
var historyStartTime;
var historyEndTime;
var histrorySetInterval;
var historyChartPointer=0;

var carView = 4;
var chooseCar;


function main(obj) {
    earth = obj.earth;
    historyTracks = obj.historyTracks;
    startTime = obj.startTime;
    endTime = obj.endTime;
    var sqlTrack = createSql(startTime, endTime, historyTracks);
    var sqlCar = createSql(startTime, endTime, historyTracks, "car");
    $.ajax({
        type: "POST",
        url: nodeIp + "/getData",
        cache: false,
        data: {sql: sqlTrack},
        success: function (result) {
            setData(result);
            createLine();
            $.ajax({
                type: "POST",
                url: nodeIp + "/getData",
                cache: false,
                data: {sql: sqlCar},
                success: function (result1) {
                    for (var i = 0; i < result1.length; i++) {
                        var carInfo = result1[i];
                        var vinNumber = carInfo["VinNumber"];
                        if (carData[vinNumber] === undefined) {
                            carData[vinNumber] = [carInfo["GroupName"], carInfo["PatacId"], carInfo["TestId"]];
                        }
                    }
                    earth.DynamicSystem.ApplyDynamicList();
                    earth.Event.OnDynamicListLoaded = function (list) {
                        earth.Event.OnDynamicListLoaded = function () {};
                        createTrack();
                        pageClick();
                    }
                }
            });
        }
    });
}
//制作sql语句
function createSql(startTime, endTime, historyTracks, car) {
    var nowStamp = new Date().getTime() - 600000;
    var startDeadline = nowStamp - 172800000;
    //如果开始时间小于两天前，则设置成两天前
    // if (startTime < startDeadline) {
    //     startTime = startDeadline;
    // }
    //如果开始时间大于当前，则设置程半小时前
    if (startTime > nowStamp) {
        startTime = nowStamp - 1800000;
    }

    if (endTime < startDeadline) {
        endTime = startDeadline + 1800000;
    }
    var startTime1 = new Date(startTime);
    var startYear = startTime1.getFullYear();
    var startMonth = startTime1.getMonth() + 1;
    var startday = startTime1.getDate();
    var startDayStamp = new Date(startYear+"/"+startMonth+"/"+startday).getTime();

    var endTime1 = new Date(endTime);
    var endYear = endTime1.getFullYear();
    var endMonth = endTime1.getMonth() + 1;
    var endDay = endTime1.getDate();
    var endDayStamp = new Date(endYear +"/" +endMonth+"/"+endDay).getTime();
    var timeDistance = endDayStamp - startDayStamp;
    var dayNum = timeDistance/86400000;
    var tables = [];
    var i;
    for(i=0; i<dayNum+1; i++){
        var timeStamp = new Date(startDayStamp + 86400000*i);
        var yearStamp = timeStamp.getFullYear();
        var monthStamp = timeStamp.getMonth()+1;
        var dayStamp = timeStamp.getDate();
        var table = "trackhistory" + yearStamp + monthStamp + dayStamp;
        tables.push(table);
    }

    var sqlTable = [];
    var tablesLen = tables.length;
    if(tablesLen ===1){
        sqlTable.push("select * from "+tables[0]+" where SamplingTime>" +startTime +" and SamplingTime<=" +endTime+ " and ");
    }else{
        for(i=0; i<tablesLen; i++){
            if(i === 0){
                sqlTable.push("select * from "+tables[i]+" where SamplingTime>" +startTime + " and ")
            }
            else if(i === tablesLen-1){
                sqlTable.push("select * from "+tables[i]+" where SamplingTime<=" +endTime+ " and ")
            }
            else{
                sqlTable.push("select * from "+ tables[i]+" where ")
            }
        }
    }

    var sql="";
    var sqlTableLen = sqlTable.length;
    var historyTracksLen = historyTracks.length;
    for(i=0; i<sqlTableLen; i++){
        for(var j=0; j<historyTracksLen; j++){
            if(historyTracksLen === 1){
                sqlTable[i] += "VinNumber = '"+historyTracks[j]+"' order by SamplingTime asc ";
            }else{
                if(j===0){
                    sqlTable[i] += "(VinNumber = '"+historyTracks[j]+"' or ";
                }else if( j=== historyTracksLen-1){
                    sqlTable[i] += "VinNumber = '"+historyTracks[j]+"') order by SamplingTime asc ";
                }else{
                    sqlTable[i] += "VinNumber = '"+ historyTracks[j]+"' or ";
                }
            }
        }
        if(i === sqlTableLen-1){
            sql += sqlTable[i];
        }else{
            sql += sqlTable[i] + "union ";
        }
    }


    if (car === "car") {
        sql = "select * from vehicleinfo where ";
        for (i = 0, len = historyTracks.length; i < len; i++) {
            sql += "VinNumber='" + historyTracks[i] + "' ";
            if (i !== len - 1) {
                sql += "or "
            }

        }
        sql += "order by LastSamplingTime asc";
    }

    if(car === "track"){
        sql = "select * from track where ";
        for (i = 0, len = historyTracks.length; i < len; i++) {
            sql += "VinNumber='" + historyTracks[i] + "' ";
            if (i !== len - 1) {
                sql += "or "
            }
        }
        sql += "order by SamplingTime asc";
    }


    return sql;
}
//设置路径数据
function setData(result) {
    for (var i = 0, len = result.length; i < len; i++) {
        var point = result[i];
        var vinNumber = point["VinNumber"];
        var status = point["BK"];
        var lon = point["Longtitude"];
        var lat = point["Latitude"];
        var height = point["height"];
        var time = point["SamplingTime"];
        var speed = point["Speed"];
        if (i === 0) {
            historyStartTime = time;
        } else if (i === len - 1) {
            historyEndTime = time;
        }
        if (trackData[vinNumber] === undefined) {
            trackData[vinNumber] = [];
        }
        trackData[vinNumber].push([status, lon, lat, height, time, speed]);
    }
}
//制作轨迹线
function createLine() {
    for (var i = 0, len = historyTracks.length; i < len; i++) {
        var VinNumber = historyTracks[i];
        var points = trackData[VinNumber];
        if (points === undefined) {
            continue;
        }
        var line = earth.Factory.CreateElementLine(earth.Factory.CreateGUID(), "线");
        line.BeginUpdate();
        var v3s = earth.Factory.CreateVector3s();
        for (var j = 0, len1 = points.length; j < len1; j++) {
            var point = points[j];
            var vector = earth.Factory.CreateVector3();
            vector.X = point[1];
            vector.Y = point[2];
            vector.Z = point[3] + 1;
            v3s.AddVector(vector);
        }
        line.SetPointArray(v3s);
        line.LineStyle.LineColor = parseInt("0xff" + lineColors[i], 16);
        line.DrawOrder = i;
        line.LineStyle.LineWidth = 3;
        // lines.LineWidth =100;
        line.EndUpdate();
        earth.AttachObject(line);
        historyLines.push(line);
        line.Visibility = true;
    }
}

function createTrack(index) {
    if (index === undefined) {
        index = 0;
    }
    var trackName = historyTracks[index];
    if (trackName === undefined) {
        historySetTime();
        createHistoryChart();
        historyInterval();
        return;
    }
    var data = trackData[trackName];
    if (data === undefined) {
        createTrack(++index);
    } else {
        createTrackAct(trackName, data, 0, index);
    }
}

function createTrackAct(trackName, data, dataIndex, index) {
    earth.DynamicSystem.LoadDynamicObject("a2ffcac7-7d76-4627-99c3-312694a4488a");
    earth.Event.OnDocumentChanged = function (type, newGuid) {
        earth.Event.OnDocumentChanged = function () {
        };
        if (type === 2) {
            var guid = earth.Factory.CreateGuid();
            trackIds.push(guid);
            var track = earth.Factory.CreateGPSTrack(guid, trackName);
            track.DataType = 3;
            track.Visibility = false;
            track.ShowName = true;
            track.NameColor = 0xffffffff;
            track.BindObject = newGuid;
            track.ShowBindObject(true);
            track.HeightType = 0;
            // track.Play();
            var time = 1000;
            lastPoint = [];
            pointTime = 0;
            trackShowTime[guid] = data[dataIndex][4] - historyStartTime;
            if (trackShowStatus[trackName] === undefined) {
                trackShowStatus[trackName] = [];
            }
            idVin[guid] = trackName;
            trackShowStatus[trackName].push([guid, false]);
            for (var j = dataIndex, len = data.length; j < len; j++) {
                var point = data[j];
                var pointGetTime = point[4];
                //如果时间相等跳过加点
                if (pointTime !== pointGetTime) {
                    pointTime = pointGetTime;
                } else {
                    continue;
                }

                if (j !== dataIndex) {
                    time = pointGetTime - lastPoint[4];
                }

                if (point[0] === 0 && lastPoint[0] === 1) {
                    trackHideTime[guid] = pointGetTime - historyStartTime;
                    break;
                }


                track.AddGPS(point[1], point[2], point[3] + 1, time);
                lastPoint = point;
            }
            if (j === len) {
                createTrack(++index);
            }
            else {
                createTrackAct(trackName, data, j + 1, index);
            }
        }
    }
}

function createHistoryChart() {
    historyChart = echarts.init(document.getElementById('chart'));

    //确定表格横轴
    var date, hour, minute, second;
    var minTime = parseInt(historyStartTime/1000)*1000;
    var maxTime = parseInt(historyEndTime/1000)*1000;
    for(var i = minTime, len = maxTime; i<=len; i+=1000){
        date = new Date(i);
        hour = date.getHours();
        minute = date.getMinutes();
        second = date.getSeconds();
        datax.push(hour+":"+minute+":"+second);
        realDataX.push(i);
    }
    $(".text").append($("<div style='color: rgb(0, 255, 255);margin-bottom: 5px'>时间："+datax[0]+"</div>"));

    //确定表格纵轴
    var series = [];
    for(i=0,len = historyTracks.length; i<len; i++){
        var oneLine = {};
        var vinNumber = historyTracks[i];
        var data = trackData[vinNumber];
        var str = "";
        if(data === undefined){
            str = $("<div class='"+vinNumber+"' style='color: rgb(0, 255, 255); margin-bottom: 5px'>" +
                    "<div style='margin-right: 10px'><span style='display: inline-block; width: 12px; height: 12px; background: rgb(0, 255, 255); margin-right: 5px'></span>" +
                    "<span style='display: inline-block'>"+vinNumber+"</span></div>" +
                    "<div> 速度：无数据</div></div>");
            $(".text").append(str);
            continue;
        }else{
            str = $("<div class='"+vinNumber+"' style='color: rgb(0, 255, 255); margin-bottom: 5px'>" +
                    "<div style='margin-right: 10px'><span style='display: inline-block; width: 12px; height: 12px; background: "+colors[i]+"; margin-right: 5px'>" +
                    "</span><span>"+vinNumber+"</span></div>" +
                    "<div> 速度："+data[0][5]+"km/s</div></div>");
            $(".text").append(str);
        }
        oneLine.name =  vinNumber;
        oneLine.type = "line";
        oneLine.symbol = "none";
        oneLine.smooth = true;
        oneLine.sampling = "average";
        oneLine.itemStyle = {
            normal : {
                lineStyle:{
                    color:colors[i]
                }
            }
        };
        oneLine.data = [];
        for(var j =0,len1 = datax.length;j<len1; j++){
            oneLine.data.push(undefined);
        }
        for(j=0,len1 = data.length; j<len1; j++){
            var samplingTime = parseInt(data[j][4]/1000) * 1000;
            var index = realDataX.indexOf(samplingTime);
            oneLine.data[index] = data[j][5];
        }
        series.push(oneLine);
    }
    //生成图表
    historyChartOption = {

        xAxis: {
            data: datax,
            axisLine: {
                lineStyle: {
                    color: '#0ff'
                }
            }
        },
        yAxis: {
            axisLine: {
                lineStyle: {
                    color: '#0ff'
                }
            },
            splitNumber: 2
        },
        series: series,
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                start: 0,
                end: 30
            }
        ],
        grid: {
            left: "5%",
            right: "5%",
            top: "10%",
            bottom: "30%"
        }
    };

    // 使用刚指定的配置项和数据显示图表。
    historyChart.setOption(historyChartOption, true);
}


function historyInterval() {
    histrorySetInterval = setInterval(function () {
        var len = datax.length;
        if(historyChartPointer >= len){
            clearInterval(historyChartPointer);
            return;
        }
        $(".text>div:first-child").html("时间："+datax[historyChartPointer]);
        var datas = historyChartOption.series;

        for(var i=0,len1 = historyTracks.length; i<len1; i++){
            var vinNumber = historyTracks[i];
            if(trackData[vinNumber] === undefined){
                continue;
            }
            for(var j=0, len2 =datas.length; j<len2; j++){
                if(datas[j].name === vinNumber){
                    var data = datas[j].data;
                }
                var speedNum = data[historyChartPointer];
                var speed;
                if(speedNum === undefined){
                    speed = "无";
                }else{
                    speed  =  speedNum + "km/s";
                }
                $("."+vinNumber +" div:nth-child(2)").html("速度："+speed);
            }

        }

        var zoom = historyChart.getOption().dataZoom[0];
        var start = zoom.start;
        var end = zoom.end;
        var point = historyChartPointer / len * 100;
        var position;
        if (end === start) {
            position = 5 + "%";
        } else {
            position = (Math.abs((point - start) / (end - start))) * 90 +5 + "%";
        }
        if (point > start && point < end) {
            $("#pointer").css({left: position});
        } else if (point >= end) {
            $("#pointer").css({left: "95%"});
        } else if (point <= start) {
            $("#pointer").css({left: "5%"});
        }
        historyChartPointer++;
    } , 1000);
}

function historySetTime() {
    for(var x in trackShowStatus){
	console.log(x);
        var guids = trackShowStatus[x];
        for(var i=0, len = guids.length; i<len; i++){
	    console.log(guids[i]);
            var guid = guids[i][0];
            var time = trackShowTime[guid];
            console.log(time);
            startPlayTrack(guid, time, i, x);
        }
    }
}

function startPlayTrack(guid, time, i, x) {
    var trackTime = setTimeout(function () {
        var track = earth.GPSTrackControl.GetTrack(guid);
        track.Play();
        var vinNumber = idVin[guid];
        if(vinNumber === chooseCar){
            earth.GPSTrackControl.SetMainTrack(guid, carView);
        }
        trackShowStatus[x][i][1] = true;

        if(trackShowStatus[x][i-1] !== undefined){
            trackShowStatus[x][i-1][1] = false;
            var trackHide = earth.GPSTrackControl.GetTrack(trackShowStatus[x][i-1][0]);
            trackHide.Stop();
            trackHide.ShowName = false;
            trackHide.ShowInfomation = false;
            //earth.DynamicSystem.GetSphericalObject(track.BindObject).Visibility = false;
        }
    }, time);
    trackSetTimeOut.push(trackTime);
}

function pageClick() {
    window.onunload = function () {
        clearLines();
        clearModelIcon();
        deleteTracks(trackIds);
        clearInterval(histrorySetInterval);
        clearAppearTimeout();
    };

    $("#pauseTrack").click(function () {
        if($(this).hasClass("disable")){
            return false;
        }
        if($(this).hasClass("control")){
            $("#carView span").removeClass("disable");
            $("#mouseTrack").removeClass("disable");
            $("#stopTrack").removeClass("disable");
            $(this).html("暂停");
            $(this).removeClass("control");
            restoreAppearTimeout();
            showAllHistoryCar(false);
            historyInterval();
        }else{
            $("#carView span").addClass("disable");
            $("#mouseTrack").addClass("disable");
            $("#stopTrack").addClass("disable");
            $(this).html("播放");
            $(this).addClass("control");
            pauseAllHistoryCar(false);
            clearInterval(histrorySetInterval);
            clearAppearTimeout();
        }
    });

    $("#stopTrack").click(function () {
        if($(this).hasClass("disable")){
            return false;
        }
        if($(this).hasClass("control")){
            $(".text").empty();
            $("#carView span").removeClass("disable");
            $("#mouseTrack").removeClass("disable");
            $("#pauseTrack").removeClass("disable");
            $(this).html("停止");
            $(this).removeClass("control");
            createTrack();
            clearModelIcon();
        }else{
            $("#carView span").addClass("disable");
            $("#mouseTrack").addClass("disable");
            $("#pauseTrack").addClass("disable");
            $(this).html("开始");
            $(this).addClass("control");
            clearInterval(histrorySetInterval);
            // 生成模型、标注
            clearModelIcon();
            createModelIcon(historyChartPointer);
            historyChartPointer = 0;
            clearAppearTimeout();
            deleteTracks(trackIds);
            lastPoint = [];
            pointTime = 0;
            trackIds = [];
            idVin = {};
            trackShowStatus = {};
            trackShowTime = {};
            trackHideTime = {};
        }
    });
    $("#mouseTrack").click(function () {
        if($(this).hasClass("disable")){
            return false;
        }
        if($(this).hasClass("control")){
            $("#carView span").removeClass("disable");
            $("#stopTrack").removeClass("disable");
            $("#pauseTrack").removeClass("disable");
            $(this).html("鼠标跟踪定位");
            $(this).removeClass("control");
            restoreAppearTimeout();
            showAllHistoryCar(true);
            historyInterval();
            clearModelIcon();
            $("#chartCover").hide();
        }else{
            $("#carView span").addClass("disable");
            $("#stopTrack").addClass("disable");
            $("#pauseTrack").addClass("disable");
            $(this).html("停止鼠标跟踪");
            $(this).addClass("control");
            pauseAllHistoryCar(true);
            clearInterval(histrorySetInterval);
            clearAppearTimeout();
            createModelIcon(historyChartPointer);
            $("#chartCover").show();
        }
    });
    $("#chartCover").mousemove(function (event) {
        var position = event.pageX - $(this).offset().left + "px";
        $("#pointer").css({left: "calc(5% + " + position + ")"});
        var width = $(this).width();
        var zoom = historyChart.getOption().dataZoom[0];
        var index = Math.floor(datax.length * ((parseInt(position) / width) * (zoom.end - zoom.start) + zoom.start) / 100);
        var time = datax[index];
        $("#chartText>div:nth-child(2)").html("时间: " + time);
        var charData = historyChartOption.series;

        for (var i = 0, len = charData.length; i < len; i++) {
            var vinNumber = charData[i].name;
            var speed = charData[i].data[index];
            if (speed === undefined) {
                speed = "无"
            } else {
                speed += "km/s";
            }
            $("#" + vinNumber + " div:nth-child(2)").html(speed);
        }
        clearModelIcon();
        createModelIcon(index);
    });
    
    $("#tagChoose").click(function () {
        if($(this).hasClass("on")){
            $(this).removeClass("on");
            $("#tagDetail").hide();
        }else{
            $(this).addClass("on");
            $("#tagDetail").show();
        }
    });

    $("#tagDetail span").click(function () {
        $(this).parent().hide();
        var chooseTag = $(this).html();
        $("#tagChoose").removeClass("on").html(chooseTag);
        var tag = $(this).attr("id");
        changeTag(tag);
    });
    
    $("#carView span").click(function () {
        if($(this).hasClass("disable")){
            return false;
        }

        if(!$(this).hasClass("fa-dot-circle-o")){
            var index = $(this).index();
            if(index === 0){
                carView = 4;
            }else if(index ===1){
                carView = 1;
            }else{
                carView = 3;
            }

            if(index !== 0){
                $("#pauseTrack").addClass("disable");
                $("#stopTrack").addClass("disable");
                $("#mouseTrack").addClass("disable");
            }else{
                $("#pauseTrack").removeClass("disable");
                $("#stopTrack").removeClass("disable");
                $("#mouseTrack").removeClass("disable");
            }
            $(this).addClass("fa-dot-circle-o").removeClass("fa-circle-o").siblings().addClass("fa-circle-o").removeClass("fa-dot-circle-o");
            if(chooseCar === undefined){
                chooseCar = idVin[trackIds[0]];
            }


            for(var x in trackShowStatus){
                if(x === chooseCar){
                    var guids = trackShowStatus[x];
                    for(var i=0, len = guids.length; i<len; i++){
                        var guid = guids[i];
                        if(guid[1]){
                            earth.GPSTrackControl.SetMainTrack(guid[0], carView);
                        }
                    }
                }
            }
        }
    });

    $(".text").on('click', '>div:not(:first-child)',function () {
        chooseCar = $(this).attr("class");
        for(var x in trackShowStatus){
            if(x === chooseCar){
                var guids = trackShowStatus[x];
                for(var i=0, len = guids.length; i<len; i++){
                    var guid = guids[i];
                    if(guid[1]){
                        earth.GPSTrackControl.SetMainTrack(guid[0], carView);
                    }
                }
            }
        }
    });

}

//HISTORY 隐藏所有历史车辆
function pauseAllHistoryCar(isMouse) {
    for(var x in trackShowStatus){
        var guids = trackShowStatus[x];
        for(var i=0, len = guids.length; i<len; i++){
            var trackStatus = guids[i][1];
            if(trackStatus){
                var trackId = guids[i][0];
                var track = earth.GPSTrackControl.GetTrack(trackId);
                track.Pause();
                if (isMouse) {
                    track.ShowName = false;
                    earth.DynamicSystem.GetSphericalObject(track.BindObject).Visibility = false;
                }
            }
        }
    }
}

function clearAppearTimeout() {
    for(var i=0,len = trackSetTimeOut.length; i<len; i++){
        clearTimeout(trackSetTimeOut[i]);
    }
    trackSetTimeOut = [];
}

function restoreAppearTimeout() {
    for(var x in trackShowTime){
        var time = trackShowTime[x] - historyChartPointer*1000;
        if(time>0){
            var vinNumber = idVin[x];
            var guids = trackShowStatus[vinNumber];
            for(var i=0, len = guids.length; i<len; i++){
                if(x === guids[i]){
                    startPlayTrack(x, time, i, vinNumber);
                    break;
                }
            }
        }
    }
}

//HISTORY 显示所有历史车辆
function showAllHistoryCar(isMouse) {
    for(var x in trackShowStatus){
        var guids = trackShowStatus[x];
        for(var i=0, len = guids.length; i<len; i++){
            var trackStatus = guids[i][1];
            if(trackStatus){
                var trackId = guids[i][0];
                var track = earth.GPSTrackControl.GetTrack(trackId);
                track.Resume();
                if (isMouse) {
                    track.showName = true;
                    earth.DynamicSystem.GetSphericalObject(track.BindObject).Visibility = true;
                }
            }
        }
    }
}

//删除图表模型,模型文字，路径线
function clearModelIcon() {
    var i, len;
    for (i = 0, len = historyModels.length; i < len; i++) {
        earth.DetachObject(historyModels[i]);
    }
    historyModels = [];
}

//删除路径线
function clearLines() {
    for (i = 0, len = historyLines.length; i < len; i++) {
        earth.DetachObject(historyLines[i]);
    }
    historyLines = [];
}

//HISTORY 创建图标模型
function createModelIcon(index) {
    if(index === undefined){
        index = 0
    }
    var realTime = realDataX[index];
    for (var i = 0, len = historyTracks.length; i < len; i++) {
        var vinNumber = historyTracks[i];
        var points = trackData[vinNumber];
        if(points === undefined){
            continue;
        }
        var icon,guid, path, fileName, model;
        for(var j = 0, len1 = points.length; j<len1; j++){
            var point = points[j];
            var time = point[4];
            var timeStep = time - realTime;
            if(timeStep<2000 && timeStep>=0){
                var lat = point[2];
                var lon = point[1];
                var height = point[3];
                icon = earth.Factory.CreateElementIcon(earth.Factory.CreateGuid(), vinNumber);
                icon.Create(lon, lat, height, "", "", vinNumber);
                icon.MaxVisibleRange = 10000000;
                icon.minVisibleRange = 0;
                icon.visibility = true;
                icon.NormalIcon.IconIsClip = false;
                historyModels.push(icon);
                earth.AttachObject(icon);

                guid = earth.Factory.CreateGuid();
                path = earth.Environment.RootPath + "userdata\\4000008000\\\\mesh_60car.usb";
                fileName = "mesh_60car";
                model = earth.Factory.CreateEditModelByLocal(guid, fileName, path, 3);
                model.name = fileName;
                model.SphericalTransform.SetLocationEx(lon, lat, height);
                historyModels.push(model);
                earth.AttachObject(model);
                break;
            }
        }
    }
}

//COMMON 删除轨迹
function deleteTracks(data) {

    for (var i = 0, len = data.length; i < len; i++) {
        var track = earth.GPSTrackControl.GetTrack((data[i]));
        if(track == null){
            continue;
        }
        track.ShowInfomation = false;
        track.ShowName = false;
    }

    for (i = 0, len = data.length; i < len; i++) {
        deleteSingleTrack(data[i]);
    }
}

//COMMON 删除单一轨迹
function deleteSingleTrack(trackId) {
    var track = earth.GPSTrackControl.GetTrack(trackId);
    if(track === null){
        return;
    }
    track.Stop();
    earth.DynamicSystem.UnLoadDynamicObject(track.BindObject);
    earth.GPSTrackControl.DeleteTrack(trackId);
}
// var trackIndex = 0;


function changeTag(tag) {
    for(var x in idVin){
        var vinNumber = idVin[x];
        var track =  earth.GPSTrackControl.GetTrack(x);
        var carInfo = carData[vinNumber];
        if(tag === "noTag"){
            track.ShowName = false;
        }else if( tag === "vinNumber"){
            track.Name = vinNumber;
            track.ShowName = true;
        }else if(tag === "project"){
            track.Name = carInfo[1];
            track.ShowName = true;
        }else if(tag === "testId"){
            track.Name = carInfo[2];
            track.ShowName = true;
        }
    }
}


