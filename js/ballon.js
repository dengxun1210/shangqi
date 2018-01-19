/**
 * Created by Administrator on 2017/12/28.
 */
var colors = [
    '009911', '993300', '339393', '000080', '333399', '399339', '800000', 'FF6600',
    '808000', '008000', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900',
    '99CC00', '339966', '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00',
    'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0', 'FF99CC', 'FFCC99',
    'FFFF99', 'CCFFFF', '99CCFF', 'FFFFFF'
];
//组选的颜色
var chooseColors = {};
//车隐藏与否,和checkbox一致
var carHideOrNot = {};
//组隐藏与否
var groupHideOrNot = {};
//组背景颜色
var groupBackGroudColors = {};
//组打开与否
var groupOpen = {};
//车辆在线与否
var carOnlineOrNot = {};


//选择历史车辆
var historyTracks = [];


var m_parentFun;
var m_chooseCar = null; //单击选中的车

function main(obj) {
    m_parentFun = obj.funs;
    //makeColorTable();
    pageClick();
}
//页面事件
function pageClick() {
    //点击视角
    $(".car-view .fa").click(function () {
        var viewtype = $(this).next().html();
        if(viewtype != '自由视角' && m_chooseCar == null){
            alert('请先选择车辆');
            return;
        }
        var addClass = "fa-dot-circle-o";
        var removeClass = "fa-circle-o";
        if(!$(this).hasClass(addClass)){
            $(this).addClass(addClass).removeClass(removeClass)
                .parent().siblings().find("."+addClass).addClass(removeClass).removeClass(addClass);
            switch(viewtype){
                case '自由视角':
                    m_parentFun.clickView(4);
                    break;
                case '第一人称':
                    m_parentFun.clickView(1);
                    break;
                case '追踪':
                    m_parentFun.clickView(3);
                    break;
                default:break;
            }
        }
    });

    //点击标签框
    $("#chooseTag").click(function () {
        if(m_parentFun != null){
            $("#tagDetail").toggle();
        }
    });

    //点击标签
    $("#tagDetail span").click(function () {
        var chooseTag = $(this).html();
        $(this).parent().hide();
        $("#chooseTag span:nth-child(1)").html(chooseTag);
        m_parentFun.changeTag($(this).attr("id"));
    });

    $("#tagDetail").mouseleave(function () {
        $(this).hide();
    });

    //点击选择框效果
    $(".checkboxInput").click(function () {
        $(this).find("i:nth-child(2)").toggle();
    });
    /*
    //点击组选择框效果
    $(".group-node .checkboxInput").click(function () {
        var groupDis = $(this).find("i:nth-child(2)").css("display");
        console.debug(groupDis);
        var childCheck = $(this).parent().next().find("i:nth-child(2)");
        console.debug(childCheck);
        var groupNode = $(this).parent().parent();
        console.debug(groupNode);
        if(groupDis === "none"){
            groupNode.addClass("uncheck");
            childCheck.hide();
        }else{
            groupNode.removeClass("uncheck");
            childCheck.show();
        }
    });*/

    



    //点击搜索框搜索
    $("#searchCar").click(function () {
        var searchStr = $(this).next().val();
        var carNodes = $(".child-node span:first-child");
        var carNode,carVin, i, len;
        //console.debug('查询共计：'+carNodes.length);
        $(".childs-node").show();
        if(searchStr !== ""){
            for(i=0, len= carNodes.length; i<len; i++){
                carNode = $(carNodes[i]);
                carNode.parent().show();
                carVin = carNode.html();
                if(carVin.indexOf(searchStr.toUpperCase()) === -1){
                    carNode.parent().hide();
                }
            }
        }
        else{
            for(i=0, len= carNodes.length; i<len; i++){
                carNode = $(carNodes[i]);
                carNode.parent().show();
            }
        }
    });

    $("#searchValue").on("input propertychange",function () {
        var searchStr = $(this).val();
        console.debug(searchStr);
        var carNodes = $(".child-node span:first-child");
        var carNode,carVin, i, len;
        //console.debug('查询共计：'+carNodes.length);
        $(".childs-node").show();
        if(searchStr !== ""){
            for(i=0, len= carNodes.length; i<len; i++){
                carNode = $(carNodes[i]);
                carNode.parent().show();
                carVin = carNode.html();
                if(carVin.indexOf(searchStr.toUpperCase()) === -1){
                    carNode.parent().hide();
                }
            }
        }
        else{
            for(i=0, len= carNodes.length; i<len; i++){
                carNode = $(carNodes[i]);
                carNode.parent().show();
            }
        }
    });

    
}

//制作颜色板
function makeColorTable() {
    var colorSpans = $(".colors span");
    for(var i=0, len = colorSpans.length; i<len; i++){
        $(colorSpans[i]).css({background: "#"+colors[i]});
    }
}


//////////////dengxun
//每20s，主页面数据更新后，刷新气泡数据
//[oldGroupData, true, oldCarData]
function updateBallon(obj){
    $(".wrapper .car-tree .tree-body").empty().initTreeList(obj[0], obj[1], obj[2], obj[3]);
}





jQuery.fn.initTreeList = function(groupData, needColor, carData, vinVisibility){

    var colorTable;
    if(needColor && needColor!== undefined){
        colorTable = "colorTable"
    }else{
        colorTable = "off";
    }
    var color,x, y, z;
    var lbl,choosed;
    var choosedStay = false;


    //添加节点
    var treeNodes = $("<div class='ownTree'></div>");
    var i = 0;
    for(x in groupData){
        if(chooseColors[x] === undefined){
            chooseColors[x] = colors[i++];
        }
        if(groupBackGroudColors[x] === undefined){
            groupBackGroudColors[x] = "#eee";
        }
        if(groupOpen[x] === undefined){
            groupOpen[x] = false;
        }
    }
    for(x in groupData){       
        var childContainer = $("<div class='childs-node'></div>");
        var oneGroup = groupData[x];
        var f_groupShow = false;//重新计算group的checkbox是否打勾
        for(y in oneGroup){
            var vinName = oneGroup[y];           
            if(carHideOrNot[vinName] === undefined){
                if(vinVisibility[vinName]){
                    carHideOrNot[vinName] = "";
                    f_groupShow = true; 
                }
                else{
                    carHideOrNot[vinName] = "uncheck";
                }
            }
            else if(carHideOrNot[vinName] === ""){
                f_groupShow = true;
            }
            if(carData[vinName][0] === "1"){
                color = "online";
                lbl = "在线";
                carOnlineOrNot[vinName] = "green";
            }else{
                color = "offline";
                lbl = "离线";
                carOnlineOrNot[vinName] = "red";
            }


            if(vinName===m_chooseCar){
                choosed = 'choosed';
                choosedStay = true;
            }
            else{
                choosed = '';
            }
            var childNode = $("<div class='child-node "+color+" "+choosed+" "+carHideOrNot[vinName]+"'><span class='trackName'>"+vinName+"</span><span class='carStatus'>（"+lbl+"）</span><span class='checkboxInput fa-stack fa-lg'><i class='fa fa-square-o fa-stack-1x'></i><i class='fa fa-check fa-stack-1x'></i></span></div>");
            childContainer.append(childNode);
        }

        var groupColor = chooseColors[x];
        var groupBackGroudColor = groupBackGroudColors[x];
        groupHideOrNot[x] = f_groupShow?"":"uncheck";
        var groupNode = $("<div class='group'><div class='group-node "+groupHideOrNot[x]+"'><span></span><span class='"+colorTable+"' style='background:#"+groupColor+"'></span><span class='groupName'>"+x+"</span><span class='checkboxInput fa-stack fa-lg'><i class='fa fa-square-o fa-stack-1x'></i><i class='fa fa-check fa-stack-1x'></i></span></div></div>");


        groupNode.append(childContainer);
        $(this).append(groupNode);
    }
    var colorNode = $("<div class='colors'><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>");
    $(this).append(colorNode);
    makeColorTable();

    if(!choosedStay){
        //被选中的车辆从info表移除了，也不再出现在树上
        m_chooseCar = null;
    }

    //将之前close的group关闭
    var groupsDom = $(this).find(".groupName");
    for(var g = 0;g < groupsDom.length;g++){
        var groupName = $(groupsDom[g]).html();
        if(!groupOpen[groupName]){
            $(groupsDom[g]).parent().next().toggle();
        }
    }
    //点击组名，子节点伸缩
    $(this).off("click").on('click','.groupName', function () {
        $(this).parent().next().toggle();
        var groupName = $(this).html();
        groupOpen[groupName] = !groupOpen[groupName];
    });

    
    //车辆组点击显示隐藏车辆
    $(this).on('click', '.group-node .checkboxInput', function(){
        var groupDis = $(this).find("i:nth-child(2)").css("display");
        var groupName = $(this).parent().find(".groupName").html();
        //var carGroup = groupData[groupName];
        //var groupNode = $(this).parent().parent();
        var groupNode = $(this).parent();
        var carNodes = $(this).parent().parent().find(".trackName");
        if(groupDis === "inline-block"){
            //隐藏
            groupHideOrNot[groupName] = "uncheck";
            groupNode.addClass("uncheck");
            for(var i=0;i<carNodes.length;i++){
                var vinName = $(carNodes[i]).html();
                $(carNodes[i]).parent().addClass("uncheck");
                hideTrack(vinName);
            }
        }else{
            //显示
            var f_ifaction = false;
            for(var i=0;i<carNodes.length;i++){
                var vinName = $(carNodes[i]).html();
                if((carOnlineOrNot[vinName] === "green" && m_parentFun.getOnOffStatus(1)) || (carOnlineOrNot[vinName] === "red" && m_parentFun.getOnOffStatus(2))){
                    console.debug(vinName);
                    $(carNodes[i]).parent().removeClass("uncheck");
                    showTrack(vinName);
                    f_ifaction = true;
                }
            }
            if(f_ifaction){
                //更新group的checkbox
                groupHideOrNot[groupName] = "";
                groupNode.removeClass("uncheck");
            }
        }
    });
    // 车辆点击显示隐藏车辆
    $(this).on('click', '.child-node .checkboxInput', function(){
        var checkStatus = $(this).find("i:nth-child(2)").css("display");
        var trackName = $(this).parent().find(".trackName").html();
        var vinNode = $(this).parent();
        var f_ifaction = false;
        if(checkStatus === "inline-block" || checkStatus === "block"){
            //隐藏            
            vinNode.addClass("uncheck");
            hideTrack(trackName);
            f_ifaction = true;
        }else{
            //显示
            if((carOnlineOrNot[trackName] === "green" && m_parentFun.getOnOffStatus(1)) || (carOnlineOrNot[trackName] === "red" && m_parentFun.getOnOffStatus(2))){
                vinNode.removeClass("uncheck");
                showTrack(trackName);
                f_ifaction = true;
            }
        }
        if(f_ifaction){
            //更新group的checkbox
            var groupName = $(this).parent().parent().parent().find(".groupName").html();
            var oneGroup = groupData[groupName];
            var f_groupShow = false;//重新计算group的checkbox是否打勾
            for(y in oneGroup){
                var vinName = oneGroup[y]; 
                if(carHideOrNot[vinName] === ""){
                    f_groupShow = true;
                }    
            }
            var groupNode = $(this).parent().parent().parent().find(".group-node");
            if(f_groupShow){
                groupHideOrNot[groupName] = "";
                groupNode.removeClass("uncheck");
            }
            else{
                groupHideOrNot[groupName] = "uncheck";
                groupNode.addClass("uncheck");
            }
        }
    });

    //点击全选
    $(".choose-all .checkboxInput").click(function () {
        var allCheck = $(this).find("i:nth-child(2)").css("display");
        var groupsDom = $(".groupName");
        if(allCheck === "none"){
            //隐藏
            for(var g = 0;g < groupsDom.length;g++){
                var groupName = $(groupsDom[g]).html();
                var groupNode = $(groupsDom[g]).parent();
                groupHideOrNot[groupName] = "uncheck";
                var carNodes = $(groupsDom[g]).parent().parent().find(".trackName");
                for(var i=0;i<carNodes.length;i++){
                    var vinName = $(carNodes[i]).html();
                    $(carNodes[i]).parent().addClass("uncheck");
                    hideTrack(vinName);
                }
                groupNode.addClass("uncheck");
            }
        }else{
            for(var g = 0;g < groupsDom.length;g++){
                var groupName = $(groupsDom[g]).html();
                var groupNode = $(groupsDom[g]).parent();
                var carNodes = $(groupsDom[g]).parent().parent().find(".trackName");
                var f_ifaction = false;
                for(var i=0;i<carNodes.length;i++){
                    var vinName = $(carNodes[i]).html();
                    if((carOnlineOrNot[vinName] === "green" && m_parentFun.getOnOffStatus(1)) || (carOnlineOrNot[vinName] === "red" && m_parentFun.getOnOffStatus(2))){
                        $(carNodes[i]).parent().removeClass("uncheck");
                        showTrack(vinName);
                        f_ifaction = true;
                    }
                }
                if(f_ifaction){
                    //更新group的checkbox
                    groupHideOrNot[groupName] = "";
                    groupNode.removeClass("uncheck");
                }
            }
        }
    });

    //    点击颜色标签打开颜色板
    var that;
    $(".colorTable").click(function (e) {
        that = $(this);
        var top = $(this).offset().top - 188;
        $(".colors").show().css({top: top});
    });
    //鼠标离开颜色板隐藏
    $(".colors").mouseleave(function () {
        $(this).hide();
    });
    //点击颜色板颜色变化
    $(".colors span").click(function () {
        var color = $(this).css("background-color");
        that.css({background: color});
        $(this).parent().hide();
        var groupName = $(that).parent().find(".groupName").html();
        var hexColor = colorToHex(color);
        var colorNumber = hexColor.split("#")[1];
        var trackColor = parseInt("0xff"+colorNumber, 16);
        chooseColors[groupName] = colorNumber;

        var carGroup = groupData[groupName];
        for(var x in carGroup){
            var vinNumber = carGroup[x];
            if(carOnlineOrNot[vinNumber] === "green"){
                m_parentFun.changeColor(vinNumber,trackColor,groupName,colorNumber);
            }
        }
    });

    //点击车辆名称，选中车辆，用于视角切换
    $(document).on("click", ".trackName",function () {
        if(m_parentFun != null){
            $(".child-node").removeClass("choosed");
            $(this).parent().addClass("choosed");
            m_parentFun.chooseCarClick($(this).html());
            m_chooseCar = $(this).html();
        }
    });
};






//////结束动态绑定//////

function hideTrack(vinNumber) {
    carHideOrNot[vinNumber] = "uncheck";
    m_parentFun.hideVinTree(vinNumber);
}

function showTrack(vinNumber) {
    carHideOrNot[vinNumber] = "";
    m_parentFun.showVinTree(vinNumber);
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

//主页面切换在线离线，更新tree
function setOnOffStatus(obj){
    var show = obj[0];
    var carNodes = obj[1] === "1"?$(".child-node.online"):$(".child-node.offline");
    for(var i=0;i<carNodes.length;i++){
        var vinNumber = $(carNodes[i]).find(".trackName").html();
        if(show){
            $(carNodes[i]).removeClass("uncheck");
            carHideOrNot[vinNumber] = "";
        }
        else{
            $(carNodes[i]).addClass("uncheck");
            carHideOrNot[vinNumber] = "uncheck";
        }
    }
    //更新group的checkbox
    var groupNodes = $(".group-node");
    for(var i=0;i<groupNodes.length;i++){
        var allCars = $(groupNodes[i]).parent().find(".child-node");
        var groupName = $(groupNodes[i]).find(".groupName").html();  
        var ifhide = true;
        for(var j=0;j<allCars.length;j++){
            if(!$(allCars[j]).hasClass("uncheck")){
                ifhide = false;
                break;
            }
        }
        if(ifhide){
            $(groupNodes[i]).addClass("uncheck");
            groupHideOrNot[groupName] = "uncheck";
        }
        else{
            $(groupNodes[i]).removeClass("uncheck");
            groupHideOrNot[groupName] = "";
        }

    }
    
}

