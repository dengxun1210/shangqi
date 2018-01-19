function main(obj) {
    createTree(obj);
    pageClick(obj);
}
function createTree(obj) {
    for(var x in obj.carInfo){
        var str = $("<div class='group'><div class='group-node'><span></span><span class='groupName'>"+x+"</span></div><div class='childs-node'></div></div>");
        var cars = obj.carInfo[x];
        for(var i=0, len = cars.length; i<len; i=i+2){
            var carVin = cars[i];
            var carStatus = cars[i+1];
            var carStatusClass, carStatusStr;
            if(carStatus === "1"){
                carStatusClass="";
                carStatusStr = "在线"
            }else{
                carStatusClass = " offline";
                carStatusStr = "离线"
            }
            var className;
            if(obj.historyTracks.indexOf(carVin) === -1){
                className = "fa-plus-square-o";
            }else{
                className = "fa-minus-square-o";
            }
            str.find(".childs-node").append("<div class='child-node"+carStatusClass+" "+carVin+"'><span>"+carVin+"</span><span class='carStatus'>（"+carStatusStr+"）</span><span class='fa "+className+"'></span></div>");

        }
        $(".tree-body").append(str);

    }
    if(obj.historyTracks.length ===5){
        $(".tree-body .fa-plus-square-o").css({color: "grey"});
    }
    $(".fa-minus-square-o").parent().parent().show();

}

//页面事件
function pageClick(obj) {
    //点击组名，子节点伸缩
    $(".groupName").click(function () {
        $(this).parent().next().toggle();
    });

    //点击搜索框搜索
    $("#searchCar").click(function () {
        var searchStr = $(this).next().val();
        var carNodes = $(".child-node span:first-child");
        var carNode,carVin, i, len;
        if(searchStr !== ""){
            for(i=0, len= carNodes.length; i<len; i++){
                carNode = $(carNodes[i]);
                carNode.parent().show().parent().show();
                carVin = carNode.html();
                if(carVin.indexOf(searchStr.toUpperCase()) === -1){
                    carNode.parent().hide();
                }
            }
        }
        else{
            for(i=0, len= carNodes.length; i<len; i++){
                carNode = $(carNodes[i]);
                carNode.parent().show().parent().hide();
            }
        }
    });
    //添加去除轨迹
    $(".tree-body").on("click", function (event) {
        var clickNode = $(event.target);
        var vinNumber= clickNode.prev().prev().html();
        // 添加历史
        if(clickNode.hasClass("fa-plus-square-o")){
           if(obj.historyTracks.indexOf(vinNumber) === -1 && obj.historyTracks.length< 5){
               $("."+vinNumber+" span:last-child").addClass("fa-minus-square-o").removeClass("fa-plus-square-o");
               obj.historyTracks.push(vinNumber);
           }

           if(obj.historyTracks.length ===5){
               $(".tree-body .fa-plus-square-o").css({color: "grey"});
           }
           return false;
        }
        //去除历史
        if(clickNode.hasClass("fa-minus-square-o")){
            $("."+vinNumber+" span:last-child").addClass("fa-plus-square-o").removeClass("fa-minus-square-o");
            vinNumber = clickNode.prev().prev().html();
            var index = obj.historyTracks.indexOf(vinNumber);
            obj.historyTracks.splice(index, 1);
            if(obj.historyTracks.length === 4){
                $(".tree-body .fa-plus-square-o").css({color: "rgb(0, 255, 255)"});
            }
            return false;
        }
    });
}