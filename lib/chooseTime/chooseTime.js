/**
 * Created by Administrator on 2017/8/23.
 */
function chooseTime() {
    var triggerNodeId;
    function initTimePage(id) {
        triggerNodeId = id;
        $(".chooseTime").show();
        var now = new Date();
        var currentMonth = now.getMonth()+1;
        $("#yearNum").html(now.getFullYear());
        $("#monthNum").html((currentMonth>9)?currentMonth:"0"+currentMonth);
        var pageFirstDay = getPageFirstDay(now);
        setPageDay(pageFirstDay);
    }
    function getPageFirstDay(time) {
        var pageFirstDay = time.setDate(1) - time.getDay() * 24 * 60 * 60*1000;
        return pageFirstDay;
    }
    function setPageDay(pageFirstDay) {
        var trIndex,tdIndex, tableDay, selector,tableMonth,tableDate,changingTime,tdNode;
        var curentTime = new Date(pageFirstDay);
        var currentMonth = curentTime.getMonth();
        var currentDate = curentTime.getDate();
        for(var i=0; i<42; i++){
            changingTime = new Date(pageFirstDay + i*24*60*60*1000);
            tableDay = changingTime.getDate();
            tableMonth = changingTime.getMonth();
            tableDate = changingTime.getDate();
            trIndex = Math.floor(i/7)+2;
            tdIndex = i%7+1;
            selector = ".chooseDay tr:nth-child("+trIndex+") td:nth-child(" + tdIndex + ")";
            tdNode = $(selector);
            tdNode.removeClass("notThisMonth");
            tdNode.html(tableDay);
            // console.log(tableMonth +" "+ currentMonth)
            if(currentDate == 1){
                if(tableMonth !== currentMonth){
                    tdNode.addClass("notThisMonth");
                }
            }else{
                if(tableMonth !== currentMonth+1){
                    tdNode.addClass("notThisMonth");
                }
            }

            if(tableMonth == 0 && currentMonth == 11){
                tdNode.removeClass("notThisMonth");
            }
        }
    }
    function setPageDayByMY() {
        var year = parseInt($("#yearNum").html());
        var month = parseInt($("#monthNum").html());
        var timeStamp = new Date(year+"/"+month+"/01");
        setPageDay(getPageFirstDay(timeStamp));
    }

    document.querySelectorAll("#dateTable")[0].onclick = function (event) {
        var day = parseInt(event.srcElement.innerHTML);
        var classes = event.srcElement.classList;
        if(!isNaN(day)){
            var year = parseInt($("#yearNum").html());
            var month = parseInt($("#monthNum").html());
            if(classes == "notThisMonth"){
                if(day<=14){
                    month++;
                }

                if(day>14){
                    month--;
                }
            }

            if(month<10){
                month = "0"+ month;
            }

            if(day<10){
                day = "0"+ day;
            }

            var time = year+"-"+month+"-"+day;
            if(triggerNodeId == "startDayIcon"){
                var endDayNodeStr = $("#endDayIcon").prev().val();
                var endDay = (new Date(endDayNodeStr))*1;
                var startDay = (new Date(time))*1;

                if(startDay>endDay){
                    $("#"+triggerNodeId).prev().val(endDayNodeStr)
                }else{
                    $("#"+triggerNodeId).prev().val(time);
                }
            }

            if(triggerNodeId == "endDayIcon"){
                var startDayNodeStr = $("#startDayIcon").prev().val();
                var startDay = (new Date(startDayNodeStr))*1;
                var endDay = (new Date(time))*1;
                if(startDay>endDay){
                    $("#"+triggerNodeId).prev().val(startDayNodeStr)
                }else{
                    $("#"+triggerNodeId).prev().val(time);
                }
            }
        }
    }
    document.getElementById("nextYear").onclick = function () {
        var yearNode = $("#yearNum");
        var year = parseInt(yearNode.html()) +1;
        yearNode.html(year);
        setPageDayByMY();
    }
    document.getElementById("prevYear").onclick = function () {
        var yearNode = $("#yearNum");
        var year = parseInt(yearNode.html()) -1;
        yearNode.html(year);
        setPageDayByMY()
    }
    document.getElementById("nextMonth").onclick = function () {
        var yearNode = $("#yearNum");
        var monthNode = $("#monthNum");
        var month = parseInt(monthNode.html()) + 1;
        if(month<10 && month>0){
            month = "0"+month;
        }else if(month == 13){
            month = "01";
            var year = parseInt(yearNode.html()) +1;
            yearNode.html(year);
        }
        monthNode.html(month);

        setPageDayByMY()
    }
    document.getElementById("prevMonth").onclick = function () {
        var yearNode = $("#yearNum");
        var monthNode = $("#monthNum");
        var month, year;
        month = parseInt(monthNode.html()) - 1;
        if(month<10 && month>0){
            month = "0"+month
        }else if(month<=0){
            month = 12+month;
            year = parseInt(yearNode.html()) -1;
            yearNode.html(year);
        }
        monthNode.html(month);
        setPageDayByMY();
    }
    $(".chooseTime").mouseleave(function () {
        $("#"+triggerNodeId).removeClass("on");
        $(this).hide();
    });
    var result = {};
    result.initTimePage = initTimePage;
    return result;
}