/**
 * Created by Administrator on 2017/8/4.
 */
/*info数据
* needColor是否在组名前加色彩板
* */
var colors = [
    '009911', '993300', '339393', '000080', '333399', '399339', '800000', 'FF6600',
    '808000', '008000', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900',
    '99CC00', '339966', '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00',
    'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0', 'FF99CC', 'FFCC99',
    'FFFF99', 'CCFFFF', '99CCFF', 'FFFFFF'
];
//组选的颜色
var chooseColors = {};
//车隐藏与否
var carHideOrNot = {};
//组隐藏与否
var groupHideOrNot = {};
//组背景颜色
var groupBackGroudColors = {};
//组打开与否
var groupOpen = {};
//车辆在线与否
var carOnlineOrNot = {};
//车辆是否选为历史车辆
var carHistory = {};
//车辆加减号颜色
var carPlusMinusColor = {};

//选择历史车辆
var historyTracks = [];
jQuery.fn.initTreeList = function(groupData, needColor, carData){

    var colorTable;
    if(needColor && needColor!== undefined){
        colorTable = "colorTable"
    }else{
        colorTable = "off";
    }
    var color,x, y, z;

    //添加节点
    var treeNodes = $("<div class='ownTree'></div>");
    var i = 0;
    for(x in groupData){
        if(chooseColors[x] === undefined){
            chooseColors[x] = colors[i++];
        }
        if(groupHideOrNot[x] === undefined){
            groupHideOrNot[x] = "inline-block";
        }

        if(groupBackGroudColors[x] === undefined){
            groupBackGroudColors[x] = "#eee";
        }
        if(groupOpen[x] === undefined){
            groupOpen[x] = false;
        }
    }
    for(x in groupData){
        var groupColor = chooseColors[x];
        var groupBackGroudColor = groupBackGroudColors[x];

        var groupPoint;
        var childShow;
        if(groupOpen[x]){
            groupPoint = "fa-sort-asc";
            childShow = "block";
        }else{
            groupPoint = "fa-sort-desc";
            childShow = "none";
        }
        var groupNode =
            $("<div class='group'>" +
                "<div class='group-node'>" +
                    "<span style='font-size: 15px' class='checkboxInput fa-stack fa-lg'><i class='fa fa-square-o fa-stack-1x'></i><i style='display: "+groupHideOrNot[x]+"' class='fa fa-check fa-stack-1x'></i></span>" +
                    "<span class='"+colorTable+"' style='background: #"+groupColor+"'></span>" +
                    "<span class='fa "+groupPoint+" child-toggle'></span>" +
                    "<span class='groupName' style='background: "+groupBackGroudColor+"'>"+x+"</span></div></div>");
        var childContainer =
            $("<div class='child-nodes' style='display: "+childShow+"'></div>");

        var oneGroup = groupData[x];
        for(y in oneGroup){
            var vinName = oneGroup[y];

            if(carHideOrNot[vinName] === undefined){
                carHideOrNot[vinName] = "inline-block";
            }

            if(carHistory[vinName] === undefined){
                carHistory[vinName] = "plus"
            }
            if(carPlusMinusColor[vinName] === undefined){
                carPlusMinusColor[vinName] = "black";
            }
            if(carData[vinName][0] === "1"){
                color = "green";
                carOnlineOrNot[vinName] = "green";
            }else{
                color = "red";
                carOnlineOrNot[vinName] = "red";
            }
            var childNode =
                $("<div class='child-node carInfo'>" +
                    "<span  style='font-size: 15px' class='checkboxInput fa-stack fa-lg'><i class='fa fa-square-o fa-stack-1x'></i><i  style='display: "+carHideOrNot[vinName]+"' class='fa fa-check fa-stack-1x'></i></span>" +
                    "<span class='fa fa-dot-circle-o' style='color:"+color+"'></span>" +
                    "<span class='trackName "+vinName+"'>"+vinName+"</span>" +
                    "<span class='addHistory fa fa-"+carHistory[vinName]+"' style='color:"+carPlusMinusColor[vinName]+"'></span></div>");
            childContainer.append(childNode);

        }
        groupNode.append(childContainer);
        treeNodes.append(groupNode);
    }

    //缩放
    $(this).off("click").on('click','.child-toggle', function () {
        $(this).toggleClass("fa-sort-desc");
        $(this).toggleClass("fa-sort-asc");
        $(this).parent().next().toggle();
        var groupName = $(this).parent().find(".groupName").html();
        if(groupOpen[groupName]){
            groupOpen[groupName] = false;
        }else{
            groupOpen[groupName] = true;
        }
    });
    //车辆组点击显示隐藏车辆
    $(this).on('click', '.group-node .checkboxInput', function(){
        var checkStatus = $(this).find(".fa-check").css("display");
        var groupName = $(this).parent().find(".groupName").html();
        var carGroup = groupData[groupName];
        if(checkStatus === "inline-block" || checkStatus === "block"){
            groupHideOrNot[groupName] = "none";
            for(x in carGroup){
                carHideOrNot[carGroup[x]] = "none";
                hideTrack(carGroup[x]);
            }
            $(this).find(".fa-check").css("display", "none");
            $(this).parent().next().find(".fa-check").css("display", "none");
            $(this).parent().find("span:last-child").css("background-color", "#eee");
        } else{
            groupHideOrNot[groupName] = "inline-block";
            for(x in carGroup){
                carHideOrNot[carGroup[x]] = "inline-block";
                showTrack(carGroup[x]);
            }
            $(this).find(".fa-check").css("display", "inline-block");
            $(this).parent().next().find(".fa-check").css("display", "inline-block");
            $(this).parent().find("span:last-child").css("background-color", "#eee");
        }
    });
    // 车辆点击显示隐藏车辆
    $(this).on('click', '.child-node .checkboxInput', function(){
        var checkStatus = $(this).find(".fa-check").css("display");
        var trackId = $(this).parent().attr("class").split(" ")[2];
        var trackName, totalNum, hideNum;
        var grandParentNode = $(this).parent().parent();
        var groupNode = grandParentNode.prev();
        var groupName = groupNode.find(".groupName").html();
        if(checkStatus === "inline-block" || checkStatus === "block"){
            trackName = $(this).parent().find(".trackName").html();
            carHideOrNot[trackName] = "none";
            hideTrack(trackName);
            $(this).find(".fa-check").css("display", "none");
            totalNum = $(this).parent().parent().find(".fa-check").length;
            hideNum = $(this).parent().parent().find(".fa-check:hidden").length;
            if(totalNum === hideNum){
                groupHideOrNot[groupName] = "none";
                groupNode.find(".fa-check").css("display", "none");
                groupNode.find("span:last-child").css("background-color", "#eee");
                groupBackGroudColors[groupName]  = "#eee";
            }else if(hideNum>0 && totalNum> hideNum){
                groupBackGroudColors[groupName] = "grey";
                groupNode.find("span:last-child").css("background-color", "grey");
            }
        }else{
            trackName = $(this).parent().find(".trackName").html();
            carHideOrNot[trackName] = "inline-block";
            showTrack(trackName);
            $(this).find(".fa-check").css("display", "inline-block");
            groupNode.find(".fa-check").css("display", "inline-block");
            groupHideOrNot[groupName] = "inline-block";
            totalNum = grandParentNode.find(".fa-check").length;
            hideNum = grandParentNode.find(".fa-check:hidden").length;
            if(hideNum>0 && totalNum> hideNum){
                groupBackGroudColors[groupName] = "grey";
                groupNode.find("span:last-child").css("background-color", "grey");
            }else if(hideNum === 0){
                groupBackGroudColors[groupName]  = "#eee";
                groupNode.find("span:last-child").css("background-color", "#eee");
            }
        }
    });

    //添加历史
    $(this).on('click', '.fa-plus', function () {
        var historyCarLen = historyTracks.length;
        if(historyCarLen === 5){
            return;
        }

        $(this).addClass("fa-minus");
        $(this).removeClass("fa-plus");
        var carName = $(this).prev().html();
        if(historyTracks.indexOf(carName) == -1){
            carHistory[carName] = "minus";
            historyTracks.push(carName);

            $(".history-car .tree-body").append("<div id='"+carName+"'><span>"+carName+"</span><span class='fa fa-minus-square-o' style='vertical-align: middle; margin-left: 5px'></span></span></div>")
        }

        if(historyTracks.length == 5){
            $(".tree-body .fa-plus").css("color", "grey");
            $(this).css("color","black");
            for(x in carPlusMinusColor){
                carPlusMinusColor[x] = "grey";
            }
            for(i = 0,len = historyTracks.length; i<len; i++){
                var carChooseVin = historyTracks[i];
                carPlusMinusColor[carChooseVin] = "black";
            }
        }
    });
    //去除历史
    $(this).on('click', '.fa-minus', function () {
        if(historyTracks.length == 5){
            $(".tree-body .fa-plus").css("color", "black");
            for(var x in carPlusMinusColor){
                carPlusMinusColor[x] = "black";
            }
        }
        $(this).removeClass("fa-minus");
        $(this).addClass("fa-plus");
        var carName = $(this).prev().html();
        var index = historyTracks.indexOf(carName);
        historyTracks.splice(index,1);
        carHistory[carName] = "plus";
        $(".history-car .tree-body #"+carName).remove();
    });

    //点击选中历史车辆去除历史
    $(".history-car .tree-body").on("click", ".fa-minus-square-o", function(){
        if(historyTracks.length == 5){
            $(".tree-body .fa-plus").css("color", "black");
            for(var x in carPlusMinusColor){
                carPlusMinusColor[x] = "black";
            }
        }
        $(this).parent().remove();
        var carName = $(this).prev().html();
        var index = historyTracks.indexOf(carName);
        historyTracks.splice(index, 1);
        carHistory[carName] = "plus";
        var listNode = $(".current-car .tree-body ."+carName).next();
        // console.log(listNode.html());
        // console.log(listNode.next().attr("class"));
        listNode.removeClass("fa-minus");
        listNode.addClass("fa-plus");
    });


    //点击出现调色板
    $(this).on('click', '.colorTable',function () {
        var top = $(this).offset().top;
        var left = $(this).offset().left;
        $(".choose-colors").css({
            top: top-20,
            left: left
        }).show();
        that = $(this).parent().parent().index()+1;
        return false;
    });

    $(document).click(function () {
        $(".choose-colors").hide();
    });

    if(colorTable === "colorTable"){
        var colorPanel = $("<div class='choose-colors'></div>");
        for(var i=0; i<36; i++){
            colorPanel.append("<span style='background: #"+colors[i]+"'></span>")
        }
        treeNodes.append(colorPanel);
    }
    $(this).append(treeNodes);

    var that;
    //点击调色板Stamp球上车辆标注变色
    $(this).on('click', '.choose-colors span',function () {
        var colors = $(this).css("background-color");
        var hexColor = colorToHex(colors);
        var colorNumber = hexColor.split("#")[1];
        var trackColor = parseInt("0xff"+colorNumber, 16);
        $(".group:nth-child("+that+") .group-node>span:nth-child(2)").css({"background-color": hexColor});
        var groupNode = $(".group:nth-child("+that+")");
        var groupName = groupNode.find(".groupName").html();
        var carGroup = groupData[groupName];
        chooseColors[groupName] = colorNumber;

        for(var x in carGroup){
            var vinNumber = carGroup[x];
            if(carOnlineOrNot[vinNumber] === "green"){
                changeColor(vinNumber,trackColor);
            }
        }
        $(this).parent().hide();
        return false;
    });

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

//    全选

    $(".choose-all").click(function () {
        $(".running-car .fa-check").css("display",'inline-block');
    });

//    查询
    $(".search-car input").keyup(function () {
        $(".running-car .child-nodes").show();
        var inputValue = $(this).val();
        var childNodes = $(".running-car .child-node span:nth-last-child(2)");
        var len = childNodes.length;
        for(var i = 0; i<len; i++){
            var childNodeStr = $(childNodes[i]).html();
            if(childNodeStr.indexOf(inputValue) === -1){
                $(childNodes[i]).parent().hide();
            }
            if(inputValue === ""){
                $(childNodes[i]).parent().show();
                $(childNodes[i]).parent().parent().hide();
            }
        }

    })

    $(".history-search-car input").keyup(function () {
        $(".historySidebar .child-nodes").show();
        var inputValue = $(this).val();
        var childNodes = $(".historySidebar .child-node span:nth-last-child(2)");
        var len = childNodes.length;
        for(var i = 0; i<len; i++){
            var childNodeStr = $(childNodes[i]).html();
            if(childNodeStr.indexOf(inputValue) === -1){
                $(childNodes[i]).parent().hide();
            }
            if(inputValue === ""){
                $(childNodes[i]).parent().show();
                $(childNodes[i]).parent().parent().hide();
            }
        }

    });
    
    function hideTrack(vinNumber) {
        /*
        var y, track, trackId;
        trackId = oldVinTrack[vinNumber];
        track = earth.GPSTrackControl.GetTrack(trackId);
        track.ShowName = false;
        track.ShowInfomation = false;
        earth.DynamicSystem.GetSphericalObject(track.BindObject).Visibility = false;*/
        m_parentFun.hideVinTree(vinNumber);
    }
    
    function showTrack(vinNumber) {
        m_parentFun.showVinTree(vinNumber);
        /*
        var y, track, trackId;
        trackId = oldVinTrack[vinNumber];
        track = earth.GPSTrackControl.GetTrack(trackId);
        track.ShowBindObject(true);
        earth.DynamicSystem.GetSphericalObject(track.BindObject).Visibility = true;
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
            track.ShowName = false;
            track.ShowInfomation = true;
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
        }*/
    }
    
    function changeColor(vinNumber, color) {
        var y, track, trackId;
        trackId = oldVinTrack[vinNumber];
        track = earth.GPSTrackControl.GetTrack(trackId);
        track.NameColor = color;
        track.InformationColor = color;
    }


};

