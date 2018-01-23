/**
 * Created by Administrator on 2017/8/16.
 */
var GPF = {
    //获得当前时间，格式yyyy-mm-dd hh:mm:ss
    getNowFormatDate: function (time) {
        if(time == undefined){
             time = new Date();
        }

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
        return formatTime;
    },

    hideTrack: function (trackId) {
        var track = earth.GPSTrackControl.GetTrack(trackId);
        track.ShowName = false;
        track.ShowInfomation = false;
        track.ShowBindObject(false);
    },

    showTrack: function (trackId) {
        var track = earth.GPSTrackControl.GetTrack(trackId);
        track.ShowName = true;
        track.ShowInfomation = true;
        track.ShowBindObject(true);
    },

    groupHideTracks: function (group) {
        var tracksLen = tracks.length;
        for (var i = 0; i < tracksLen; i++) {
            if (tracks[i].indexOf(group) !== -1) {
                this.hideTrack(tracks[i][0]);
            }
        }
    },

    groupShowTracks: function (group) {
        var tracksLen = tracks.length;
        for (var i = 0; i < tracksLen; i++) {
            if (tracks[i].indexOf(group) !== -1) {
                this.showTrack(tracks[i][0]);
            }
        }
    },

    groupChangeColor: function (group, color) {
        var tracksLen = tracks.length;
        for (var i = 0; i < tracksLen; i++) {
            if (tracks[i].indexOf(group) !== -1) {
                var track = earth.GPSTrackControl.GetTrack(tracks[i][0]);
                track.InformationColor = color;
            }
        }
    },
};




//CONFIG 加载动态模型列表
function loadDynamicModel() {

}

//COMMON 创建路径
function createTrack(trackIds, trackIndex, history) {
    //var tempvar = trackIds.length;
    if (trackIndex === undefined) {
        trackIndex = 0;
    }
    var trackId = trackIds[trackIndex];
    if(trackId === undefined){
        showTrack();
        //ifCreateTrack_temp = false;
        return;
    }
    var trackName = trackVin[trackId];
    var indexInGroup = trackIndexInGroup[trackId];
    /*
    if(trackName == null){
        console.debug('trackName为null');
    }
    if(indexInGroup == null){
        console.debug('indexInGroup为null');
    }
    
    if(history === "history"){
        trackName = historyTracks[trackIndex];
    }*/

    earth.DynamicSystem.LoadDynamicObject("1526dfbb-cd49-4038-885e-4ba976f25dd7");
    earth.Event.OnDocumentChanged = function (type, newGuid) {
        earth.Event.OnDocumentChanged = function () {};
        if (type === 2) {
            var track = earth.Factory.CreateGPSTrack(trackId, trackName);
            track.DataType = 3;
            /*
            if(trackName=="LSFAM11J3HA024040"){
             track.Visibility = true;
            }else{
            track.Visibility = false;}*/
            track.Visibility = true;
            track.ShowName = true;
            track.ShowInfomation = false;
            track.NameColor = 0xffffffff;
            track.Information = trackName;
            track.InformationColor = 0xffffffff;
            // track.InitFollowTrack(180, 15, 2, 1);
            track.BindObject = newGuid;
            track.ShowBindObject(true);
            track.HeightType = 0;
            if(indexInGroup['index']===0){
                track.Play();
            }
            //console.debug('创建track：'+trackIndex);
            createTrack(trackIds, ++trackIndex, history);
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
        //console.debug('删除轨迹'+i);
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

//COMMON 隐藏或显示显示一条轨迹
function showHideTrack(trackId, show) {
    var track = earth.GPSTrackControl.GetTrack(trackId);
    if(track === null){
        console.debug('注意！！车辆轨迹不存在:'+trackId+','+show);
        return;
    }
    if(tagName === undefined || tagName ==="vinNumber" || tagName === "testId" || tagName ==="project"){
        track.ShowName = show;
        track.ShowInfomation = false;
    }

    if(tagName === "speedProject" || tagName === "speedCode"){
        track.ShowName = show;
        track.ShowInfomation = show;
    }

    if(tagName === "noTag"){
        track.ShowName = false;
        track.ShowInfomation = false;
    }

    earth.DynamicSystem.GetSphericalObject(track.BindObject).Visibility = show;
}


//rgb颜色转换成hex颜色
function colorToHex(color) {
    var regexp = /[0-9]*/g;
    var items = color.match(regexp);
    var colorItem = [];
    var hexColor = "#";
    for(var i=0; i<3; i++){
        colorItem.push(items[4+i*3]);
        var colorItemNum = parseInt(colorItem[i]);
        (colorItemNum>15) ? (colorItem[i] =colorItemNum.toString(16)):(colorItem[i] ="0"+ colorItemNum.toString(16));
        hexColor += colorItem[i];
    }
    return hexColor;
}

//改变轨迹标注颜色
function changeColor(vinNumber, color) {
    var track, trackIds;
    trackIds = oldVinTrack[vinNumber];
    //dengxun
    for(var i=0; i<trackIds.length; i++){
        track = earth.GPSTrackControl.GetTrack(trackIds[i]);
        track.NameColor = color;
        track.InformationColor = color;
    }
}
//获取小于len的随机数
function getRanNum(len) {
    return Math.floor(len * Math.random());
}


function addPointToTrack(track, point, time) {
    if(time <= 0){
        return;
    }
    var step = 0.000000000001;
    if(samePosition[0] === point[0] && samePosition[1] === point[1]){
        samePositionAdd[0] = samePositionAdd[0] +step;
        track.AddGPS(samePositionAdd[0], samePositionAdd[1], samePosition[2], time);
    }else{
        samePosition[0] = point[0];
        samePosition[1] = point[1];
        samePosition[2] = point[2];
        samePositionAdd[0] = point[0];
        samePositionAdd[1] = point[1];
        track.AddGPS(point[0], point[1], point[2], time);
    }
}


function changeButtonStatus(ids, isAdd) {
    if(isAdd){
        for(var i=0, len = ids.length; i<len; i++){
            $("#"+ids[i]).addClass("disable");
        }
    }else{
        for(var i=0, len = ids.length; i<len; i++){
            $("#"+ids[i]).removeClass("disable");
        }
    }
}

